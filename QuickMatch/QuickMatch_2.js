var express = require('express');
var mysql = require('mysql');
var alert = require('alert-node');
var multer = require('multer');
var PythonShell = require('python-shell');
var fs = require('fs');
var moment = require('moment');
var bodyParser = require('body-parser');
var async = require('async');
const vision = require('node-cloud-vision-api')
vision.init({auth: 'AIzaSyCGswfWrQc3a6TQ7K4rlNZlcgrvef07ves'})

var connection = mysql.createConnection({
    host: 'ec2-13-125-246-47.ap-northeast-2.compute.amazonaws.com',
    port: '3306',
    user: 'root',
    password: 'scv1234',
    database: 'quick',
    debug: false
});

var storage = multer.diskStorage({
    destination: function(req, file, cb) {
        cb(null, 'uploads/');
    },
    filename: function(req, file, cb) {
        cb(null, file.originalname);
    }
});


var upload = multer({storage: storage});


var router = express.Router();
router.route('/first').get(function(req, res){
    res.render('layout2-result.html');
});

var id;
var pw;
var loc;
var handi;
var login_ID;
var login_password;
var profile_img;
var post_img;
var post_music;
var C_ssn=null;
var point;
var clan_ID;
var match_ID;
var placeName;
var date;
var match_result2;
var a=null;

router.route('/first').post(function(req,res){
    
    id = req.body.join_id;
    pw = req.body.join_password;
    loc = req.body.loc;
    handi = req.body.handi;

    
    var id_size = id.length;
    var id_dup = 0;
    var password_size = pw.length;
 
    var sqlQuery = "INSERT INTO users SET ?";
    var post = {id: id, pw: pw, loc: loc, handi: handi, clan_ID: null, status: null, point: 0};
    
    async.waterfall([
        function(callback){
            connection.query('SELECT id from users', function(err, rows, fields){
                if (!err){
                    for(var i = 0; i < rows.length; i++)
                    {
                        if(rows[i].id == id){
                            id_dup = 1;                    
                        }
                    }
                    callback(null, id_dup);

                }
                else
                    console.log('Error while performing Query.', err);
            });
            
        },
        function(id_dup, callback){
            console.log(id_dup);
            if((id_size > 10) || (id_size == 0) || (password_size < 7) || (password_size == 0)){
                res.write('<script>alert("Please retry sign in. You entered inappropriate information")</script>');
                res.write('<script language=\"javascript\">window.location=\"http://127.0.0.1:5001/first\"</script>');
            }
            else{
                if(id_dup == 1){
                    res.write('<script>alert("There is already same ID.")</script>');
                    res.write('<script language=\"javascript\">window.location=\"http://127.0.0.1:5001/first\"</script>');
                }
                else{
                    function callback(err, result){
                        if(err){
                            //throw err
                            console.log(err);
                        }
                    }
                    var query = connection.query(sqlQuery, post, callback);
                    console.log("Insert Complete!");
                    res.write('<script>alert("Sign in success.")</script>');
                    res.write('<script language=\"javascript\">window.location=\"http://127.0.0.1:5001/first\"</script>'); 
                }
            }
            
        }
        
    ]);
    
    
});

router.route('/login').get(function(req, res){
    res.render('viewProfile.html');
});
router.route('/viewAll').post(function(req, res){
        connection.query("SELECT * from users where id = '" + login_ID + "';", function(err, rows, fields){
    if (!err){
                point = rows[0].point;
                clan_id = rows[0].clan_ID;
                res.render('viewProfile.html',{login_ID : login_ID, point : point, clan_id : clan_id});
    }
    });
});


router.route('/login').post(function(req,res){
    
    login_ID = req.body.login_id;
    login_password = req.body.login_password;
    
    console.log(login_ID);
    console.log(login_password);
    
    var login = 0;
    connection.query('SELECT * from users', function(err, rows, fields){
    if (!err){
        for(var i = 0; i < rows.length; i++)
        {
            if((rows[i].id == login_ID) && (rows[i].pw == login_password)){
                login = 1;
                /*var path = "/uploads/" + rows[i].profile_img;
                profile_img = rows[i].profile_img;*/
                point = rows[i].point;
                clan_id = rows[i].clan_ID;
                clan_ID = rows[i].clan_ID;
                res.render('viewProfile.html',{login_ID : login_ID, point : point, clan_id : clan_id});
                
            }
        }
        if(login == 0){
            res.write('<script>alert("Please log in again or sign in.")</script>');
            res.write('<script language=\"javascript\">window.location=\"http://127.0.0.1:5001/first\"</script>');
        }
    }
    else
        console.log('Error while performing Query.', err);

    });
});

