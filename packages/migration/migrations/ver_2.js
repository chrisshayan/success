Migrations.add({
    version: 2,
    name: "Transform job to new schema",
    up: function () {
        var jobs = Collections.Jobs.find({source: {$ne: 'recruit'}}).fetch();
        _.each(jobs, function (old) {
            if(!old.hasOwnProperty('data')) return; // skip if transformed

            var job = {
                companyId: old.companyId,
                jobId: old.jobId,
                userId: old.userId,
                source: 'vnw',
                title: old.data.jobtitle,
                level: '',
                categories: [],
                locations: [],
                salaryMin: old.data.salarymin,
                salaryMax: old.data.salarymax,
                showSalary: true,
                description: old.data.jobdescription,
                requirements: old.data.skillexperience,
                benifits: '',
                recruiterEmails: _.unique(old.data.emailaddress.toLowerCase().match(/[A-Za-z\.0-9_]+@[a-zA-Z\.0-9_]+/g)),
                skills: [],
                vnwData: old.data,
                status: 0,
                createdAt: old.data.createddate,
                updatedAt: old.updatedAt,
                expiredAt: old.data.expireddate
            };

            if(moment(job.expiredDate).valueOf()  < Date.now()) {
                job.status = 0; // closed job
            } else {
                job.status = 1; // open job
            }
            Collections.Jobs.update({_id: old._id}, job);
        });


    },
    down: function () {
        console.log("cannot downgrade");
    }
});
