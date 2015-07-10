debuger = function (log) {
    if (Meteor.settings.isDevelopment) {
        console.log(log);
    }
}