var mSelectedMounts = [];
var mCurrentBootstrapTheme = user.theme;
var mPerviousBootstrapTheme = user.theme;

var mIsThemeDark             = false;
var mDefaultHighchartOptions = null;
var HCDefaults               = $.extend(true, {}, Highcharts.getOptions(), {});
// var CONTEXT                  = {};
// var log                      = console.log.bind(console);

// fix: if you want to keep Bootstrap declared after JQuery UI
var bootstrapButton = $.fn.button.noConflict(); // return $.fn.button to previously assigned value
$.fn.bootstrapBtn = bootstrapButton;            // give $().bootstrapBtn the Bootstrap functionality

$(function () {
    mDefaultHighchartOptions = Highcharts.getOptions();
    setBootstrapTheme(mCurrentBootstrapTheme);
    setHighchartUseUTC(true);
    updateMountsDropDown();
    enableSubmenu();
});

function enableSubmenu() {
    $('[data-submenu]').submenupicker();
}

function getTablesorterTheme() {
    if (mIsThemeDark) return "dark";
    return "bootstrap";
}

function initMountsDropDownEvents() {
    $( '#dropMountItems.dropdown-menu .mount_item' ).on( 'click', function( event ) {
        var $target = $( event.currentTarget ),
            permission_id = $target.attr( 'data-permission-id' ),
            mount_id = $target.attr( 'data-mount-id' ),
                $inp = $target.find( 'input' ),
                    idx;

        if (user.mounts_multiselect) {

            if ( ( idx = mSelectedMounts.indexOf( mount_id ) ) > -1 ) {
                mSelectedMounts.splice( idx, 1 );
                setTimeout( function() {
                    updatePermissionSelect(permission_id, false);
                    $inp.prop( 'checked', false );
                    refreshPageContent();
                }, 0);
            } else {
                mSelectedMounts.push( mount_id );
                setTimeout( function() {
                    updatePermissionSelect(permission_id, true);
                    $inp.prop( 'checked', true );
                    refreshPageContent();
                }, 0);
            }

        } else {

            $( '#dropMountItems.dropdown-menu .mount_item').each(function(index, element){
                var element_mount_id = $(element).attr('data-mount-id');
                var element_permission_id = $(element).attr( 'data-permission-id' );

                var cb = $(element).find('input');
                if (mount_id === element_mount_id) {
                    mSelectedMounts = [mount_id];
                    setTimeout( function() {
                        updatePermissionSelect(element_permission_id, true);
                        cb.prop( 'checked', true );
                        refreshPageContent();
                    }, 0);
                } else {
                    setTimeout( function() {
                        updatePermissionSelect(element_permission_id, false);
                        cb.prop( 'checked', false );
                    }, 0);
                }
            });

        }

        $( event.target ).blur();

        return false;
    });

    $('#dropMounts').on('hide.bs.dropdown', function () {
        if (mSelectedMounts.length > 0) {
            showListenersAndOther();
        } else
            hideListenersAndOther();
    });
}

function updatePermissionSelect(permission_id, checked) {
    $.post('/api/user/permission/select',
        { id: permission_id, selected: checked },
        function (data, textStatus, jqXHR) {}
    );
}

function showListenersAndOther() {
    $("#menuReports").show();
    $("#menuListeners").show();
    $("#menuOthers").show();
}

function hideListenersAndOther() {
    $("#menuReports").hide();
    $("#menuListeners").hide();
    $("#menuOthers").hide();
}

function getSelectedMounts() {
    var mounts = [];
    for (var i = 0; i < mSelectedMounts.length; i++) {
        var mount_id = mSelectedMounts[i];
        var mount = getSelectedMountById(mount_id);
        mounts.push(mount);
    }
    return mounts;
}

function getSelectedMountById(id) {
    var dropdownItem = $("#dropMountItems").find("[data-mount-id='" + id + "']");

    var hostname = dropdownItem.data("hostname");
    var mount = dropdownItem.data("mount");
    var mount_name = dropdownItem.data("mount-name");
    var station_url = dropdownItem.data("station-url");

    return {mount_id: id,
            mount: mount,
            name: mount_name,
            hostname: hostname,
            station_url: station_url};
}

