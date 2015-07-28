/**
 * Created by HungNguyen on 7/27/15.
 */

var VNW_TABLES = Meteor.settings.tables,
    VNW_QUERIES = Meteor.settings.queries;
var getPoolConnection = Meteor.wrapAsync(function (callback) {
    pool.getConnection(function (err, connection) {
        callback(err, connection);
    });
});

var fetchVNWData = Meteor.wrapAsync(function (connection, query, callback) {
    connection.query(query, function (err, rows, fields) {
        if (err) throw err;
        callback(err, rows);
    });
});


SYNC_VNW.syncApplicationScores = function (entryIds) {
    check(entryIds, Array);
    if (entryIds.length < 1) return;
    var conn = getPoolConnection();
    var pullApplicationScoreSql = sprintf(VNW_QUERIES.pullApplicationScores, entryIds.join(","));

    try {
        var rows = fetchVNWData(conn, pullApplicationScoreSql);
        conn.release();
        _.each(rows, function (row) {
            var application = Collections.Applications.findOne({entryId: row.applicationId});
            if (application) {
                if (!_.isEqual(application.matchingScore, row.matchingScore)) {
                    Meteor.defer(function () {
                        Collections.Applications.update(application._id, {
                            $set: {
                                matchingScore: row.matchingScore
                            }
                        });
                    })
                }
            }
        });

    } catch (e) {
        conn.release();
        debuger(e);
    }
}