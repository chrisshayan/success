Package.describe({
    name: 'vnw:user',
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
    api.versionsFrom('0.9.0');

    api.use(["vnw:core"]);
    api.use("accounts-password")

    /* namespace */
    api.addFiles(['user.js']);

    /* model */
    api.addFiles(['common/model.js', 'common/extends.js']);

    /* methods, api */
    api.addFiles(['server/methods.js', 'server/publications.js'], ['server']);

    /* imply */
    api.imply('vnw:core');
    api.imply(["socialize:user-model"]);

    api.export('UserApi')
});

Package.onTest(function (api) {
    api.use('tinytest');
    api.use('vnw:user');
    api.addFiles('user-tests.js');
});
