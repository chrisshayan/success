Template.activities.helpers({
    isData: function() {
        return Collections.Activities.find().count();
    },
    data: function() {
        return Collections.Activities.find();
    },
});
