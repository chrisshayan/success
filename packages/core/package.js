Package.describe({
    name: 'vnw:core',
    version: '0.0.1',
    // Brief, one-line summary of the package.
    summary: '',
    // URL to the Git repository containing the source code for this package.
    git: '',
    // By default, Meteor will default to using README.md for documentation.
    // To avoid submitting documentation, set this field to null.
    documentation: 'README.md'
});

Package.onUse(function (api) {
    api.versionsFrom('0.9.1');
    api.addFiles('core.js');
    /* import using packages */
    api.use([
        "socialize:user-model@0.1.4",
        "momentjs:moment@2.10.6",
        "accounts-password",
        "lab:mysql-connection-manager",
        "reywood:publish-composite"
    ]);

    api.addFiles('utils/common.js', ['server', 'client']);
    api.addFiles('utils/server.js', 'server');
    api.addFiles('utils/client.js', 'client');

    /* public modules */
    api.imply([
        "socialize:user-model",
        "accounts-password",
        "lab:mysql-connection-manager"
    ]);

    api.export(['Core','Utils']);

});

Package.onTest(function (api) {
    api.use('tinytest');
    api.use('leaderio:core');
    api.addFiles('core-tests.js');
});
