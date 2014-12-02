var express = require('express');
var router = express.Router();
var send_mail = require('../util/send_mail_daily');

/* GET home page. */
router.get('/', function(req, res) {
  res.render('index', { title: 'submail' });
});

router.post('/addmail', function (req, res) {
  console.log("email is : "+req.body.mail);
  send_mail.addmail(req.body.mail);
  res.render('success', { title: 'submail' });
})

module.exports = router;