var friend_id;
var friend_name;
var friend_phone;
var friend_img;

router.route('/search').post(function(req, res){
    var W = 'W'
    connection.query("SELECT * from users where status = '"+W+"';", function(err, rows, fields){
    if (!err){
                if(rows.length != 0){
                    var ran = Math.floor(Math.random()*(rows.length));
                    match_ID = rows[ran].id;

                    var values = {id: rows[ran].id, handi: rows[0].handi, loc: rows[0].loc, point: rows[0].point};
                    res.render("search2.html", values);
                }
                else{
                    alert('대기 중인 사용자가 없습니다.');
                }
    }
    else
        console.log('Error while performing Query.', err);
    });
    
});
router.route('/search3').post(function(req, res){
    search_id = req.body.search_id;
    connection.query("SELECT * from users where id = '" + search_id + "';", function(err, rows, fields){
    if (!err){
                if(rows.length != 0){
                    friend_id = rows[0].id;
                    friend_handi = rows[0].handi;
                    friend_point = rows[0].point;
                    var values = {id: friend_id, handi: friend_handi, point: friend_point};
                    res.render("search.html", values);
                }
                else{
                    alert('등록되지 않은 아이디입니다.');
                }
    }
    else
        console.log('Error while performing Query.', err);
    });
    
});

router.route('/addFr').post(function(req, res){
        
        connection.query("SELECT * from Friend where user_ID = '" + login_ID + "';", function(err, rows, fields){
            if(!err){
                for(var i = 0; i < rows.length; i++)
                {
                    if(rows[i].friend_Id == friend_id){
                        alert('이미 친구입니다.');
                        res.render("viewProfile.html",{login_ID : login_ID, point : point, clan_id : clan_ID});
                    }
                }
                
                var sqlQuery = "INSERT INTO Friend SET ?";
                var post = {user_ID: login_ID, friend_ID: friend_id};
                function callback(err, result){
                    if(err){
                        console.log("err");
                        throw err
                    }
                    else{
                        alert('친구 추가 완료.');
                        res.render("viewProfile.html",{login_ID : login_ID, point : point, clan_id : clan_ID});
                    }
                }
                var query = connection.query(sqlQuery, post, callback);
            }
            else
                console.log('Error while performing Query.', err);
        });
          
});
 
router.route('/delFr').post(function(req, res){
        
        connection.query("SELECT * from Friend WHERE user_ID = '" + login_ID + "';", function(err, rows, fields){
 
               if(rows.length == 0){
                        alert('친구가 아닙니다.');
                        res.render("viewProfile.html",{login_ID : login_ID, point : point, clan_id : clan_ID});
 
                    }
                
                var sqlQuery = "DELETE from Friend WHERE user_ID = '" + login_ID + "' AND friend_ID = '" + friend_id + "';";
                function callback(err, result){
                    if(err){
                        console.log("err");
                        throw err
                    }
                    else{
                        alert('친구 삭제 완료.');
                        res.render("viewProfile.html",{login_ID : login_ID, point : point, clan_id : clan_ID});
                    }
                }
                var query = connection.query(sqlQuery, callback);
            
            if(err)
                console.log('Error while performing Query.', err);
        });
          
});
 
