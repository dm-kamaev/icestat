var express = require('express');
var router = express.Router();

router.get('/', function(req, res, next) {
  res.render('listeners/map/city', { title: 'Map of the Listeners by City' });
});

module.exports = router;
