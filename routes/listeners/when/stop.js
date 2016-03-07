var express = require('express');
var router = express.Router();

router.get('/', function(req, res, next) {
  res.render('listeners/when/stop', { title: 'Listeners on stop' });
});

module.exports = router;
