Package.describe({
    name: 'activities',
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
    api.versionsFrom('1.2.0.2');
    api.use('ecmascript');
    api.use(["vnw:core"]);
    api.use(["vnw:user"]);
    api.use(["vnw:company"]);
    api.use(["vnw:candidate"]);

    /* namespace */
    api.addFiles(['activities.js']);

    /* model */
    api.addFiles(['common/config.js', 'common/model.js', 'common/extends.js']);

    /* methods, api */
    api.addFiles(['server/methods.js', 'server/publications.js'], ['server']);

    /* imply changes */
    api.imply(['vnw:core', 'vnw:user', 'vnw:candidate', 'vnw:company']);

    /* export */
    api.export('Activities');

});

Package.onTest(function (api) {
    api.use('ecmascript');
    api.use('tinytest');
    api.use('activities');
    api.addFiles('activities-tests.js');
});
