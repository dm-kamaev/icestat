var express = require('express');
var router = express.Router();

router.get('/', function(req, res, next) {
    res.render('admin/stations', { title: 'Edit Stations' });
});

module.exports = router;
