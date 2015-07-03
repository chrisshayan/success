var connection = mysql.createConnection(Meteor.settings.mysql);
connection.connect(function(err) {
    if (err) {
        console.error('error connecting: ' + err.stack);
        return;
    }

    console.log('connected as id ' + connection.threadId);
});

var VNW_TABLES = Meteor.settings.tables;
var VNW_QUERIES = Meteor.settings.queries;

/**
 * Vietnamworks APIs
 */
APIS = {}
/**
 * check login
 * @param username {String}
 * @param password {String}
 * @param callback {Function}
 * @return async response: {Object}
 */
APIS.login = function (username, password, callback) {
    // validate input data
    check(username, String);
    check(password, String);

    // Hash password
    password = CryptoJS.MD5(password);

    /**
     * Result structure
     */
    var result = {
        success: false,
        msg: "Your username/password or security settings may be incorrect",
        data: null
    };

    var sql = sprintf(VNW_QUERIES.checkLogin, username, password);
    connection.query(sql, function (err, rows, fields) {
        if (err) throw err;
        if ( rows.length === 1 ) {
            result.success = true;
            result.msg = "";
            result.data = rows[0];
        }
        callback(null, result);
    });
};