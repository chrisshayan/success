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
        conn.release();
        _.each(rows, function (row) {
            var candidate = Collections.Candidates.findOne({userId: row.userid});

            if (!candidate) {
                var newCandidate = new Schemas.Candidate();
                newCandidate.candidateId = row.userid;
                newCandidate.data = row;
                newCandidate.createdAt = row.createddate;
                Meteor.defer(function () {
                    Collections.Candidates.insert(newCandidate);
                })
            } else {
                if (!_.isEqual(candidate.data, row)) {

                    Meteor.defer(function () {
                        Collections.Jobs.update(candidate._id, {
                            $set: {
                                data: row,
                                lastSyncedAt: new Date()
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