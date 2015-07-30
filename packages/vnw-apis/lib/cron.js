SyncedCron.options = {
    log: false,
    collectionName: 'cronHistory',
    utc: false,
    collectionTTL: 172800
};

var syncData = function () {
    SyncedCron.add({
        name: 'Pull and sync jobs, applications from vietnamworks',
        schedule: function (parser) {
            return parser.text(Meteor.settings.private.cronJobSchedule);
        },
        job: function () {
            SYNC_VNW.sync();
        }
    });
};


Meteor.startup(function () {
    syncData();
    SyncedCron.start();
});