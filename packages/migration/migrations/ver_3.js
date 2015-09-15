Migrations.add({
    version: 3,
    name: "update job status",
    up: function () {
        var jobs = Collections.Jobs.find({}, {fields: {expiredAt: 1, status: 1}}).fetch();
        _.each(jobs, function (job) {
            var status = 0;
            if (moment(job.expiredAt).valueOf() >= Date.now())
                status = 1;
            Collections.Jobs.update({_id: job._id}, {$set: {status: status}});
        });
    },
    down: function () {
        console.log("down to version 3")
    }
});