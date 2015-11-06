var _Applications = Collections.Applications.rawCollection();
var countApplication = Meteor.wrapAsync(function(jobId, callback) {
    _Applications.aggregate([{$match: {jobId: jobId}}, {
        $group: {
            _id: "$stage",
            count: {$sum: 1}
        }
    }], function(err, result) {
        callback(err, result);
    });
});

Migrations.add({
    version: 18,
    name: "Embed stage application counter into job",
    up: function () {
        Collections.Jobs.find({stages: {$exists: false}}).forEach(function (job) {

            var stages = {
                0: 0,
                1: 0,
                2: 0,
                3: 0,
                4: 0,
                5: 0
            };

            var result = countApplication(job.jobId);

            _.each(result, function (stage) {
                stages[stage._id] = stage.count;
            });

            Collections.Jobs.update({_id: job._id}, {
                $set: {stages: stages}
            });
        });
    },
    down: function () {
        console.log("down to version 15")
    }
});