function updateMountsDropDown() {
    $.post('/api/user/mount/list',
        { user_id: user.id },
        function (data, textStatus, jqXHR) {
            if (data.Records) {
                if (data.Records.length > 0) {
                    var elements = "";
                    mSelectedMounts = [];
                    var isAnySelected = false;
                    for(var i = 0; i < data.Records.length; i++) {
                        var mountItem = data.Records[i];
                        var selected = mountItem.selected;
                        if (!isAnySelected)
                            isAnySelected = selected;
                        var elem = '<li><a href="#" class="small mount_item" '+
                                'data-mount="' + mountItem.mount + '"' +
                                'data-mount-name="' + mountItem.name + '"' +
                                'data-mount-id="' + mountItem.mount_id + '"' +
                                'data-station-url="' + mountItem.station_url + '"' +
                                'data-hostname="' + getHostName(mountItem.hostname) + '"' +
                                'data-permission-id="' + mountItem.permission_id +'"' +
                             'tabIndex="-1">' +
                            '<input type="checkbox" ' + (selected ? "checked" : "") + '/>&nbsp;' + mountItem.name + '</a></li>';
                        if (selected)
                            mSelectedMounts.push(mountItem.mount_id.toString());
                        elements += elem;
                    }
                    $("#dropMounts").show();
                    $('#dropMountItems').html(elements);
                    initMountsDropDownEvents();
                    if (isAnySelected)
                        showListenersAndOther();
                    else
                        hideListenersAndOther();
                } else {
                    $("#dropMounts").hide();
                    hideListenersAndOther();
                }
            } else {
                hideListenersAndOther();
            }
        }
    );
}

function getHostName(url) {
    return url.substring(0, url.lastIndexOf('/'));
}

function setHighchartUseUTC(value) {
    Highcharts.setOptions({
        global: {
            useUTC: value,
        },
    });
}

function setBootstrapTheme(themeName) {
    $('#themecss').remove();
    $('#strapcss').remove();

    if (themeName === 'default') {
        $('head').append('<link id="strapcss" href="/css/bootstrap/bootstrap.min.css" type="text/css" rel="stylesheet"/>');
        $('head').append('<link id="themecss" href="/css/bootstrap/bootstrap-theme.min.css" type="text/css" rel="stylesheet"/>');
    } else {
        $('head').append('<link id="themecss" href="/css/bootstrap/themes/' + themeName + '/bootstrap.min.css" type="text/css" rel="stylesheet"/>');
    }

    mCurrentBootstrapTheme = themeName;
    if (mPerviousBootstrapTheme != mCurrentBootstrapTheme) {
        updateUserTheme();
        mPerviousBootstrapTheme = mCurrentBootstrapTheme;
    }
    switchHighchartTheme();
}

function updateUserTheme() {
    $.post('/api/user/settings/theme',
        { id: user.id, theme: mCurrentBootstrapTheme },
        function (data, textStatus, jqXHR) {}
    );
}

function switchHighchartTheme() {
    switch (mCurrentBootstrapTheme) {
        case 'cyborg':
            setHighchartThemeDark(true);
            $("#logo").attr("src", "/images/logo_gray.png");
            break;
        case 'slate':
            setHighchartThemeDark(true);
            $("#logo").attr("src", "/images/logo_white.png");
            break;
        case 'readable':
            setHighchartThemeDark(false);
            $("#logo").attr("src", "/images/logo_blue.png");
            break;
        default:
            resetHighchartOptions();
            $("#logo").attr("src", "/images/logo_white.png");
            break;
    }
}

function resetHighchartOptions() {
    if (mDefaultHighchartOptions && HCDefaults) {
        // Fortunately, Highcharts returns the reference to defaultOptions itself
        // We can manipulate this and delete all the properties
        for (var prop in mDefaultHighchartOptions) {
            if (typeof mDefaultHighchartOptions[prop] !== 'function') delete mDefaultHighchartOptions[prop];
        }
        // Fall back to the defaults that we captured initially, this resets the theme
        Highcharts.setOptions(HCDefaults);

        mIsThemeDark = false;

        setTimeout( function() {
            refreshPageContent();
        }, 100);
    } else {
        setHighchartThemeDark(false);
    }
}

function setHighchartThemeDark(dark) {
    mIsThemeDark = dark;
    if (dark) {
        $.getScript('/js/highcharts/themes/dark-unica.min.js', function() { refreshPageContent(); });
    } else {
        $.getScript('/js/highcharts/themes/sand-signika.min.js', function() {refreshPageContent(); });
    }
}

