function initPermissions() {
    initPermissionsTable();
}

function initPermissionsTable() {
    $('#table_permissions').jtable({
        title: 'Edit permissions',
        paging: true,
        pageSize: 10,
        sorting: true,
        defaultSorting: 'Name ASC',
        actions: {
            listAction:   '/api/admin/permission/list',
            createAction: '/api/admin/permission/create',
            updateAction: '/api/admin/permission/update',
            deleteAction: '/api/admin/permission/delete'
        },
        fields: {
            user_name: {
                title: 'Userame',
                width: '10%',
                options: function(data) {
                    if (data.source == 'list') {
                        return [{'DisplayText': data.record.user_name, "Value": data.record.user_name}];
                    }
                    else
                        return '/api/admin/user/options';
                }
            },
            mount_name: {
                title: 'Mount',
                width: '10%',
                options: function(data) {
                    if (data.source == 'list')
                        return [{'DisplayText': data.record.mount_name, "Value": data.record.mount_name}];
                    else
                        return '/api/admin/permission/options';
                }
            },
            selected: {
                title: 'Checked',
                width: '10%',
                type: 'checkbox',
                values: { '0' : 'No', '1' : 'Yes' }
            },
            user_id: {
                key: true,
                create: false,
                edit: false,
                list: false
            },
            mount_id: {
                key: true,
                create: false,
                edit: false,
                list: false
            },
            perm_id: {
                key: true,
                create: false,
                edit: false,
                list: false
            },
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

    $('#table_permissions').jtable('load');
}
