if(Meteor.isClient) {
    Meteor.startup(function() {
        _ = lodash;
    })
}

if(Meteor.isServer) {
    Meteor.startup(function() {
        _ = lodash;
    })
}