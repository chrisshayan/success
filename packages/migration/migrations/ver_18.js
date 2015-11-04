Migrations.add({
    version: 18,
    name: "move old job to vnwJob package model",
    up: function () {
        /*Collections.Jobs.find({}).map(function (job) {
         //console.log(job);
         var vnwJobModel = new vnwJob(job);
         if (typeof vnwJobModel.jobId == 'string')
         delete vnwJobModel.jobId;

         var aid = vnwJobModel.save();

         Meteor['jobs'].find({jobId : job.jobId});

         console.log(job._id , aid._id);
         })*/

        Meteor.jobs.find({}).map(function (job) {
            if (typeof  job.jobId === 'number') {
                job.source = 'vietnamworks';
                job.sourceId = job.jobId;
                delete job.jobId;
            } else {
                job.source = 'success';
            }
        });

        Meteor.applications.find({}).map(function (app) {
            if (typeof  app.jobId === 'number') {
                app.source = 'vietnamworks';
                app.sourceId = app.jobId;
                delete app.jobId;
            } else {
                app.source = 'success';
            }
        });


    },
    down: function () {
        console.log("down to version 17")
    }
});