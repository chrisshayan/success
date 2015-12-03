Package.describe({
    name: 'vnw:job-criteria',
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
    api.use('vnw:core');
    api.use('vnw:job');

    api.addFiles('job-criteria.js');

    api.addFiles(['common/config.js', 'common/model.js', 'common/extends.js']);

    api.addFiles(['server/publications.js', 'server/methods.js', 'server/startup.js'], ['server']);

    api.imply(['vnw:core']);
    api.imply(['vnw:job']);
    api.export(['JobCriteria', 'JobCriteriaSetTemplate', 'JobCriteriaSuggestion']);

});

Package.onTest(function (api) {
    api.use('ecmascript');
    api.use('tinytest');
    api.use('job-criteria');
    api.addFiles('job-criteria-tests.js');
});
