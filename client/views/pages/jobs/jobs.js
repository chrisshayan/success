Template.jobs.onCreated(function() {
    var instance = Template.instance();
    instance.props = new ReactiveDict();
    instance.autorun(function(){
        instance.subscribe('jobs', {}, {});
    });
});

Template.jobs.helpers({
    items: function() {
        return Collections.Jobs.find();
    }
});

Template.jobItem.helpers({
    location: function() {
        console.log(this)
        return Locations[+this.city];
    },
    timeago: function() {
        return moment(this.modifiedAt).fromNow();
    }
});