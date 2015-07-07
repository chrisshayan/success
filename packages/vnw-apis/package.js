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
    api.use(['mongo', 'accounts-base'], both);
    api.imply('accounts-base')
    api.use([
        "pcel:mysql",
        "sgi:sprintfjs",
        "jparker:crypto-md5",
        "percolatestudio:synced-cron"
    ], 'server');

    api.addFiles([
        'lib/collections.js',
        'lib/schemas.js'
    ], both);

    api.addFiles([
        'lib/sync-vnw-db.js',
        'lib/cron.js',
        'lib/apis.js',
    ], 'server');

    /**
     * Export namespace
     */
    api.export(['Collections', 'Schemas'], both);
    api.export(['APIS', 'SYNC_VNW'], 'server');
});