router.route('/friends').post(function(req, res){
    connection.query("SELECT * from Friend where user_ID = '" + login_ID + "';", function(err, rows, fields){
        if (!err){
            
            res.writeHead(200, {"Content-Type" : "text/html; charset=utf-8"});
            res.write("<!DOCTYPE html>");
            res.write("<html>");
            res.write("<head>");
            res.write("<meta charset='utf-8'>");
            res.write("<title>Clan List</title>");
            res.write("<link rel='stylesheet' href='css/viewmy.css'>");
            res.write("	<style>	");
             res.write("	html{	");
            res.write("	background-size: cover;	");
            res.write("	margin : 0;	");
            res.write("	padding : 0;	");
            res.write("	overflow-y:scroll;overflow-x:hidden;background-repeat:repeat; background-attachment:fixed;	");
            res.write("	}	");
            res.write("	body{	");
            res.write("	font-family:'맑은 고딕', '고딕', '굴림'; 	");
            res.write("	margin : 0;	");
            res.write("	padding : 0;	");
            res.write("	background-image: url('images/snow12.jpg');	");
            res.write("	-webkit-animation: snow 20s linear infinite;	");
            res.write("	-moz-animation: snow 20s linear infinite;	");
            res.write("	-ms-animation: snow 20s linear infinite;	");
            res.write("	animation: snow 20s linear infinite;	");
            res.write("	}	");
            res.write("	@keyframes snow {	");
            res.write("	0% {background-position: 0px 0px, 0px 0px, 0px 0px;}	");
            res.write("	100% {background-position: 500px 1000px, 400px 400px, 300px 300px;}	");
            res.write("	}	");
            res.write("	@-moz-keyframes snow {	");
            res.write("	0% {background-position: 0px 0px, 0px 0px, 0px 0px;}	");
            res.write("	100% {background-position: 500px 1000px, 400px 400px, 300px 300px;}	");
            res.write("	} 	");
            res.write("	@-webkit-keyframes snow {	");
            res.write("	0% {background-position: 0px 0px, 0px 0px, 0px 0px;}	");
            res.write("	50% {}	");
            res.write("	100% {background-position: 500px 1000px, 400px 400px, 300px 300px;}	");
            res.write("	} 	");
            res.write("	@-ms-keyframes snow {	");
            res.write("	0% {background-position: 0px 0px, 0px 0px, 0px 0px;}	");
            res.write("	100% {background-position: 500px 1000px, 400px 400px, 300px 300px;}	");
            res.write("	}	");
            res.write("	</style>	");
            res.write("</head>");
            res.write("<body>");
             res.write("	<header class='head'>	");
            res.write("	<div class = 'A'>	");
            res.write("	<div class= 'B'>	");
            res.write("	<div class='top'>	");
            res.write("	<img src='images/Nupdoung.jpg' alt='' class = 'image_profile2' style='margin-left : 50px;'>	");
            res.write("	<img src='images/mark3.jpg' alt='' class = 'image_mark' style='margin-left : 10px;'>	");
            res.write("	</div>	");
            res.write('	<div class="top2" >	');
            res.write("<br>");
            res.write("<form method = 'post' action='/viewAll'>");
            res.write("<input type = 'submit' value = 'My Room' class='right' name = ''>");
            res.write("</form>");    
            res.write("<br>");
            res.write("<form method = 'post' action='/statistics'>");
            res.write("<input type = 'submit' value = 'Statistics' class='right' name = ''>");
            res.write("</form>");    
            res.write("<br>");
            res.write("<form method = 'post' action='/clan'>");
            res.write("<input type = 'submit' value = 'Clan' class='right' name = ''>");
            res.write("</form>");    
            res.write("<br>");
            res.write("<form method = 'post' action='/logout'>");
            res.write("<input type = 'submit' value = 'Logout' class='right' name = ''>");
            res.write("</form>");    
            res.write("<br>");
            res.write("	</div>	");
            res.write("	</div>	");
            res.write("	</div>	");
            res.write("	</header>	");
            for(var i = 0; i < rows.length; i++)
            {   
                var j = i+1;
                res.write("	<article class = 'article'> 	");
                res.write("	<section class = 'section'>	");
                res.write("	<div class = 'post'>	");
                res.write("	<div class='top'> 	");
                res.write("</div>");
                res.write("<div>");
                res.write("<br><h5>" + j + "번째 친구</h5>");
                 res.write("</div>");
                res.write("<div>");
                res.write("<h4 style='margin-left : 15px;'>ID : " + rows[i].friend_ID + "</h4>");
                res.write("<br>")
                res.write("</div>");
                res.write("</div>");
                res.write("</section>");
                res.write("</article>");
                
            }
            res.write("</body>");
            res.write("</html>");
            res.end();
                
        }

        else
            console.log('Error while performing Query.', err);
    });
});


