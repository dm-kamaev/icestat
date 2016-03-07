function initStationsPage() {
    initStationsTable();
}

function initStationsTable() {
    $('#table_stations').jtable({
        title: 'Edit Stations',
        paging: true,
        pageSize: 10,
        sorting: true,
        defaultSorting: 'Name ASC',
        actions: {
            listAction:   '/api/admin/station/list',
            createAction: '/api/admin/station/create',
            updateAction: '/api/admin/station/update',
            deleteAction: '/api/admin/station/delete'
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
            url: {
                title: 'URL',
                width: '10%',
                display: function (data) {
                    var url = data.record.url;
                    url = url.substring(0, url.lastIndexOf('/'));
                    return '<a href="' + url + '" target="_blank">' + url.replace("http://", "") + '</a>';
                }
            },
            update_db: {
                title: 'State',
                width: '3%',
                type: 'checkbox',
                values: { '0' : 'Off', '1' : 'On' }
            },
            ftp_host: {
                title: 'FTP Host',
                list: false
            },
            ftp_username: {
                title: 'FTP Username',
                list: false
            },
            ftp_password: {
                title: 'FTP Password',
                list: false,
                type: 'password'
            },
        }
    });

    $('#table_stations').jtable('load');
}
