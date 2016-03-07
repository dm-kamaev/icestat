var express = require('express');
var router = express.Router();

router.get('/', function(req, res, next) {
  res.render('listeners/uniq', { title: 'Unique Listeners' });
});

module.exports = router;
