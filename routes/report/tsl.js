var express = require('express');
var router = express.Router();

router.get('/', function(req, res, next) {
  res.render('report/tsl', { title: 'TSL Report' });
});

module.exports = router;
