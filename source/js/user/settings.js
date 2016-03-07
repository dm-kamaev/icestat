function initUserSettingsPage() {
    $('#email').val(user.email);
    $('#cbMountMultiselect').attr("checked", user.mounts_multiselect ? true: false);

    $('#cbMountMultiselect').on('change', function() {
        user.mounts_multiselect = !user.mounts_multiselect;
        $(this).attr("checked", user.mounts_multiselect);
        updateMountsMultiselectText();
    });

    updateMountsMultiselectText();

    $("#btnUpdate").click(function(e) {
        $.post('/api/user/settings/update',
            {
                id: user.id,
                email: $('#email').val(),
                password: $('#current_password').val(),
                new_password: $('#new_password').val(),
                confirm_password: $('#confirm_password').val(),
                mounts_multiselect: user.mounts_multiselect
            },
            function (data, textStatus, jqXHR) {
                if (data.Result == "OK") bootbox.alert("Update success!", function() {});
                else bootbox.alert(data.Result, function() {});

            }
        );
        e.preventDefault();
    });
}

function updateMountsMultiselectText() {
    $('#spMountsSelect').text(user.mounts_multiselect ? 'Multiple' : 'Single');
}
