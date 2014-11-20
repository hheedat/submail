var nodemailer = require("nodemailer");
var cheerio = require('cheerio');
var http = require('http');
var util = require('util');
var iconv = require('iconv-lite');

var SENDMAIL_TIMEOUT = 1000 * 60 * 5;
var LA_URL_TIMEOUT = 1000 * 60 * 20;
var LA_POSTS_TIMEOUT = 1000 * 60 * 3;

// var SENDMAIL_TIMEOUT = 1000;
// var LA_URL_TIMEOUT = 1000;
// var LA_POSTS_TIMEOUT = 1000;


var user_form = "songminglinghang@163.com";
var password = "837139670";
var user_to = "teesst1234@163.com";
var set_count = 0;

var transport = nodemailer.createTransport({
    service: "163",
    auth: { 
        user: user_form,  
        pass: password  
    }  
});  
  
var mailOption = {
    from : user_form,  
    to : user_to,  
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


var my_url = "http://daily.zhihu.com/";

var posts_url_list = [];

var posts_url_list_already = [];

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
            if(url_list.length>0){
                for (var i = url_list.length - 1; i >= 0; i--) {
                	var the_url = url_list[i].attribs.href;
                	for (var j = posts_url_list_already.length - 1; j >= 0; j--) {
                		if (posts_url_list_already[j] === the_url) {
                			the_url = null;
                			break;
                		};
                	};
                	if(the_url){
                        posts_url_list_already.push(the_url);
                		posts_url_list.push(the_url);
                	}
                };
            }
        }
    });
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

setInterval(function(){
	var len = mail_opt_list.length;
	console.log("mail_opt_list length : " + len);
	if(len > 0){
		sendMail(mail_opt_list.shift());
	}
},SENDMAIL_TIMEOUT);

console.log("daily start ...");

laURL();
laPosts();


function showMem() {
  var mem = process.memoryUsage();
  var format = function (bytes) {
    return (bytes / 1024 / 1024).toFixed(2) + ' MB';
  };
  console.log('-----------------------------------------------------------');
  console.log('Process: heapTotal ' + format(mem.heapTotal) + ' heapUsed ' + format(mem.heapUsed) + ' rss ' + format(mem.rss));
  console.log('-----------------------------------------------------------');
};