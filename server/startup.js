pool = (function () {
    var options = Meteor.settings.mysql;
    options.connectionLimit = undefined;

    return mysql.createPool(options);
})();

poolCount = 0;

pool.on('connection', function (connection) {
    poolCount++;
    console.log('connecting:', poolCount);
});

pool.on('enqueue', function () {
    poolCount--;
    console.log('connecting:', poolCount);
});


Meteor.startup(function () {
    Meteor.Mandrill.config({
        username: Meteor.settings.mandrill.username,
        key: Meteor.settings.mandrill.key
    });
});