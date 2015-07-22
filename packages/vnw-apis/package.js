Package.describe({
    name: "lab:vnw-apis",
    summary: "Vietnamworks apis",
    version: "0.0.1"
});

Package.onUse(function (api) {
    var both = ['client', 'server'];
    /**
     * Packages depends
     */
    api.use([
        'check',
        'mongo',
        'aldeed:collection2',
        'matb33:collection-hooks',
        'aldeed:simple-schema',
        'aldeed:autoform'
    ], both);

    api.use([
        "pcel:mysql",
        "sgi:sprintfjs",
        "jparker:crypto-md5",
        "percolatestudio:synced-cron"
    ], 'server');

    api.addFiles('namespace.js');
    api.export('Recruit');

    api.addFiles([
        'lib/debuger.js',
        'lib/collections.js',
        'lib/schemas.js',
    ], both);

    api.addFiles([
        'lib/sync-vnw-db.js',
        'lib/cron.js',
        'lib/apis.js',
    ], 'server');

    /**
     * Export namespace
     */
    api.export(['Collections', 'Schemas','debuger'], both);
    api.export(['APIS', 'SYNC_VNW'], 'server');
});