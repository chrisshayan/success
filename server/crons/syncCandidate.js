/**
 * Created by HungNguyen on 7/24/15.
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


SYNC_VNW.syncCandidates = function (candidates) {
    check(candidates, Array);
    if (candidates.length < 1) return;

    var canlist = candidates.join(',');
    var conn = getPoolConnection();
    var pullCandidatesSql = sprintf(VNW_QUERIES.pullCandidates, canlist);

    try {
        var rows = fetchVNWData(conn, pullCandidatesSql);
        _.each(rows, function (row) {
            var can = Collections.Candidates.findOne({userId: row.userid});

            if (!can) {
                var can = new Schemas.Candidate();
                can.candidateId = row.userid;
                can.data = row;
                can.createdAt = row.createddate;
                Collections.Candidates.insert(can);
            } else {
                if (!_.isEqual(can.data, row)) {
                    Collections.Jobs.update(can._id, {
                        $set: {
                            data: row,
                            lastSyncedAt: new Date()
                        }
                    });
                }
            }
        });
        conn.release();

    } catch (e) {
        conn.release();
        debuger(e);
    }
}