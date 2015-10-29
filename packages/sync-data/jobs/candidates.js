/**
 * Created by HungNguyen on 10/1/15.
 */

var _ = lodash;

function formatDatetimeFromVNW(datetime) {
    var d = moment(datetime);
    var offsetBase = 420;
    var offsetServer = new Date().getTimezoneOffset();
    var subtract = offsetBase + offsetServer;
    d.subtract(subtract, 'minute');
    return d.toDate();
}

function formatDatetimeToVNW(datetime) {
    var d = moment(datetime);
    var offsetBase = -420;
    var offsetServer = new Date().getTimezoneOffset();
    var subtract = offsetBase + offsetServer;
    d.subtract(subtract, 'minute');
    return d.toDate();
}

function parseTimeToString(date) {
    return moment(date).format('YYYY-MM-DD HH:mm:ss');
}

var VNW_QUERIES = Meteor.settings.cronQueries;


var fetchVNWData = Meteor.wrapAsync(function (query, callback) {
    var conn = mysqlManager.getPoolConnection();

    conn.query(query, function (err, rows, fields) {
        if (err) throw err;
        conn.release();
        callback(err, rows);
    });
});


var Candidates = {
    addCandidate: function (jb, cb) {
        var data = jb.data;
        try {
            if (data.candidateId) {
                var candidateId = data.candidateId;
                if (!candidateId) return false;
                var getCandidatesSQL = sprintf(VNW_QUERIES.getCandiatesInfo, candidateId);
                var candidateRows = fetchVNWData(getCandidatesSQL);

                candidateRows.forEach(function (row) {
                    var candidate = Collections.Candidates.findOne({candidateId: row.userid});
                    if (!candidate) {
                        //console.log('new candidate: ', row.userid);
                        //console.log('new', row.userid, row.firstname);
                        candidate = new Schemas.Candidate();
                        candidate.candidateId = row.userid;
                        candidate.data = row;
                        candidate.createdAt = formatDatetimeFromVNW(row.createddate);
                        console.log('add new candidate: ', row.userid);
                        Collections.Candidates.insert(candidate);

                    } else {
                        //TODO : in the future, the 3rd job will care this one
                        if (!_.isEqual(candidate.data, row)) {
                            //Collections.Jobs.update(candidate._id, {
                            Meteor['jobs'].update(candidate._id, {
                                $set: {
                                    data: row,
                                    lastSyncedAt: new Date()
                                }
                            });
                        }
                    }
                });
            }
            jb.done();
            cb();
        } catch (e) {
            jb.fail();
            cb();
            throw e;
        }
    },
    updateCandidate: function (candidates) {

    }
};

sJobCollections.registerJobs('addCandidate', Candidates.addCandidate);
sJobCollections.registerJobs('updateCandidate', Candidates.updateCandidate);