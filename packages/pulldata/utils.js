/**
 * Created by HungNguyen on 9/15/15.
 */


var VNW_QUERIES = Meteor.settings.queries;
var pullCompanyInfoSql = sprintf(Utils.VNW_QUERIES.pullCompanyInfo, companyId);

Utils.formatDatetimeFromVNW = function (datetime) {
    var d = moment(datetime);
    var offsetBase = 420;
    var offsetServer = new Date().getTimezoneOffset();
    var subtract = offsetBase + offsetServer;
    d.subtract(subtract, 'minute');
    return d.toDate();
};

Utils.parseTimeToString = function (date) {
    return moment(date).format('YYYY-MM-DD HH:mm:ss');
};


Utils.fetchVNWData = Meteor.wrapAsync(function (query, callback) {
    var conn = mysqlManager.getPoolConnection();

    conn.query(query, function (err, rows, fields) {
        if (err) throw err;
        conn.release();
        callback(err, rows);
    });
});
