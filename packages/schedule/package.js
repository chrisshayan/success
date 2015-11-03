Package.describe({
    name: 'schedule',
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


    api.use(["vnw:core", "stevezhu:lodash"]);
    api.use('vnw:job');


    api.addFiles('schedule.js');

    api.addFiles(['common/config.js', 'common/model.js', 'common/extends.js', 'common/job-level-model.js']);

    api.addFiles(['server/publications.js', 'server/methods.js', 'server/startup.js'], ['server']);

    api.imply('vnw:core');
    api.imply('vnw:user');
    api.imply('vnw:company');

    api.export(['Schedule', 'vnwJob']);
    api.export(['Schedule', 'vnwJob']);
});

Package.onTest(function (api) {
    api.use('ecmascript');
    api.use('tinytest');
    api.use('schedule');
    api.addFiles('schedule-tests.js');
});
