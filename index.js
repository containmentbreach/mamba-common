var crypto = require('crypto'),
	express = require('express'),
	path = require('path');

exports.publicDir = path.join(__dirname, 'public');

express.logger.token('oid', function (req, res) { return (req.session && req.session.oid) || req.query.oid || '-'; });
express.logger.format('mamba', ':remote-addr/:oid ":method :url" :status :response-time ms ":user-agent"');

exports.express = express;

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
