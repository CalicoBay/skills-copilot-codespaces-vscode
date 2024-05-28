// Create web server
// Load the http module to create an http server.
var http = require('http');
var fs = require('fs');
var url = require('url');
var querystring = require('querystring');
var path = require('path');
var port = 8080;

// Configure our HTTP server to respond with Hello World to all requests.
var server = http.createServer(function (request, response) {
    console.log('request ', request.url);

    var uri = url.parse(request.url).pathname;
    var filename = path.join(process.cwd(), uri);

    if (uri == '/comments' && request.method == 'POST') {
        var body = '';
        request.on('data', function (data) {
            body += data;
        });

        request.on('end', function () {
            var post = querystring.parse(body);
            console.log(post);
            fs.readFile('comments.json', 'utf8', function (err, data) {
                if (err) {
                    console.log(err);
                } else {
                    var obj = JSON.parse(data);
                    obj.comments.push(post);
                    fs.writeFile('comments.json', JSON.stringify(obj), function (err) {
                        if (err) {
                            console.log(err);
                        } else {
                            response.writeHead(200, { 'Content-Type': 'application/json' });
                            response.write(JSON.stringify(post));
                            response.end();
                        }
                    });
                }
            });
        });
    } else {
        fs.exists(filename, function (exists) {
            if (!exists) {
                response.writeHead(404, { "Content-Type": "text/plain" });
                response.write("404 Not Found\n");
                response.end();
                return;
            }

            if (fs.statSync(filename).isDirectory()) filename += '/index.html';

            fs.readFile(filename, "binary", function (err, file) {
                if (err) {
                    response.writeHead(500, { "Content-Type": "text/plain" });
                    response.write(err + "\n");
                    response.end();
                    return;
                }

                response.writeHead(200);
                response.write(file, "binary");
                response.end();
            });
        });
    }
});

// Listen on specified port
server.listen(port, function () {
    console.log('server started on port ' + port);
});