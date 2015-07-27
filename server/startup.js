pool = (function () {
    var options = Meteor.settings.mysql;
    options.connectionLimit = 2;

    return mysql.createPool(options);
})();


Meteor.startup(function () {
    Meteor.Mandrill.config({
        username: Meteor.settings.mandrill.username,
        key: Meteor.settings.mandrill.key
    });

    /* create index */
    var options = Meteor.settings.indexMongo._options;
    var collections = Meteor.settings.indexMongo.collections;
    
    if (collections)
        _.each(collections, function (indexObj, key) {
            if (Collections[key]) {
                var col = Collections[key].rawCollection();
                indexObj.forEach(function (obj) {
                    col.createIndex(obj, options, function (err, result) {
                        if (err) throw err;
                        console.log('indexed : %s !', result)
                    })
                })
            }
        });

});