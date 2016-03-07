var express = require('express');
var router = express.Router();

router.get('/', function(req, res, next) {
  res.render('listeners/same', { title: 'Listeners at the same time' });
});

module.exports = router;
