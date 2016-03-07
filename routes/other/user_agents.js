var express = require('express');
var router = express.Router();

router.get('/', function(req, res, next) {
  res.render('other/user_agents', { title: 'User agents' });
});

module.exports = router;