router.route('/clan').post(function(req, res){
    connection.query("SELECT * from Clan;", function(err, rows, fields){
        if (!err){
            
            res.writeHead(200, {"Content-Type" : "text/html; charset=utf-8"});
            res.write("<!DOCTYPE html>");
            res.write("<html>");
            res.write("<head>");
            res.write("<meta charset='utf-8'>");
            res.write("<title>Clan List</title>");
            res.write("<link rel='stylesheet' href='css/viewmy.css'>");
            res.write("	<style>	");
             res.write("	html{	");
            res.write("	background-size: cover;	");
            res.write("	margin : 0;	");
            res.write("	padding : 0;	");
            res.write("	overflow-y:scroll;overflow-x:hidden;background-repeat:repeat; background-attachment:fixed;	");
            res.write("	}	");
            res.write("	body{	");
            res.write("	font-family:'맑은 고딕', '고딕', '굴림'; 	");
            res.write("	margin : 0;	");
            res.write("	padding : 0;	");
            res.write("	background-image: url('images/snow12.jpg');	");
            res.write("	-webkit-animation: snow 20s linear infinite;	");
            res.write("	-moz-animation: snow 20s linear infinite;	");
            res.write("	-ms-animation: snow 20s linear infinite;	");
            res.write("	animation: snow 20s linear infinite;	");
            res.write("	}	");
            res.write("	@keyframes snow {	");
            res.write("	0% {background-position: 0px 0px, 0px 0px, 0px 0px;}	");
            res.write("	100% {background-position: 500px 1000px, 400px 400px, 300px 300px;}	");
            res.write("	}	");
            res.write("	@-moz-keyframes snow {	");
            res.write("	0% {background-position: 0px 0px, 0px 0px, 0px 0px;}	");
            res.write("	100% {background-position: 500px 1000px, 400px 400px, 300px 300px;}	");
            res.write("	} 	");
            res.write("	@-webkit-keyframes snow {	");
            res.write("	0% {background-position: 0px 0px, 0px 0px, 0px 0px;}	");
            res.write("	50% {}	");
            res.write("	100% {background-position: 500px 1000px, 400px 400px, 300px 300px;}	");
            res.write("	} 	");
            res.write("	@-ms-keyframes snow {	");
            res.write("	0% {background-position: 0px 0px, 0px 0px, 0px 0px;}	");
            res.write("	100% {background-position: 500px 1000px, 400px 400px, 300px 300px;}	");
            res.write("	}	");
            res.write("	</style>	");
            res.write("</head>");
            res.write("<body>");
             res.write("	<header class='head'>	");
            res.write("	<div class = 'A'>	");
            res.write("	<div class= 'B'>	");
            res.write("	<div class='top'>	");
            res.write("	<img src='images/Nupdoung.jpg' alt='' class = 'image_profile2' style='margin-left : 50px;'>	");
            res.write("	<img src='images/mark3.jpg' alt='' class = 'image_mark' style='margin-left : 10px;'>	");
            res.write("	</div>	");
            res.write('	<div class="top2" >	');
            res.write("<br>");
            res.write("<form method = 'post' action='/viewAll'>");
            res.write("<input type = 'submit' value = 'My Room' class='right' name = ''>");
            res.write("</form>");    
            res.write("<br>");
            res.write("<form method = 'post' action='/statistics'>");
            res.write("<input type = 'submit' value = 'Statistics' class='right' name = ''>");
            res.write("</form>");    
            res.write("<br>");
            res.write("<form method = 'post' action='/friends'>");
            res.write("<input type = 'submit' value = 'Friends' class='right' name = ''>");
            res.write("</form>");    
            res.write("<br>");
            res.write("<form method = 'post' action='/logout'>");
            res.write("<input type = 'submit' value = 'Logout' class='right' name = ''>");
            res.write("</form>");    
            res.write("<br>");
            res.write("	</div>	");
            res.write("	</div>	");
            res.write("	</div>	");
            res.write("	</header>	");
            for(var i = 0; i < rows.length; i++)
            {   

                clan_ID = rows[i].clan_ID;
                res.write("	<article class = 'article'> 	");
                res.write("	<section class = 'section'>	");
                res.write("	<div class = 'post'>	");
                res.write("	<div class='top'> 	");
                res.write("<br><h3 style='margin-left : 15px;'>" + rows[i].clan_ID + "</h3>");
                res.write("</div>");
                res.write("<div>");
                res.write("<br><h4>Master : " + rows[i].masterID + " <br>Made Date : " + rows[i].madeDate + "</h4>");
                res.write("</div>");
                
                res.write("<div>");
                res.write("<br>소개 : <h5>" + rows[i].introduction + "</h5>"); 
                res.write("</div>");
                res.write("<br><form method = 'post' action='/addC'>");
                res.write("<input type = 'submit' value = '클랜가입' class='right' name = ''>");
                res.write("</form>");
                res.write("<form method = 'post' action='/delC'>");
                res.write("<input type = 'submit' value = '클랜탈퇴' class='right' name = ''>");
                res.write("</form>");
                res.write("</div>");
                res.write("</section>");
                res.write("</article>");
                
            }
            res.write("</body>");
            res.write("</html>");
            res.end();
                
        }

        else
            console.log('Error while performing Query.', err);
    });
});


 
router.route('/addF').post(function(req, res){
    connection.query("SELECT * from Place;", function(err, rows, fields){
        if(!err){
                moment.locale('ko');
                var ran = Math.floor(Math.random()*(rows.length));
                placeName = rows[ran].name;
                date = moment().utcOffset('+0900').format('YYYY-MM-DD HH:mm:ss');
                console.log(date);
                console.log(match_ID);

                var sqlQuery = "INSERT INTO Match_ SET ?";
                var post = {date: date, match_result: null, user1: login_ID, user2: match_ID, loc: rows[2].loc, placeName: placeName};
                var values = {placeName: placeName, loc: rows[ran].loc, fee: rows[ran].fee, phone: rows[2].phone};
                
                function callback(err, result){
                    if(err){
                        console.log("err");
                        throw err;
                    }
                    else{
                        alert('매칭이 완료되었습니다');
                        res.render("first.html", values);
                    }
                }
                var query = connection.query(sqlQuery,post, callback);
        }
    });
});

