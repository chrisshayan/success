/**
 * Created by HungNguyen on 9/22/15.
 */

var VNW_QUERIES = Meteor.settings.cronQueries;

var fetchVNWData = Meteor.wrapAsync(function (query, callback) {
    var conn = mysqlManager.getPoolConnection();

    conn.query(query, function (err, rows, fields) {
        if (err) throw err;
        conn.release();
        callback(err, rows);
    });
});

Migrations.add({
    version: 10,
    name: "Fix missing matchingScore",
    up: function () {
        var emptyScoreApplication = Meteor.applications.find({matchingScore: {'$in': [null, 0]}}, {
            fields: {
                source: 1,
                entryId: 1
            }

        }).fetch();

        var grouped = _.groupBy(emptyScoreApplication, 'source');

        var onlineApps = grouped['1']
            , directApps = grouped['2'];

        if (onlineApps) {
            console.log('online : ', _.pluck(onlineApps, 'entryId').join(','));
            var appOnlineSQL = sprintf(VNW_QUERIES.pullAllAppsOnline, _.pluck(onlineApps, 'entryId').join(','));
            var appOnlineRows = fetchVNWData(appOnlineSQL);

            appOnlineRows.forEach(function (item) {
                Meteor.applications.update({entryId: item.entryid}, {'$set': {matchingScore: item.matchingScore}});
            });
        }

        if (directApps) {
            console.log('direct: ', _.pluck(directApps, 'entryId').join(','));
            var appDirectSQL = sprintf(VNW_QUERIES.pullAllAppsDirect, _.pluck(directApps, 'entryId').join(','));
            var appDirectRows = fetchVNWData(appDirectSQL);

            appDirectRows.forEach(function (item) {
                Meteor.applications.update({entryId: item.sdid}, {'$set': {matchingScore: item.matchingScore}});
            });
        }

    },
    down: function () {
        console.log("down to version 9");
    }
});