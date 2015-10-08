function initENV() {
    var CUSTOM_ENV = process.env;
    // share env to public
    if (CUSTOM_ENV.hasOwnProperty('RESUME_DETAIL_URL')) {
        Meteor.settings.public['applicationUrl'] = CUSTOM_ENV.RESUME_DETAIL_URL;
    }
}


Meteor.startup(function () {
    initENV();

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

    if (process.env.MIGRATION) {
        Migrations.unlock();
        Migrations.migrateTo(process.env.MIGRATION);
    }

    CRON_VNW.sync();
    /*
     CRON_VNW.cronCity();
     CRON_VNW.cronDegree();*/


    //CRON_VNW.startupSync();


    generateFixtures();
});

function generateFixtures() {
    if (Meteor.users.find().count() < 5) {
        _.each(_.range(0, 20), function (i) {
            var profile = {
                firstname: faker.name.firstName(),
                lastname:faker.name.lastName()
            };
            var e = faker.internet.email();
            var userId = Accounts.createUser({
                email: e,
                password: '123456'
            });
            Meteor.users.update({_id: userId}, {$set: {profile: profile}});
        });
    }
}