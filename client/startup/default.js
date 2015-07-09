// Run this when the meteor app is started
Meteor.startup(function () {
    Session.set('now', new Date());
    Meteor.setInterval(function() {
        Session.set('now', new Date());
    }, 1000);
});
