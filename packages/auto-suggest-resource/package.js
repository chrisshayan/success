Package.describe({
    name: 'auto-suggest-resource',
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
    api.use(['vnw:core', 'vnw:job']);

    api.addFiles('auto-suggest-resource.js');

    /* model */
    api.addFiles(['common/config.js', 'common/model.js', 'common/extends.js']);

    /* methods, api */
    api.addFiles(['server/methods.js', 'server/publications.js'], ['server']);

    /* imply changes */
    api.imply(['vnw:core', 'vnw:company', 'vnw:job', 'vnw:candidate']);

    /* export */
    api.export(['Skills']);
});

Package.onTest(function (api) {
    api.use('ecmascript');
    api.use('tinytest');
    api.use('auto-suggest-resource');
    api.addFiles('auto-suggest-resource-tests.js');
});