router.route('/matchresult').post(function(req, res){
    async.waterfall([
        function(callback){
                    connection.query("SELECT * from users where id = '" + login_ID + "';", function(err, rows, fields){
                       match_result2 = req.body.match_result;
                        callback(null, match_result2);
                   
    });
            
        },
        function(match_result2, callback){
            var sqlQuery = "UPDATE Match_ SET ? WHERE date = '"+ date +"';";
                    var post = {match_result: match_result2};
                    console.log(match_result2);
                    function callback(err, result){
                        if(err){
                            console.log("err");
                            throw err;
                        }
                        else{
                            alert('경기결과 입력완료');
                            
                            console.log(result);
                            connection.query("SELECT * from users where id = '"+match_result2+"';", function(err, rows, fields){
                                var cpoint = rows[0].point + 1;
                                var sqlQuery2 = "UPDATE users SET point = '"+ cpoint +"' where id = '"+ match_result2 +"';";
                                var query = connection.query(sqlQuery2);
                                
                                res.render("viewProfile.html",{login_ID : login_ID, point : cpoint, clan_id : clan_ID});
                            });
                            
                        }
                    }
                    var query = connection.query(sqlQuery, post, callback);
            console.log(query);
            

            
        }
    ]);

});

 
router.route('/delF').post(function(req, res){
        connection.query("SELECT * from users where id = '" + login_ID + "';", function(err, rows, fields){
    if (!err){
                point = rows[0].point;
                clan_id = rows[0].clan_ID;
        alert('매칭이 취소되었습니다');
                res.render('viewProfile.html',{login_ID : login_ID, point : point, clan_id : clan_id});
    }
    });
});

router.route('/addC').post(function(req, res){
        
        connection.query("SELECT * from users where id = '" + login_ID + "';", function(err, rows, fields){
            if(!err){

                    if(rows[0].clan_ID == clan_ID){
                        alert('이미 가입하셨습니다.');
                    }
                
                var sqlQuery = "UPDATE users SET ? WHERE id = '" + login_ID + "';";
                var post = {clan_ID: clan_ID};
                function callback(err, result){
                    if(err){
                        console.log("err");
                        throw err;
                    }
                    else{
                        alert('클랜 가입 완료.');
                    }
                }
                var query = connection.query(sqlQuery, post, callback);
            }
            else
                console.log('Error while performing Query.', err);
        });
          
});

router.route('/delC').post(function(req, res){
        
        connection.query("SELECT * from users where id = '" + login_ID + "';", function(err, rows, fields){
            if(!err){

                    if(rows[0].clan_ID != clan_ID){
                        alert('가입된 클랜이 아닙니다.');
                    }
                
                var sqlQuery = "UPDATE users SET ? WHERE id = '" + login_ID + "';";
                var post = {clan_ID: null};
                function callback(err, result){
                    if(err){
                        console.log("err");
                        throw err;
                    }
                    else{
                        alert('클랜 탈퇴 완료.');
                    }
                }
                var query = connection.query(sqlQuery, post, callback);
            }
            else
                console.log('Error while performing Query.', err);
        });
          
});
 
