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
                    var candidate = Meteor.candidates.findOne({candidateId: row.userid});

                    if (!candidate) {
                        candidate = new Candidate();
                    }

                    candidate.candidateId = row.userid;
                    candidate.username = row.username;
                    candidate.password = row.userpass;
                    candidate.source = {
                        sourceId: 1,
                        candidateId: row.userid
                    };
                    candidate.firstname = row.firstname;
                    candidate.lastname = row.lastname;
                    candidate.email = row.email;
                    candidate.email1 = row.email1;
                    candidate.email2 = row.email2;
                    candidate.genderId = row.genderid;
                    candidate.jobTitle = row.jobtitle;
                    candidate.workingCompany = row.workingCompanyName;

                    //candidate.data = job.vnwData = EJSON.parse(EJSON.stringify(row));;
                    //candidate.vnwData = job.vnwData = EJSON.parse(EJSON.stringify(row));;
                    //console.log(candidate);

                    //console.log('date', row);
                    var updatedDate = formatDatetimeFromVNW(row.lastdateupdated);

                    if (parseTimeToString(candidate.updatedAt) != parseTimeToString(updatedDate)) {
                        candidate.createdAt = formatDatetimeFromVNW(row.createddate);
                        candidate.updatedAt = updatedDate || candidate.createdAt;

                        //TODO : in the future, the 3rd job will care this one
                        //console.log(candidate);
                        candidate.save();
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