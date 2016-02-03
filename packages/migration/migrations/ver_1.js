Migrations.add({
    version: 1,
    name: "test migration",
    up: function () {
        Meteor.users.find({vnwData: {$exists: true}}).map(function (emp) {

            var user = Meteor.users.findOne({_id: emp._id});
            var email = emp.emails[0].address;
            var hiringTeamItem = Meteor['hiringTeam'].findOne({email: email});

            if (!hiringTeamItem) {
                hiringTeamItem = new HiringTeam();
                hiringTeamItem.companyId = user.companyId;
                hiringTeamItem.email = email;
                hiringTeamItem.username = user.username;
                hiringTeamItem.roleId = 'admin';
                hiringTeamItem.status = 1;
                hiringTeamItem.name = [user.profile.firstname, user.profile.lastname].join(' ').trim();

                if (!hiringTeamItem.name.length)
                    hiringTeamItem.name = 'admin';

            }

            hiringTeamItem.save();

            user.isAssigned = true;
            user.save();

        });


    },
    down: function () {
        console.log("down to version 1")
    }
});