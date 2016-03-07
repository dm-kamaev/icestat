function initMountsPage() {
    initMountsTable();
}

function initMountsTable() {
    $('#table_mounts').jtable({
        title: 'Edit Mounts',
        paging: true,
        pageSize: 10,
        sorting: true,
        defaultSorting: 'Name ASC',
        actions: {
            listAction:   '/api/admin/mount/list',
            createAction: '/api/admin/mount/create',
            updateAction: '/api/admin/mount/update',
            deleteAction: '/api/admin/mount/delete'
        },
        fields: {
            id: {
                key: true,
                create: false,
                edit: false,
                list: false
            },
            name: {
                title: 'Name',
                width: '10%'
            },
            stationid: {
                title: 'Station',
                options: '/api/admin/station/options',
                list: false
            },
            station_name: {
                title: 'Station Name',
                width: '10%',
                edit: false,
                create: false
            },
            station_url: {
                title: 'URL',
                width: '10%',
                edit: false,
                create: false,
                display: function (data) {
                    var url = data.record.station_url;
                    url = url.substring(0, url.lastIndexOf('/'));
                    return '<a href="' + url + '" target="_blank">' + url.replace("http://", "") + '</a>';
                }
            },
            mount: {
                title: 'Mount',
                width: '10%',
                dependsOn: 'stationid',
                options: function(data) {
                    if (data.source == 'list')
                        return [{'DisplayText': data.record.mount, "Value": data.record.mount}];
                    else
                        return '/api/admin/mount/options?station_id=' + data.dependedValues.stationid;
                }
            }
        },
        formSubmitting:function (event, data) {
            if (data.formType == 'create' || data.formType == 'edit') {
                setTimeout( function() {
                    updateMountsDropDown();
                }, 1500);
            }
            return true;
        },
        recordDeleted:function (event, data) {
            setTimeout( function() {
                updateMountsDropDown();
            }, 1500);
        }
    });

    $('#table_mounts').jtable('load');
}
