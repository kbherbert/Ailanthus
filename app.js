//define the app's global variables
var http = require('http'),
		fs = require('fs'),
		path = require("path"),
		express = require("express"),
		logfmt = require("logfmt"),
		serverConfig = {
			port: Number(process.env.PORT || 8124),
			host: "0.0.0.0"
		},
		pjson = require('./package.json'),
		//identify all of our MIME types
		extensions = {
			".html": "text/html",
			".css": "text/css",
			".js": "application/javascript",
			".png": "image/png",
			".gif": "image/gif",
			".jpg": "image/jpeg"
		};

//define custom ArchaicTemplate engine
var archaicTemplates = function (template, data) {
	var vars = template.match(/\{{\w+\}}/g);
	if (!vars) {
		return template;
	}

	var nonVars = template.split(/\{{\w+\}}/g);
	var output = '';

	for (var i = 0; i < nonVars.length; i++) {
		output += nonVars[i];
		if (i < vars.length) {
			var key = vars[i].replace(/[\{{\}}]/g, '');
			output += data[key];
		}
	}

	return output;
};

var getFile = function (localPath, mimeType, res) {
	fs.readFile(localPath, function(err, data) {
		if (!err) {
			res.writeHead(200, {
				"Content-Type": mimeType,
				"Content-Length": data.length
			});
			res.write(archaicTemplates(data.toString(), { // use our template engine here
				name: 'Ailanthus',
				node: process.versions.node,
				v8: process.versions.v8,
				build: pjson.version,
				time: new Date()
			}));
			res.end();
		} else {
			res.writeHead(500);
			res.end();
		}
	});
};

//define our server configuration
var server = http.createServer(function (req, res) {
	// look for a filename in the URL, default to index.html
	var filename = path.basename(req.url) || "index.html",
			ext = path.extname(filename),
			dir = path.dirname(req.url).substring(1),
			localPath = __dirname + '/' + pjson.baseDir;

	if (extensions[ext]) {
		localPath += (dir ? dir + "/" : "") + filename;
		// verify that this file actually exists and load it, or else return a 404
		fs.exists(localPath, function(exists) {
			if (exists) {
				getFile(localPath, extensions[ext], res);
			} else {
				res.writeHead(404);
				res.end();
			}
		});
	}

});

//start our server
server.listen(serverConfig.port);
//output status to the terminal (console)
console.log('Ailanthus Node server is running at: '+ 'http://' + serverConfig.host + ':' + serverConfig.port);
