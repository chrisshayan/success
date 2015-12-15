Package.describe({
    name: 'vnw:sync-data',
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
    api.use(['stevezhu:lodash', 'lab:vnw-apis']);
    api.use(['success:application']);

    api.addFiles(['sync-data.js'], 'server');
    api.addFiles(['jobs/applications.js', 'jobs/jobs.js'], 'server');

    api.export('sJobCollections');


});

Package.onTest(function (api) {
    api.use('ecmascript');
    api.use('tinytest');
    api.use('sync-data');
    api.addFiles('sync-data-tests.js');
});
