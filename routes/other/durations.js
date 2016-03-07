var express = require('express');
var router = express.Router();

router.get('/', function(req, res, next) {
  res.render('other/durations', { title: 'Durations' });
});

module.exports = router;
