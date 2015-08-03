var crypto = Npm.require('crypto');

/*
 connection = mysql.createConnection(Meteor.settings.mysql);
 connection.connect(function (err) {
 if (err) {
 console.error('error connecting: ' + err.stack);
 return;
 }

 debuger('connected as id ' + connection.threadId);
 });
 */

VNW_TABLES = Meteor.settings.tables;
VNW_QUERIES = Meteor.settings.queries;

/**
 * Vietnamworks APIs
 */
APIS = {};

/**
 * check login
 * @param username {String}
 * @param password {String}
 * @param type {Integer} Account type: 1 is employer, 2 is job seeker
 * @param callback {Function}
 * @return async response: {Object}
 */
APIS.login = function (username, password, type, callback) {
    // validate input data
    check(username, String);
    check(password, String);

    check(type, Number);

    // Hash password
    var hash = crypto.createHash(Meteor.settings.private.passwordHash);
    hash.update(password);
    password = hash.digest('hex');

    /**
     * Result structure
     */
    var result = {
        success: false,
        msg: "Your username/password or security settings may be incorrect",
        data: null
    };

    var sql = sprintf(VNW_QUERIES.checkLogin, username, password, type);
    var conn = mysqlManager.getPoolConnection();

    conn.query(sql, function (err, rows, fields) {
        if (err) throw err;
        if (rows.length === 1) {
            result.success = true;
            result.msg = "";
            result.data = rows[0];
        }
        conn.release();
        callback(null, result);

    });
};
