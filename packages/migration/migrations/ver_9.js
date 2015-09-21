Migrations.add({
    version: 9,
    name: "add missing activities for applied event",
    up: function () {
        var exceptIds = Collections.Activities.find({actionType: 2}).map(function(d) {
            return d.data.applicationId;
        });

        Collections.Applications.find({entryId: {$nin: exceptIds}}).forEach(function(app) {
            var activity = new Activity();
            activity.companyId = app.companyId;
            activity.data = {
                applicationId: app.entryId,
                source: app.source,
                candidateId: app.candidateId
            };
            activity.createdAt = app.createdAt;
            activity.appliedJob();
        });
    },
    down: function () {
        console.log("down to version 8");
    }
});