function refreshPageContent() {
    var chart_div = $("[id^=chart_]");
    if (chart_div) {
        var chart_id = chart_div.attr('id');
        switch (chart_id) {
            case 'chart_peak_listeners':
                sendPeakListenersRequest();
                break;
            case 'chart_listeners_when_start':
                sendListenersWhenStartRequest();
                break;
            case 'chart_listeners_when_stop':
                sendListenersWhenStopRequest();
                break;
            case 'chart_current_listeners':
                requestCurrentListenersChartData();
                break;
            case 'chart_same_time_listeners':
                sendSameTimeListenersRequest();
                break;
            case 'chart_uniq_listeners':
                sendUniqListenersRequest();
                break;
            case 'chart_map_by_country_listeners':
                sendMapByCountryListenersRequest();
                break;
            case 'chart_map_by_city_listeners':
                sendMapByCityListenersRequest();
                break;
            case 'chart_other_durations':
                sendOtherDurationsRequest();
                break;
            case 'chart_other_referers':
                sendOtherReferersRequest();
                break;
            case 'chart_other_user_agents':
                sendOtherUserAgentsRequest();
                break;
            case 'chart_aqh_listeners':
                sendAQHReportRequest();
                break;
            default:
                break;
        }
    }
    var table_div = $("table[id^=table_]");
    if (table_div) {
        var table_id = table_div.attr('id');
        switch (table_id) {
            case 'table_songs_ratio':
                sendOtherSongsRatioRequest();
                break;
            case 'table_report_tsl':
                sendTSLReportRequest();
                break;
        }
    }
}

function stopAnyIntervals() {
    stopCurrentListenersUpdateInterval();
}

function showHomePage() {
    stopAnyIntervals();

    $.get("/home",  function(data, status){
        $(".container").html(data);
    });
}

function showListenersWhenStartPage() {
    stopAnyIntervals();

    $.get("/listeners/when/start",  function(data, status){
        $(".container").html(data);
        requestListenersWhenStartChartData();
    });
}

function showListenersWhenStopPage() {
    stopAnyIntervals();

    $.get("/listeners/when/stop",  function(data, status){
        $(".container").html(data);
        requestListenersWhenStopChartData();
    });
}

function showPeakListenersPage() {
    stopAnyIntervals();
    // Вставка поля выбора дат и кракас для графиков и таблицы
    $.get("/listeners/peak",  function(data, status){
        $(".container").html(data);
        // вызываем peak.js
        requestPeakListenersChartData();
    });
}

function showSameTimeListenersPage() {
    stopAnyIntervals();

    $.get("/listeners/same",  function(data, status){
        $(".container").html(data);
        requestSameTimeListenersChartData();
    });
}

function showCurrentListenersPage() {
    stopAnyIntervals();

    $.get("/listeners/current",  function(data, status){
        $(".container").html(data);
        requestCurrentListenersChartData();
    });
}

function showUniqListenersPage() {
    stopAnyIntervals();

    $.get("/listeners/uniq",  function(data, status){
        $(".container").html(data);
        requestUniqListenersChartData();
    });
}

function showMapByCountryListenersPage() {
    stopAnyIntervals();

    $.get("/listeners/map/country",  function(data, status){
        $(".container").html(data);
        requestMapByCountryListenersChartData();
    });
}

function showMapByCityListenersPage() {
    stopAnyIntervals();

    $.get("/listeners/map/city",  function(data, status){
        $(".container").html(data);
        requestMapByCityListenersChartData();
    });
}

function showDurationsPage() {
    stopAnyIntervals();

    $.get("/other/durations",  function(data, status){
        $(".container").html(data);
        requestOtherDurationsChartData();
    });
}

function showReferersPage() {
    stopAnyIntervals();

    $.get("/other/referers",  function(data, status){
        $(".container").html(data);
        requestOtherReferersChartData();
    });
}

function showUserAgentsPage() {
    stopAnyIntervals();

    $.get("/other/user_agents",  function(data, status){
        $(".container").html(data);
        requestOtherUserAgentsChartData();
    });
}

function showSongsRatioPage() {
    stopAnyIntervals();

    $.get("/other/songs_ratio",  function(data, status){
        $(".container").html(data);
        requestOtherSongsRatioData();
    });
}

function showAdminStationsPage() {
    stopAnyIntervals();

    $.get("/admin/stations",  function(data, status){
        $(".container").html(data);
        initStationsPage();
    });
}

function showAdminMountsPage() {
    stopAnyIntervals();

    $.get("/admin/mounts",  function(data, status){
        $(".container").html(data);
        initMountsPage();
    });
}

