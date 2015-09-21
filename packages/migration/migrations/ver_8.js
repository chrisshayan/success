Migrations.add({
    version: 8,
    name: "clear activites duplicated ",
    up: function () {
        // clear activity applied duplicated
        var activites = Collections.Activities.find({}).fetch();
        activites = _.groupBy(activites, function (d) {
            return d.data.applicationId;
        });
        _.each(activites, function(d) {
            _.each(_.rest(d), function(activity) {
                Collections.Activities.remove({_id: activity._id});
            });
        });
    },
    down: function () {
        console.log("down to version 7");
    }
});