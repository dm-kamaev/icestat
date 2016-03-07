var express = require('express');
var router = express.Router();

router.get('/', function(req, res, next) {
  res.render('listeners/map/country', { title: 'Map of the Listeners by Country' });
});

module.exports = router;
