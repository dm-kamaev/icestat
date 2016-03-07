var express = require('express');
var router = express.Router();

router.get('/', function(req, res, next) {
    res.render('admin/users', { title: 'Edit Users' });
});

module.exports = router;
