var express = require('express');
var router = express.Router();

router.get('/', function(req, res, next) {
    res.render('admin/permissions', { title: 'Edit Permissions' });
});

module.exports = router;
