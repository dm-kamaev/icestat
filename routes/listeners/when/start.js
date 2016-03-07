var express = require('express');
var router = express.Router();

router.get('/', function(req, res, next) {
  res.render('listeners/when/start', { title: 'Listeners on start' });
});

module.exports = router;
