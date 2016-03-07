var express = require('express');
var router = express.Router();

router.get('/', function(req, res, next) {
  res.render('report/aqh', { title: 'AQH Report' });
});

module.exports = router;
