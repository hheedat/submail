var express = require('express');
var router = express.Router();
var send_mail = require('../util/send_mail_daily');

/* GET home page. */
router.get('/', function(req, res) {
  res.render('index', { title: 'submail' });
});

router.get('/allmail', function (req, res) {
    var userlist = send_mail.allmail();
    res.render('allmail', { title: 'submail',userlist:userlist });
});

router.post('/addmail', function (req, res) {
  send_mail.addmail(req.body.mail);
  res.render('success', { title: 'submail', message: 'add email success!' });
})

router.post('/deletemail', function (req, res) {
    var flag = send_mail.delmail(req.body.mail);
    if (flag) {
        res.render('success', { title: 'submail', message: 'delete email success!' });
    } else {
        res.render('success', { title: 'submail', message: 'This email does not exist!' });
    }
    
})



module.exports = router;
