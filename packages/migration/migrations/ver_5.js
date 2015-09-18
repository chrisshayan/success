Migrations.add({
    version: 5,
    name: "get missing cv",
    up: function () {
        // integration go here;
        var directApplication = Collections.Applications.find({source: 1, 'data.resumeid': {'$exists': false}}, {
            fields: {source: 1}
        }).fetch();
        var directIds = _.pluck(directApplication, '_id');

        Collections.Applications.update({_id: {$in: directIds}}, {
            '$set': {
                source: 2
            }
        }, {multi: true});

        var resumeIds = [];

        Collections.Applications.find({'data.resumeid': {'$exists': true}}).map(function (application) {
            Collections.Applications.update({_id: application._id},
                {
                    '$set': {
                        'resumeId': application.data.resumeid
                    }
                });

            resumeIds.push(application.data.resumeid);
        });
        CRON_VNW.cronResume(resumeIds);
    },
    down: function () {
        console.log("down to version 4");
    }
});