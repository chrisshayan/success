Migrations.add({
    version: 17,
    name: "Set role for old hiringTeam recruiter",
    up: function () {
        Meteor.hiringTeam.find({roleId: {$not: /admin/}}).map(function (doc) {
            doc.roleId = 'recruiter';
            console.log('doc.email:', doc.email);
            doc.save();
        });
        
    },
    down: function () {
        console.log("down to version 15")
    }
});