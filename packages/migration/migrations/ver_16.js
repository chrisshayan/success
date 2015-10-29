Migrations.add({
    version: 16,
    name: "Add benefit and tags",
    up: function () {
        //Collections.Jobs.find({}).map(function (job) {
        Meteor['jobs'].find({}).map(function (job) {
            if (typeof job.jobId !== 'number') return;

            var benefits = CRON_VNW.getBenefits(job.jobId)
                , tags = CRON_VNW.getJobTags(job.jobId)
                , cities = CRON_VNW.getLocations(job.jobId);
            var modifier = {
                '$set': {
                    benefits: benefits,
                    skills: tags,
                    locations: cities
                }
            };

            //Collections.Jobs.update({_id: job._id}, modifier);
            Meteor['jobs'].update({_id: job._id}, modifier);


        });
    },
    down: function () {
        console.log("down to version 15")
    }
});