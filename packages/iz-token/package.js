Package.describe({
    name: 'izzilab:token',
    version: '0.0.1',
    // Brief, one-line summary of the package.
    summary: '',
    // URL to the Git repository containing the source code for this package.
    git: '',
    // By default, Meteor will default to using README.md for documentation.
    // To avoid submitting documentation, set this field to null.
    documentation: 'README.md'
});

Npm.depends({
    'jwt-simple': '0.3.0'
})

Package.onUse(function(api) {
    api.versionsFrom('0.9.0');
    api.use(['mongo@1.1.0', 'momentjs:moment@2.10.6'], 'server');
    api.addFiles('iz-token.js', 'server');
    api.export(["IZToken"], 'server');
});

Package.onTest(function(api) {
    api.use('tinytest');
    api.use('izzilab:token');
    api.addFiles('iz-token-tests.js');
});
