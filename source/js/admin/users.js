function initUsersPage() {
    initUsersTable();
}

function initUsersTable() {
    $('#table_users').jtable({
        title: 'Edit Users',
        paging: true,
        pageSize: 10,
        sorting: true,
        defaultSorting: 'Name ASC',
      	openChildAsAccordion: true,
        actions: {
            listAction:   '/api/admin/user/list',
            createAction: '/api/admin/user/create',
            updateAction: '/api/admin/user/update',
            deleteAction: '/api/admin/user/delete'
        },
        fields: {
            id: {
                key: true,
                create: false,
                edit: false,
                list: false
            },
            username: {
                title: 'Name',
                width: '10%'
            },
            password: {
                title: 'Password',
                width: '10%',
                list: false
            },
            email: {
                title: 'E-mail',
                width: '10%'
            },
            admin: {
                title: 'Admin',
                width: '10%',
                type: 'checkbox',
                values: { '0' : 'No', '1' : 'Yes' }
            },
            mounts_multiselect: {
                title: 'Mounts selection',
                list: false,
                width: '10%',
                type: 'checkbox',
                values: { '0' : 'Single', '1' : 'Multiple' }
            },
            theme: {
                title: 'Theme',
                width: '10%',
                options: [{ Value: 'default', DisplayText: 'Default' }, { Value: 'cyborg', DisplayText: 'Cyborg' }, { Value: 'readable', DisplayText: 'Readable' }, { Value: 'slate', DisplayText: 'Slate' }]
            },
            Permissions: {
                title: '',
                width: '1%',
                sorting: false,
                edit: false,
                create: false,
                listClass: "jtable-command-column",
                display: function (data) {
                    var $btn = $('<button title="Permissions" value="+" class="jtable-command-button jtable-permissions-command-button"><span>To Permissions</span></button>');
                    //Open child table when user clicks the button
                    $btn.click(function () {
                        var check = $(this).attr('value');
                        var parentRow = data.record;
                        if (check == '+') {
                            $(this).attr('value', '-');
                            $('#table_users').jtable('openChildTable',
                                    $btn.closest('tr'),
                                    {
                                        title: 'Permissions for \"' + data.record.username + '\"',
                                        actions: {
                                            listAction:   '/api/user/permission/list?id=' + data.record.id,
                                            createAction: '/api/user/permission/create?id=' + data.record.id,
                                            updateAction: '/api/admin/permission/update',
                                            deleteAction: '/api/admin/permission/delete'
                                        },
                                        fields: {
                                            mount_name: {
                                                title: 'Mount',
                                                width: '10%',
                                                options: function(data) {
                                                    if (data.source == 'list') {
                                                        return [{'DisplayText': data.record.mount_name, "Value": data.record.mount_name}];
                                                    } else
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

                                    }, function (data) { //opened handler
                                        data.childTable.jtable('load');
                                        $("div.jtable-child-table-container").find("div.jtable-title").css("background", "#3279b6");
                                    });
                        } else {
                            $('#table_users').jtable('closeChildTable', $btn.closest('tr'));
                            $(this).attr('value', '+');
                            //closeChild
                        }

                    });
                    //Return button to show on the row
                    return $btn;
                },
            },

        }
    });

    $('#table_users').jtable('load');
}
