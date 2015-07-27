pool = (function () {
    var options = Meteor.settings.mysql;
    options.connectionLimit = 100;

    return mysql.createPool(options);
})();


Meteor.startup(function () {
    Meteor.Mandrill.config({
        username: Meteor.settings.mandrill.username,
        key: Meteor.settings.mandrill.key
    });
});