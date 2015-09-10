Package.describe({
    name: 'vnw:city',
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
    api.use("vnw:core");
    api.addFiles('common/city-model.js');
    api.addFiles('server/city.js', "server");
    api.addFiles('server/publications.js', "server");
});

Package.onTest(function (api) {
    api.use('tinytest');
    api.use('recruit:city');
    api.addFiles('city-tests.js');
});