function showAdminUsersPage() {
    stopAnyIntervals();

    $.get("/admin/users",  function(data, status){
        $(".container").html(data);
        initUsersPage();
    });
}

function showPermissionsPage() {
    stopAnyIntervals();

    $.get("/admin/permissions",  function(data, status){
        $(".container").html(data);
        initPermissions();
    });
}

function showAccountSettingsPage() {
    stopAnyIntervals();

    $.get("/user/settings",  function(data, status){
        $(".container").html(data);
        initUserSettingsPage();
    });
}

function showAQHReport() {
    stopAnyIntervals();
    $.get("/report/aqh",  function(data, status){
        $(".container").html(data);
        initAQHReportPage();
    });
}

function showTSLReport() {
    stopAnyIntervals();
    $.get("/report/tsl",  function(data, status){
        $(".container").html(data);
        initTSLReportPage();
    });
}

// daterange
function initDatepicker(callback) {
    initDiffDatepicker(callback, 1); // default: yesterday
    // initDiffDatepicker(callback, 17); // для тестов (16 февраля)
}

// Вешаем на календарь обработчик, если user изменил время
// заново вызываем функцию
function initDiffDatepicker(callback, days) {
    var picker = $(".input-daterange").datepicker({
        format: 'yyyy-mm-dd',
        autoclose: true,
        todayHighlight: true
    });

    // определяет default дни для показа данных
    // По умолчанию стоит текущий день
    var start_from_day = moment().subtract(days, 'days').format('YYYY-MM-DD');
    $('.input-daterange input').each(function() {
        switch(($(this).attr('id'))) {
            case 'fromDate':
                $(this).datepicker('update', start_from_day);
            break;
            case 'toDate':
                $(this).datepicker('update', moment().subtract(1, 'days').format('YYYY-MM-DD'));
                // для тестов (16 февраля)
                // $(this).datepicker('update', moment().subtract(17, 'days').format('YYYY-MM-DD'));
            break;
        }
    });

    picker.on('changeDate', function(e) {
        callback();
    });
}

function getDateRange() {
    var result = [];
    $('.input-daterange input').each(function() {
        var datetime = $(this).datepicker('getDate').valueOf();
        var strDateTime = moment(datetime).format("YYYY-MM-DD");
        result.push(strDateTime);
    });
    return result;
}


// DateSingle –– если, выбор конкретной даты
function initDateSingle(callback) {
    var picker = $("#dpSingle").datepicker({
        format: 'yyyy-mm-dd',
        autoclose: true,
        todayHighlight: true,
        // maxDate: new Date()
        // minDate:(0),
        // maxDate:(365)
    });

    var yesterday = moment().subtract(1,'days').format('YYYY-MM-DD');
    $("#dpSingle").datepicker('update', yesterday);

    $("#dpSingle").datepicker().on('changeDate', function(e) {
        callback();
    });
}


// получить конретную дату из поля DateSingle(datepicker)
function getSingleDate() {
   var datetime = $('#dpSingle').datepicker('getDate').valueOf();
   var strDateTime = moment(datetime).format("YYYY-MM-DD");
   return strDateTime;
}

// utils

function domDefault() {
    return domInRow('B', 'p') + 'rt' + domInRow('l', 'f') + "i";
}

function domInRow(a, b) {
    return "<'row'<'col-md-6'"+a+"><'col-md-6'"+b+">>";
}

// Свойства для кнопок для таблицы созданной с помощью DataTable
function dtButtons(name) {
    return [
        'copy',
        {
            extend: 'excelHtml5',
            title: getExportFileName(name)
        },
        'colvis' // позволяет какие из колонок показывать, а какие нет
    ];
}

function dtAssignButtons(table) {
    var tableName = table.context[0].sTableId;
    table.buttons().container().appendTo( '#' + tableName + '_wrapper .col-sm-6:eq(0)' );
}

function clearTableIfExist(tableName) {
    if ($.fn.dataTable.isDataTable(tableName)) {
        var table = $(tableName).DataTable();
        table.clear();
        table.destroy();
        $(tableName).empty();
    }
}

function getExportFileName(targetName) {
    var timestr = moment(new Date()).format('YYYY_MM_DD__HH_mm_ss');
    targetName = targetName.replace(/ /g, '_');
    return targetName + '_' + timestr;
}

function getRandomColor() { return "#" + Math.random().toString(16).slice(2, 8); }