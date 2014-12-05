// imports
var request = require("request");
var fs = require('fs');
var cheerio = require('cheerio');

var config = {
    baseUrl: 'http://arhiva.plusinfo.mk/vest/',
    reqStart: 30000,
    reqEnd: 40000 // number of requests
};
for (var i = config.reqStart; i < config.reqEnd; i++) {
    sendRequest(config.baseUrl, i);
}
function sendRequest(baseUrl, i) {
    request.get(baseUrl + i + '/', function (error, response, body) {
        if (!error && response.statusCode == 200) {
            var html = cheerio.load(body);
            var text = html('.glavenText').text();
            if (text) {
                fs.writeFile("db/html/file" + i, text, function (err) {
                    if (err) console.log(err);
                    else console.log(i, "The file was saved!");
                });
            }
        }
    });
}