/**
 * Created by HungNguyen on 9/22/15.
 */


var VNW_QUERIES = Meteor.settings.cronQueries;

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


var fetchVNWData = Meteor.wrapAsync(function (query, callback) {
    var conn = mysqlManager.getPoolConnection();

    conn.query(query, function (err, rows, fields) {
        if (err) throw err;
        conn.release();
        callback(err, rows);
    });
});

function processCandidates(candidateList) {
    var getCandidatesSQL = sprintf(VNW_QUERIES.getCandiatesInfo, candidateList);

    var candidateRows = fetchVNWData(getCandidatesSQL);

    console.log('row', candidateRows);

    candidateRows.forEach(function (row) {
        var candidate = Meteor.candidates.findOne({candidateId: row.userid});
        if (!candidate) {
            console.log('new candidate: ', row.userid);
            //console.log('new', row.userid, row.firstname);
            candidate = new Schemas.Candidate();
            candidate.candidateId = row.userid;
            candidate.data = row;
            candidate.createdAt = formatDatetimeFromVNW(row.createddate);
            Meteor.candidates.insert(candidate);


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
    })
}


Migrations.add({
    version: 11,
    name: "Fix missing candidates",
    up: function () {
        var emptyScoreApplication = Meteor.applications.find({
            source: {$ne: 3},
            candidateInfo: {'$exists': false}
        }, {
            fields: {
                source: 1,
                entryId: 1,
                candidateId: 1
            }

        }).fetch();
        console.log(emptyScoreApplication.length);

        var canLists = _.pluck(emptyScoreApplication, 'candidateId');
        console.log(canLists);
        if (canLists.length == 0) return;
        processCandidates(canLists);

        emptyScoreApplication.forEach(function (app) {
            var can = Meteor.candidates.findOne({candidateId: app.candidateId});

            if (can) {

                var candidateInfo = {
                    "firstName": can.data.firstname || can.data.firstName || '',
                    "lastName": can.data.lastname || can.data.lastName || '',
                    "emails": [
                        can.data.username, can.data.email, can.data.email1, can.data.email2
                    ]
                };

                candidateInfo.fullname = [candidateInfo.lastName, candidateInfo.firstName].join(' ');
                candidateInfo.emails = _.without(candidateInfo.emails, null, undefined, '');

                var modifier = {
                    '$set': {
                        candidateInfo: candidateInfo
                    }
                };

                Meteor.applications.update({candidateId: app.candidateId}, modifier);

            }


        });


    },
    down: function () {
        console.log("down to version 9");
    }
});