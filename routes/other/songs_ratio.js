var express = require('express');
var router = express.Router();

router.get('/', function(req, res, next) {
  res.render('other/songs_ratio', { title: 'Songs ratio' });
});

module.exports = router;
