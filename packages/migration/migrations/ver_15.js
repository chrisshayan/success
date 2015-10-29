Migrations.add({
    version: 15,
    name: "add owner into hiringTeam default",
    up: function () {
        Collections.Users.find().map(function (user) {
            var data = {
                userId: user.vnwId,
                companyId: user.companyId
            };
            CRON_VNW.setupHiringTeamOnwerInfo(data);
        });

        //Collections.Jobs.find({}).map(function (job) {
        Meteor['jobs'].find({}).map(function (job) {
            var modifier = {
                '$set': {
                    benefits: ''
                }, '$unset': {
                    benifits: ''
                }
            };

            //Collections.Jobs.update({_id: job._id}, modifier);
            Meteor['jobs'].update({_id: job._id}, modifier);
        });
    },
    down: function () {
        console.log("down to version 14")
    }
});