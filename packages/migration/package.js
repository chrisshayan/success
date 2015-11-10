Package.describe({
    name: 'vnw:migration',
    version: '0.0.18',
    // Brief, one-line summary of the package.
    summary: '',
    // URL to the Git repository containing the source code for this package.
    git: '',
    // By default, Meteor will default to using README.md for documentation.
    // To avoid submitting documentation, set this field to null.
    documentation: 'README.md'
});

var fs = Npm.require('fs');
var path = Npm.require('path');
var base = path.resolve('.');
var migrationDir = path.join(base, '/packages/migration/migrations');
var migrationFiles = fs.readdirSync(migrationDir);

Package.onUse(function (api) {
    api.use(['percolate:migrations', 'lab:vnw-apis', 'mongo', 'meteorhacks:aggregate'], 'server');
    api.imply(['percolate:migrations', 'meteorhacks:aggregate'], 'server');
    api.addFiles('migration.js', 'server');
    var files = [];
    for (var i in migrationFiles) {

        files.push(['migrations', migrationFiles[i]].join('/'));
    }
    api.addFiles(files, 'server');
    api.export('Migrations', 'server');
});

Package.onTest(function (api) {
    api.use('tinytest');
    api.use('vnw:migration');
    api.addFiles('migration-tests.js');
});
