function requestOtherUserAgentsChartData() {
    // initDatepicker(sendOtherUserAgentsRequest);
    var cookies = getCookie();
    work_daterangepicker.init_datepicker(cookies.start_date, cookies.end_date); // вставляем в календарь даты из cook, либо вчерашний –– позавчерашний день
    // TODO: костыль в будущем надо перейти на TREE по DOM
    getByID('main').insertAdjacentHTML('beforeEnd', '<div id="main_1" style="margin-top:20px;text-align:center"><button type="button" style="width:25%;font-size:140%;" class="btn btn-success">Get data</button></div>');
    getByID('main_1').onclick = sendOtherUserAgentsRequest;
}

function sendOtherUserAgentsRequest() {
    getByID('main_1').innerHTML = ''; // убираем кнопку
    // вешаем функцию на изменение даты
    work_daterangepicker.changed_datepicker(sendOtherUserAgentsRequest);

    setHighchartUseUTC(true);
    drawOtherUserAgentsChart();

    $('#table_other_user_agents').fadeOut(1000);

    var chart = $('#chart_other_user_agents').highcharts();
    chart.showLoading();

    var range = getDateRange();
    work_cookie.set_range(range); // добавляем в cookie диапазаон дат
    $.post('/api/other/user_agents',
           {
               startDate: range[0],
               endDate: range[1],
               mounts: JSON.stringify(getSelectedMounts())
           },
           function (result, textStatus, jqXHR) {
               var data = [];
               for (var i = 0; i < result.length; i++) {
                   var records = result[i].data.Records;
                   for (var j = 0; j < records.length; j++) {
                        var record = records[j];
                        var agent = normalizeUserAgent(record.agent);
                        if (data[agent]) {
                            data[agent] += record.count;
                        } else {
                            data[agent] = record.count;
                        }
                    }
               }

               var items = [];
               for (var key in data) {
                   var item = [];
                   item.push(key);
                   item.push(data[key]);
                   items.push(item);
               }

               chart.addSeries({
                   type: 'pie',
                   name: 'User agents',
                   data: items
               });

               chart.redraw();
               chart.hideLoading();

               drawOtherUserAgentsTable(result);
           }
          );
}

function drawOtherUserAgentsTable(result) {
    var items = [];
    for (var i = 0; i < result.length; i++) {
        var records = result[i].data.Records;
        var mountItem = result[i].mountItem;

        var data = [];
        for (var j = 0; j < records.length; j++) {
            var record = records[j];
            var agent = normalizeUserAgent(record.agent);
            if (data[agent]) {
                data[agent] += record.count;
            } else {
                data[agent] = record.count;
            }
        }
        items.push({Records:data, mountItem: mountItem});
    }
    var pdata = prepareFieldsForOtherUserAgentsTable(items);
    clearTableIfExist('#table_other_user_agents');
    loadOtherUserAgentsTable(pdata);
    $('#table_other_user_agents').fadeIn(1000);
}

function prepareFieldsForOtherUserAgentsTable(data) {
    var result = {};

    var columns = [];
    var dataSet = [];

    columns.push({ title: 'Agent', data: 'agent' });

    for (var p = 0; p < data.length; p++) {
        var item = data[p].mountItem;
        var name = 'total_' + item.mount_id;
        columns.push({ title: item.name, data: name, defaultContent: ''});

        var records = data[p].Records;
        if (dataSet.length === 0) {
            for (var key in records) {
                var count = records[key];
                var tableItem = {};
                tableItem.agent = key;
                tableItem[name] = count;
                tableItem.total = count;
                dataSet.push(tableItem);
            }
        } else {
            for (var k in records) { // k - agent
                var c = records[k]; // c - count

                var found = false;
                for (var m = 0; m < dataSet.length; m++) {
                    var agent = k;
                    if (dataSet[m].agent == agent) {
                        dataSet[m][name] = c;
                        dataSet[m].total += c;
                        found = true;
                        break;
                    }
                }

                if (!found) {
                    var tItem = {};
                    tItem.agent = k;
                    tItem[name] = c;
                    tItem.total = c;
                    dataSet.push(tItem);
                }
            }
        }
    }

    if (data.length > 1)
        columns.push({ title: 'Total', data: 'total' });

    result.columns = columns;
    result.dataSet = dataSet;
    return result;
}

function loadOtherUserAgentsTable(result) {
    var table = $('#table_other_user_agents').DataTable( {
        "order": [[ result.columns.length - 1, "desc" ]],
        data: result.dataSet,
        columns: result.columns,
        dom: domDefault(),
        buttons: dtButtons('UserAgents')
    } );

    dtAssignButtons(table);
}

function drawOtherUserAgentsChart(data) {
    $('#chart_other_user_agents').highcharts({
        chart: {
            type: 'pie',
            options3d: {
                enabled: true,
                alpha: 45,
                beta: 0
            }
        },
        title: {
            text: null
        },
		credits: {
			text: '',
		},
        tooltip: {
            pointFormat: '{series.name}: <b>{point.y}</b> {point.percentage:.3f}%'
        },
        plotOptions: {
            pie: {
                allowPointSelect: true,
                cursor: 'pointer',
                depth: 35,
                dataLabels: {
                    enabled: true,
                    format: '{point.name}'
                }
            }
        }
    });
}

