var nodemailer = require("nodemailer"); 
var cheerio = require('cheerio'); 
var http = require('http');
var util = require('util');

var SENDMAIL_TIMEOUT = 1000*60*2;
var LA_URL_TIMEOUT = 1000*60*2;
var LA_POSTS_TIMEOUT = 1000*45*2;



var user_form = "zhegewentia@163.com";
var password = "837139670";
var user_to = "teesst123@163.com";
var set_count = 0;

var transport = nodemailer.createTransport({  
    service:"163",
    auth: {  
        user: user_form,  
        pass: password  
    }  
});  
  
var mailOption = {
    from : user_form,  
    to : user_to,  
    subject: "邮件主题",  
    text:"邮件描述预览",
    html:"<p>邮件内容</p>"
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


var my_url = "http://www.ifanr.com/page/";
var num_url = 1;

var posts_url_list = [];

function la(t_url,callback){

    http.get(t_url, function(res){

        var str = '';

        res.on('data', function (chunk) {
               str += chunk;
         });

        res.on('end', function () {
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
    var this_url = my_url+num_url;
    num_url++;
    if(num_url<150){
        var re = la(this_url,function(re){
            console.log("num_url : " + num_url);
            if(re){
                var $ = cheerio.load(re);
                var url_list = $(".entry-name a");
                if(url_list.length>0){
                    for (var i = url_list.length - 1; i >= 0; i--) {
                        posts_url_list.push(url_list[i].attribs.href);
                    };
                }
            }
        });
    }
}

function laPosts(){
    var len = posts_url_list.length;
    console.log("posts_url_list length : " + len);
    if(len>0){
        var this_url = posts_url_list.shift();
        var re = la(this_url,function(re){
            if(re){
                var $ = cheerio.load(re);
                var title = $('.entry-name').text();
                mailOption.subject = title + " la_time : " + (new Date()).getTime();
                mailOption.text = $('article .entry-meta a').attr('title');
                mailOption.html = $('article #entry-content').html();
                mail_opt_list.push(mailOption);
            }    
        });    
    }
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

console.log("send mail auto start ...");


laURL();
laPosts();

