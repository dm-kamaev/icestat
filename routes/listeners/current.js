var express = require('express');
var router = express.Router();

router.get('/', function(req, res, next) {
  res.render('listeners/current', { title: 'Current Listeners' });
});

module.exports = router;