function normalizeUserAgent(agent) {
    for (var key in known_agents) {
        if (agent.toLowerCase().indexOf(key.toLowerCase()) != -1)
            return known_agents[key];
    }
    return "N/A";
}

var known_agents= {
    "BASS" : "BASS",
    "TuneIn" : "TuneIn",
    "YaBrowser" : "Yandex Browser",
    "Chrome" : "Chrome",
    "Safari" : "Safari",
    "Mozilla" : "Mozilla",
    "AppleCoreMedia" : "iPhone, iPad, iPod",
    "Opera" : "Opera",
    "NSPlayer" : "NSPlayer",
    "MPlayer" : "MPlayer",
    "Icecast" : "Icecast",
    "Liquidsoap" : "Liquidsoap",
    "Radiocent" : "Radiocent",
    "Android" : "Android App",
    "Rush" : "RushPlayer",
    "Enigma" : "Enigma2",
    "Radio/628" : "Radio/628",
    "Radio%20Pro" : "Radio Pro",
    "EURRadio" : "EURRadio",
    "FRITZ/Mini" : "FRITZ/Mini",
    "RadioFree" : "RadioFree",
    "Darwin" : "Other iOS Apps",
    "VLC" : "VLC",
    "AIMP" : "AIMP",
    "Winamp" : "Winamp",
    "Windows-Media-Player" : "Windows Media Player",
    "iTunes" : "iTunes",
    "Internet%20Explorer" : "Internet Explorer",
    "ices" : "ices",
    "DuneHD" : "DuneHD",
    "foobar2000" : "foobar2000",
    "FMODEx" : "FMODEx",
    "Lavf" : "Lavf",
    "Curl" : "Curl",
    "libcurl" : "Curl",
    "FFmpeg" : "FFmpeg",
    "LG NetCast.TV" : "LG TV",
    "HTC Streaming Player" : "HTC Streaming Player",
    "ELinks" : "ELinks",
    "GStreamer souphttpsrc" : "GStreamer",
    "InettvBrowser" : "InettvBrowser",
    "XBMC" : "XBMC",
    "mpg123" : "mpg123",
    "curl" : "Curl",
    "AV_Receiver" : "AV Receiver",
    "Wget" : "Wget",
    "vlc" : "VLC",
    "Mediabolic" : "Mediabolic",
    "python-request" : "python-request",
    "RealtekVOD" : "RealtekVOD",
    "MTA:SA Server" : "MTA:SA Server",
    "HbbTV" : "HbbTV",
    "RealMedia" : "RealMedia",
    "Apache-HttpClient" : "Apache-HttpClient",
    "AvegaMediaServer" : "AvegaMediaServer",
    "Openglobe" : "Openglobe",
    "ParrotThirdApp" : "ParrotThirdApp",
    "APPlayer" : "APPlayer",
    "mhttplib/streamWriter" : "mhttplib/streamWriter",
    "RadioDeck" : "RadioDeck",
    "CorePlayer" : "CorePlayer",
    "LGE400/V10c Player/LG Player" : "LG Player 400/V10c",
    "WayForward" : "WayForward",
    "DLNADOC/1.00 Home Media Server" : "DLNADOC Home Media Server",
    "MetaURI API" : "MetaURI API",
    "App_Bitness" : "App Bitness",
    "Kodi" : "Kodi",
    "xine" : "Xine",
    "Java" : "Java",
    "-" : "N/A",
    "(null)" : "N/A",
    "U2FsdGVkX1" : "N/A",
    "HTC_One" : "HTC One",
    "INTEL_NMPR" : "INTEL NMPR",
    "WINAMP" : "Winamp",
    "LGCMF(LGP970)" : "LGCMF(LGP970)",
    "Apple iPhone OS" : "iPhone, iPad, iPod",
    "Music Player Daemon" : "MPD",
    "Audacious" : "Audacious",
    "Apple Mac OS X" : "Other iOS Apps",
    "Ares" : "Ares",
    "LeechCraft" : "LeechCraft",
    "radio.de" : "radio.de",
    "rad.io" : "rad.io",
    "MooTunes" : "MooTunes",
    "aStreamer" : "aStreamer",
    "FreeStreamer" : "FreeStreamer",
    "IMGPlayer" : "IMGPlayer",
    "RadioClicker Player" : "RadioClicker Player",
    "MrRecorder" : "MrRecorder",
    "radio.fr" : "radio.fr",
    "QuickTime" : "QuickTime",
    "Screamer Radio" : "Screamer Radio",
    "RadioTray" : "RadioTray",
    "libsoup" : "libsoup",
    "Movian PS3" : "Movian PS3",
    "Showtime" : "Showtime"
};
