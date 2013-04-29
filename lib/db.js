exports.connect = function (uri, cb) {
    require('massive').connect(uri, function(err, db) {
        exports.db = db;
        exports.run = db.run;
        exports.users = db.users;
        exports.payments = db.payments;
        return cb(err, db);
    });
};
