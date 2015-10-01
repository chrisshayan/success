SyncedCron.options = {
    log: false,
    collectionName: 'cronHistory',
    utc: false,
    collectionTTL: 172800
};

var syncData = function () {
    /*SyncedCron.add({
        name: 'Pull and sync jobs, applications from vietnamworks',
        schedule: function (parser) {
            return parser.text(Meteor.settings.private.cronJobSchedule);
        },
        job: function () {
            CRON_VNW.cron();
        }
    });*/
    SyncedCron.add({
        name: 'Pull and sync skill term from VNW',
        schedule: function (parser) {
            return parser.recur().on(0, 12).hour();
        },
        job: function () {
            CRON_VNW.cronSkills();
        }
    });
};


Meteor.startup(function () {
    syncData();
    SyncedCron.start();
});