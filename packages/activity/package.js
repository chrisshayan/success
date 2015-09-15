Package.describe({
    name: 'vnw:activity',
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
    api.versionsFrom('1.1.0.3');

    api.use(["vnw:core"]);
    api.use(["vnw:company"]);
    api.use(["vnw:user"]);
    api.use(["vnw:job"]);
    api.use(["vnw:application"]);

    /* namespace */
    api.addFiles('activity.js');

    /* model */
    api.addFiles(['common/config.js', 'common/model.js', 'common/extends.js']);

    /* methods, api */
    api.addFiles(['server/methods.js', 'server/publications.js'], ['server']);

    /* imply changes */
    api.imply('vnw:core');
    /* export */
    api.export('Candidate');
});

Package.onTest(function (api) {
    api.use('tinytest');
    api.use('vnw:activity');
    api.addFiles('activity-tests.js');
});
