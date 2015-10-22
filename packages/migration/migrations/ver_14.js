Migrations.add({
    version: 14,
    name: "add companyId to mail templates",
    up: function () {
        Collections.MailTemplates.find({companyId: {$exists: false}}).forEach(function (_t) {
            var user = Meteor.users.findOne({vnwId: _t.createdBy});
            if (user) {
                Collections.MailTemplates.update({_id: _t._id}, {'$set': {companyId: user.companyId}});
            }
        });
    },
    down: function () {
        console.log("down to version 12")
    }
});