var nodemailer = require("nodemailer");
var cheerio = require('cheerio');
var http = require('http');
var util = require('util');
var iconv = require('iconv-lite');

var SENDMAIL_TIMEOUT = 1000 * 60 * 5;
var LA_URL_TIMEOUT = 1000 * 60 * 20;
var LA_POSTS_TIMEOUT = 1000 * 60 * 3;
var LARGE_MAIL_NUMBER = 5;

// var SENDMAIL_TIMEOUT = 1000;
// var LA_URL_TIMEOUT = 1000;
// var LA_POSTS_TIMEOUT = 1000;


var user_form = "teesst456@gmail.com";
var password = "837139670z";
var user_list = [];
var set_count = 0;

var transport = nodemailer.createTransport({
    service: "Gmail",
    auth: { 
        user: user_form,  
        pass: password  
    }  
});  
  
var mailOption = {
    from : user_form,  
    to : "",  
    subject: "subject",  
    text:"text",
    html:"<p>content</p>"
};

var mail_opt_list = [];

function sendMail(mailOpt){

    transport.sendMail(mailOpt, function(error, info){  
        if(error){  
            console.log(error);  
        }else{  
            set_count++;
            console.log("Message sent : " + info.response);  
            console.log("already sent mail : " + set_count);
        }  
    });
}

setInterval(function(){
    var mail_list_len = mail_opt_list.length;
    var user_list_len = user_list.length;
    console.log("mail_opt_list length : " + mail_list_len + " user_list length : " + user_list_len);
    if(mail_list_len > 0){
        var this_opt = mail_opt_list.shift();
        if (user_list_len > 0) {
            for (var i = 0 ; i < user_list_len ; ++i) {
                this_opt.to = user_list[i];
                sendMail(this_opt);
            }
        }  
    }
},SENDMAIL_TIMEOUT);


var my_url = "http://daily.zhihu.com/";

var posts_url_list = [];

var posts_url_list_already = [];
var posts_title_list = [];

function la(t_url,callback){

    http.get(t_url, function(res){

        var str = '';
        var chunks = [];
        var size = 0;

        res.on('data', function (chunk) {
           chunks.push(chunk);
           size += chunk.length;
         });

        res.on('end', function () {
        	var buf = Buffer.concat(chunks,size);
        	str = iconv.decode(buf,'utf8');
            if(str){
            	console.log("already download content from url : " + t_url);
                callback(str);
            }
        });

    }).on("error",function(){
        console.log("error from la");
    });
};

function laURL(){
    la(my_url,function(re){
        if(re){
            var $ = cheerio.load(re);
            var url_list = $(".link-button");
            var title_list = $(".link-button .title");
            if(url_list.length>0){
                for (var i = 0; i <= LARGE_MAIL_NUMBER; ++i) {
                    var the_url = url_list[i].attribs.href;
                    var the_title = title_list.eq(i).text();
                	for (var j = posts_url_list_already.length - 1; j >= 0; j--) {
                		if (posts_url_list_already[j] === the_url || posts_title_list[j] === the_title) {
                			the_url = null;
                			break;
                		};
                	};
                	if(the_url){
                	    posts_url_list_already.push(the_url);
                	    posts_title_list.push(the_title);
                		posts_url_list.push(the_url);
                	}
                };
            }
        }
    });
    if (posts_url_list_already.length > 100) {
        posts_url_list_already.shift();
        posts_title_list.shift();
    }
}

function laPosts(){
    var len = posts_url_list.length;
    console.log("posts_url_list length : " + len);
    if(len>0){
        var this_url = posts_url_list[0];
        var re = la(this_url,function(re){
            if(re){
                var $ = cheerio.load(re);
                //$(".content-wrap h1").remove();
                $(".content-wrap .img-source").remove();
                var con_style = '<link rel="stylesheet" href="' + $("link")[0].attribs.href + '">';
                mailOption.subject = $('title').text();
                mailOption.text = (new Date()).toString();
                mailOption.html = con_style + $('.content-wrap').html();
                mail_opt_list.push(mailOption);
                posts_url_list.shift();
            }    
        });
    }
    showMem();
}

setInterval(laURL,LA_URL_TIMEOUT);

setInterval(laPosts,LA_POSTS_TIMEOUT);

console.log("daily start ...");

laURL();
laPosts();


function showMem() {
  var mem = process.memoryUsage();
  var format = function (bytes) {
    return (bytes / 1024 / 1024).toFixed(2) + ' MB';
  };
  
  console.log('Process: heapTotal ' + format(mem.heapTotal) + ' heapUsed ' + format(mem.heapUsed) + ' rss ' + format(mem.rss));
};

var mail_opt = {
    addmail: function (addr) {
        user_list.push(addr);
        console.log("add email is : " + addr);
    },
    delmail: function (addr) {
        var len = user_list.length;
        for (var i = len - 1 ; i >= 0 ; --i) {
            if (user_list[i] === addr) {
                user_list.splice(i, 1);
                console.log("delete email is : " + addr);
                return true;
            }
        }
        return false;
    },
    allmail: function () {
        return user_list;
    }
}

module.exports = mail_opt;
