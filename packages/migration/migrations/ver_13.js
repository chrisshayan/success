Migrations.add({
    version: 13,
    name: "replace vnw id to _id for activities",
    up: function () {
        Collections.Activities.find({}).forEach(function(_item) {
            if(_item.data.applicationId) {
                var app = Meteor.applications.findOne({entryId: _item.data.applicationId});
                if(app) {
                    Collections.Activities.update({_id: _item._id}, {
                        $set: {
                            "data.applicationId": app._id
                        }
                    });
                }
            }

        });
    },
    down: function() {
        console.log("down to version 12")
    }
});