router.route('/statistics').post(function(req, res){
    connection.query("SELECT * from users ORDER BY CAST(point AS DECIMAL);", function(err, rows, fields){
        if (!err){
            
            res.writeHead(200, {"Content-Type" : "text/html; charset=utf-8"});
            res.write("<!DOCTYPE html>");
            res.write("<html>");
            res.write("<head>");
            res.write("<meta charset='utf-8'>");
            res.write("<title>Clan List</title>");
            res.write("<link rel='stylesheet' href='css/viewmy.css'>");
            res.write("	<style>	");
             res.write("	html{	");
            res.write("	background-size: cover;	");
            res.write("	margin : 0;	");
            res.write("	padding : 0;	");
            res.write("	overflow-y:scroll;overflow-x:hidden;background-repeat:repeat; background-attachment:fixed;	");
            res.write("	}	");
            res.write("	body{	");
            res.write("	font-family:'맑은 고딕', '고딕', '굴림'; 	");
            res.write("	margin : 0;	");
            res.write("	padding : 0;	");
            res.write("	background-image: url('images/snow12.jpg');	");
            res.write("	-webkit-animation: snow 20s linear infinite;	");
            res.write("	-moz-animation: snow 20s linear infinite;	");
            res.write("	-ms-animation: snow 20s linear infinite;	");
            res.write("	animation: snow 20s linear infinite;	");
            res.write("	}	");
            res.write("	@keyframes snow {	");
            res.write("	0% {background-position: 0px 0px, 0px 0px, 0px 0px;}	");
            res.write("	100% {background-position: 500px 1000px, 400px 400px, 300px 300px;}	");
            res.write("	}	");
            res.write("	@-moz-keyframes snow {	");
            res.write("	0% {background-position: 0px 0px, 0px 0px, 0px 0px;}	");
            res.write("	100% {background-position: 500px 1000px, 400px 400px, 300px 300px;}	");
            res.write("	} 	");
            res.write("	@-webkit-keyframes snow {	");
            res.write("	0% {background-position: 0px 0px, 0px 0px, 0px 0px;}	");
            res.write("	50% {}	");
            res.write("	100% {background-position: 500px 1000px, 400px 400px, 300px 300px;}	");
            res.write("	} 	");
            res.write("	@-ms-keyframes snow {	");
            res.write("	0% {background-position: 0px 0px, 0px 0px, 0px 0px;}	");
            res.write("	100% {background-position: 500px 1000px, 400px 400px, 300px 300px;}	");
            res.write("	}	");
            res.write("	</style>	");
            res.write("</head>");
            res.write("<body>");
             res.write("	<header class='head'>	");
            res.write("	<div class = 'A'>	");
            res.write("	<div class= 'B'>	");
            res.write("	<div class='top'>	");
            res.write("	<img src='images/Nupdoung.jpg' alt='' class = 'image_profile2' style='margin-left : 50px;'>	");
            res.write("	<img src='images/mark3.jpg' alt='' class = 'image_mark' style='margin-left : 10px;'>	");
            res.write("	</div>	");
            res.write('	<div class="top2" >	');
            res.write("<br>");
            res.write("<form method = 'post' action='/viewAll'>");
            res.write("<input type = 'submit' value = 'My Room' class='right' name = ''>");
            res.write("</form>");    
            res.write("<br>");
            res.write("<form method = 'post' action='/friends'>");
            res.write("<input type = 'submit' value = 'Friends' class='right' name = ''>");
            res.write("</form>");    
            res.write("<br>");
            res.write("<form method = 'post' action='/clan'>");
            res.write("<input type = 'submit' value = 'Clan' class='right' name = ''>");
            res.write("</form>");    
            res.write("<br>");
            res.write("<form method = 'post' action='/logout'>");
            res.write("<input type = 'submit' value = 'Logout' class='right' name = ''>");
            res.write("</form>");    
            res.write("<br>");
            res.write("	</div>	");
            res.write("	</div>	");
            res.write("	</div>	");
            res.write("	</header>	");
            var j =0;
            for(var i = rows.length-1; i > -1; i--)
            {   
                j++;
                res.write("	<article class = 'article'> 	");
                res.write("	<section class = 'section'>	");
                res.write("	<div class = 'post'>	");
                res.write("	<div class='top'> 	");

                res.write("<br><h3 style='margin-left : 15px;'>" + j + "위    " + rows[i].id + "</h3>");
                res.write("</div>");

                res.write("<div>");
                res.write("<h4>   Point : " + rows[i].point + "<br>   실력 : " + rows[i].handi + "</h4>");
                res.write("<br>");
                res.write("</div>");
                res.write("</div>");
                res.write("</section>");
                res.write("</article>");
                
                
            }
            res.write("</body>");
            res.write("</html>");
            res.end();
                
        }

        else
            console.log('Error while performing Query.', err);
    });
});


router.route('/logout').post(function(req, res){
    res.render('layout2-result.html');
});

module.exports = router;