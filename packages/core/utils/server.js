Utils.VNW_QUERIES = Meteor.settings.queries;

Utils.fetchVNWData = Meteor.wrapAsync(function (query, callback) {
    var connection = mysqlManager.getPoolConnection();
    connection.query(query, function (err, rows, fields) {
        if (err) throw err;
        connection.release();
        callback(err, rows);
    });
});