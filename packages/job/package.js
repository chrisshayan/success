Package.describe({
    name: 'vnw:job',
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
    api.use(["vnw:core"]);
    api.use('vnw:user');
    api.use('vnw:company');

    api.addFiles(['job.js']);

    api.addFiles(['common/config.js', 'common/model.js', 'common/extends.js', 'common/job-level-model.js']);

    api.addFiles(['server/publications.js', 'server/methods.js', 'server/startup.js'], ['server']);

    api.imply('vnw:core');
    api.imply('vnw:user');
    api.imply('vnw:company');

    api.export(['vnwJob', 'User']);
});

Package.onTest(function (api) {
    api.use('tinytest');
    api.use('vnw:job');
    api.addFiles('job-tests.js');
});
