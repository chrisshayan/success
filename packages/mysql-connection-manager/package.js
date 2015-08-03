Package.describe({
    name: 'lab:mysql-connection-manager',
    version: '0.0.1',
    // Brief, one-line summary of the package.
    summary: '',
    // URL to the Git repository containing the source code for this package.
    git: '',
    // By default, Meteor will default to using README.md for documentation.
    // To avoid submitting documentation, set this field to null.
    documentation: 'README.md'
});

Npm.depends({
    'mysql-connection-manager': '0.0.10'
});

Package.onUse(function (api) {
    api.addFiles('mysql-connection-manager.js', 'server');
    api.export('mysqlManager', 'server');
});

Package.onTest(function (api) {
    api.use('tinytest');
    api.use('lab:mysql-connection-manager');
    api.addFiles('mysql-connection-manager-tests.js');
});
