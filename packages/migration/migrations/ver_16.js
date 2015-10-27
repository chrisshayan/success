Migrations.add({
    version: 16,
    name: "Add benefit and tags",
    up: function () {
        Collections.Jobs.find({}).map(function (job) {
            var benefits = CRON_VNW.getBenefits(job.jobId)
                , tags = CRON_VNW.getJobTags(job.jobId);
            var modifier = {
                '$set': {
                    benefits: benefits,
                    skills: tags
                }
            };

            Collections.Jobs.update({_id: job._id}, modifier);
        });
    },
    down: function () {
        console.log("down to version 15")
    }
});