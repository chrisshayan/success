Package.describe({
    name: 'lab:accounts-vnw',
    version: '0.0.1',
    // Brief, one-line summary of the package.
    summary: 'A Login service for Vietnamworks',
    // URL to the Git repository containing the source code for this package.
    git: '',
    // By default, Meteor will default to using README.md for documentation.
    // To avoid submitting documentation, set this field to null.
    documentation: 'README.md'
});

Package.onUse(function (api) {
    api.versionsFrom('0.9.0');
    configure(api);
});

Package.onTest(function (api) {
    api.use('tinytest');
    api.use('lab:accounts-vnw');
    api.addFiles('accounts-vnw-tests.js');
});

/**
 * Package configuration
 * @param api
 */
function configure(api) {
    var both = ['client', 'server'];

    // Package dependencies
    api.use([
        'underscore',
        'ejson',
        'reactive-var',
    ], both);

    api.use('ui', 'client');
    api.use('steeve:reactive-cookie', 'client');

    api.addFiles('accounts-vnw.js', 'server');
    api.addFiles([
        'accounts-vnw.client.js',
        'global.client.js'
    ], 'client');
}
