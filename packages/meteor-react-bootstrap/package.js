Package.describe({
    name: 'vnw:react-bootstrap',
    version: '0.0.4',
    // Brief, one-line summary of the package.
    summary: 'ReactBootstrap 0.27.3 using official React package',
    // URL to the Git repository containing the source code for this package.
    git: 'https://github.com/mrphu3074/meteor-react-bootstrap.git',
    // By default, Meteor will default to using README.md for documentation.
    // To avoid submitting documentation, set this field to null.
    documentation: 'README.md'
});

var BS_VERSION = '0.27.3',
    EXTERNALIFY_VERSION = '0.1.0',
    REACT_VERSION = '0.14.2',
    REACT_DOM_VERSION = '0.14.2',
    CLASSNAMES_VERSION = '2.2.0';

Npm.depends({
    'react-bootstrap': '0.23.3', // this library will be browserifyed later
    'react-dom' : REACT_DOM_VERSION,
    classnames: CLASSNAMES_VERSION
});


Package.onUse(function (api) {
    api.use(['react@0.3.0','cosmos:browserify@0.7.0']);
    api.addFiles([
        'bs.browserify.js'
    ], 'client');

    //api.imply('react');


    api.export(["ReactBootstrap", 'Classnames'], 'client');
});