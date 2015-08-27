Package.describe({
    name: 'izzilab:react-bootstrap',
    version: '0.0.1',
    // Brief, one-line summary of the package.
    summary: '',
    // URL to the Git repository containing the source code for this package.
    git: '',
    // By default, Meteor will default to using README.md for documentation.
    // To avoid submitting documentation, set this field to null.
    documentation: 'README.md'
});

var EXTERNALIFY_VERSION = "0.1.0",
    REACT_BOOTSTRAP_VERSION = "0.24.5";

Npm.depends({
    "externalify": EXTERNALIFY_VERSION,
    "react-bootstrap": REACT_BOOTSTRAP_VERSION
});

Package.onUse(function (api) {
    api.versionsFrom('0.9.0');
    api.use(['react@0.1.3', 'cosmos:browserify@0.5.0']);
    api.addFiles(['react-bootstrap.js'], 'server');
    api.addFiles([
        'window.react.js',
        'react-bootstrap.browserify.options.json',
        'react-bootstrap.browserify.js'
    ], 'client');

    api.export(['ReactBootstrap']);
});

Package.onTest(function (api) {
    api.use('tinytest');
    api.use('izzilab:react-bootstrap');
    api.addFiles('react-bootstrap-tests.js');
});
