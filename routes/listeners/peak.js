var express = require('express');
var router = express.Router();

router.get('/', function(req, res, next) {
  res.render('listeners/peak', { title: 'Listeners at the peak time' });
});

module.exports = router;
