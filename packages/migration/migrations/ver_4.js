Migrations.add({
    version: 4,
    name: "add field isDeleted to application that added from Success",
    up: function () {
        Meteor.applications.update(
            {source: 3, isDeleted: {$exists: false}},
            {$set: {isDeleted: 0}},
            {multi: true}
        )
    },
    down: function () {
        console.log("down to version 4");
    }
});