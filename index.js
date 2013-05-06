var crypto = require('crypto'),
	express = require('express');

exports.publicDir = path.join(__dirname, 'public');

exports.ngCsrf = function () {
	return express.csrf({value: function (req) {
		return req.get('x-xsrf-token');
	}});
}

exports.validRequest = function (req, key) {
	if (!key) key = 'auth_key';
	var auth_key = req.query[key];

	delete req.query[key];

    var sig = signature(req.query);

    req.query[key] = auth_key;

    return auth_key === sig;
}

var signature = exports.signature = function (req) {
	return Object.keys(req).sort().reduce(
		function (h, k) { return h.update(k + '=' + req[k], 'utf8') }, crypto.createHash('md5')).
			update(process.env.SECRET_KEY).digest('hex');
}

exports.connect = function (uri, cb) {
    require('massive').connect(uri, function(err, db) {
        return cb(err, db);
    });
}
