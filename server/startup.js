Meteor.startup(function () {


    Mandrill.config({
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
                        console.log('Collection %s indexed %s !', key, result)
                    })
                })
            }
        });

    SYNC_VNW.sync();
    //CRON_VNW.cronCity();
    //CRON_VNW.cronDegree();

    if(Meteor.settings.migration) {
        Migrations.unlock();
        Migrations.migrateTo(Meteor.settings.migration);
    }


    var vnwOplogConnection = new MongoInternals.RemoteCollectionDriver("mongodb://127.0.0.1:4001/vnw_oplog");
    var VNWOplog = new Mongo.Collection('vnw_oplog', {_driver: vnwOplogConnection});
    VNWOplog.find({sync: false}).observeChanges({
        added: function(id, fields) {
            console.log('added', id, fields)
        }
    })
});