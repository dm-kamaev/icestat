var express = require('express');
var router = express.Router();

router.get('/', function(req, res, next) {
  res.render('other/referers', { title: 'Referers' });
});

module.exports = router;
