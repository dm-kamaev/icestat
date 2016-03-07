var express = require('express');
var router = express.Router();

router.get('/', function(req, res, next) {
    res.render('admin/mounts', { title: 'Edit Mounts' });
});

module.exports = router;
