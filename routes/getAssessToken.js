var express = require('express');
var https = require('https'); // 引入https模块
var util = require('util'); // 引入util工具包格式化路径
var fs = require('fs'); // 引入fs更新本地文件
var router = express.Router();
var accessTokenJson = require('../data/assess_token');
var configJson = require('../data/config');

/* GET users listing. */
router.get('/', function(req, res, next) {

    new Promise(function(resolve,reject) {
        //获取当前时间 
        var currentTime = new Date().getTime();
        //格式化请求地址
        var url = util.format(configJson.apiURL.accessTokenApi,configJson.apiDomain,configJson.appID,configJson.appScrect);
        
        //判断 本地存储的 access_token 是否有效
        if (accessTokenJson.access_token === "" || accessTokenJson.expires_time < currentTime) {

            https.get(url, function(res){
                var buffer = [],result = "";
                // 监听 data 事件
                res.on("data",function(data){
                    buffer.push(data);
                });
                res.on("end",function() {
                    // result = JSON.stringify(Buffer.concat(buffer,buffer.length).toString('utf-8'));
                    
                    var body = Buffer.concat(buffer);
                    result = JSON.parse(body);

                    if (body.indexOf("errcode") < 0) {
                        accessTokenJson.access_token = result.access_token;
                        accessTokenJson.expires_time = new Date().getTime() + (parseInt(result.expires_in) - 200) * 1000;
                        //更新本地存储的
                        fs.writeFile('/home/nodeApp/wxApp/data/access_token.json', JSON.stringify(accessTokenJson));
                        //将获取后的 access_token 返回
                        resolve(accessTokenJson.access_token);

                    } else {
                        //将错误返回
                        resolve(result);
                    }
                })

            }).on('error',function(err){
                reject1(err);
            });
        } else {
            //将本地存储的 access_token 返回
            resolve(accessTokenJson.access_token);  
        }
    }).then(function(data) {
        res.send(data);
    });
    
});

module.exports = router;