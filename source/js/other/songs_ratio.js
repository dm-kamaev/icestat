var mSongsRatioMount;
function requestOtherSongsRatioData() {
    initDateSingle(sendOtherSongsRatioRequest);
    sendOtherSongsRatioRequest();
}

function showSelectMountDialogForSongsRatio() {
    $('#dlgSelectMount').modal('show');
    var htmlMountList = '';
    var mountList = getSelectedMounts();
    for (var i = 0; i < mountList.length; i++) {
        var mount = mountList[i];
 		var htmlMountItem = '<label class="radio-inline">';
        htmlMountItem += '<input type="radio" name="inlineRadioOptions" id="mount' + i + '" value="' + mount.mount_id + '"> ' + mount.name + '</input>';
        htmlMountItem += '</label><br/>';
        htmlMountList += htmlMountItem;
    }

    $('#dlgSelectMountBody').html(htmlMountList);

    $('#btnApprove').click(function() {
        var radioBoxItem = $('input[type=radio]:checked', '#dlgSelectMount');
        var mount_id = radioBoxItem.val();
        mSongsRatioMount = getSelectedMountById(mount_id);
        $('#dlgSelectMount').modal('hide');
        clearTableIfExist('#table_songs_ratio');
        loadSongsRatioTableData();
    });
}

function sendOtherSongsRatioRequest() {
    if (user.mounts_multiselect) {
        if (mSongsRatioMount) {
            clearTableIfExist('#table_songs_ratio');
            loadSongsRatioTableData();
        } else {
            showSelectMountDialogForSongsRatio();
        }
    } else {
        var mountList = getSelectedMounts();
        if (mountList.length > 0) {
            mSongsRatioMount = mountList[0];
            clearTableIfExist('#table_songs_ratio');
            loadSongsRatioTableData();
        } else {
            bootbox.alert('Please select any mount!', function() {});
        }
    }
}

function loadSongsRatioTableData() {
    var date = getSingleDate();
    var postData = {
        mount: mSongsRatioMount.mount,
        station: mSongsRatioMount.hostname,
        startDate: date,
        endDate: date
    };
    var buttons = [
        'copy',
        {
            extend: 'excelHtml5',
            title: getExportFileName('SongsRatio_' + mSongsRatioMount.name)
        },
    ];
    if (user.mounts_multiselect) {
        buttons.push(
        {
            text: 'Select mount',
            action: function ( e, dt, node, config ) {
                showSelectMountDialogForSongsRatio();
            }
        });
    }

    buttons.push('colvis');

    var title = 'Songs Ratio: ' + mSongsRatioMount.name + ' ('+mSongsRatioMount.hostname+')';
    $('#table_songs_ratio').append('<caption id="title_songs_ratio" class="well">');
    $('#title_songs_ratio').text(title);

    var table = $('#table_songs_ratio').DataTable( {
        processing : true,
        serverSide : true,
        ajax: {
            type: "POST",
            url: "/api/other/songs_ratio",
            data: function(tableSettings) {
                var json = {};
                json.tableSettings = JSON.stringify(tableSettings);
                json.params = JSON.stringify(postData);
                return json;
            }
        },
        columns: [
            {
                title: "Date",
                data: "date",
                render: function(data, type, full, meta){
                    return (type === 'display') ?
                        moment.utc(data).format('DD-MM-YYYY HH:mm:ss') : data;
                }
            },
            { title: "Meta", data: "meta" },
            { title: "Count", data: "count" },
            {
                title: "Ratio",
                data: "ratio",
                orderable: false,
                render: function(data, type, full, meta){
                    if (type === 'display') {
                        if (data > 0)
                           return data + "<i class=\"glyphicon glyphicon-arrow-up\"/>";
                        else if (data < 0)
                           return data + "<i class=\"glyphicon glyphicon-arrow-down\"/>";
                        else return '';
                    }
                    return data;
                },
                fnCreatedCell: function (nTd, sData, oData, iRow, iCol) {
                    if (sData !== 0)
                        $(nTd).addClass((sData > 0) ? 'success' : 'danger').css('text-align', 'center');
                },
            }
        ],
        dom: domDefault(),
        buttons: buttons
    } );

    table.buttons().container().appendTo( '#table_songs_ratio_wrapper .col-sm-6:eq(0)' );
}
