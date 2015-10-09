Package.describe({
    name: 'vnw:hiring-team',
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

    api.use(["vnw:core", "momentjs:moment@2.10.6"]);

    api.addFiles('hiring-team.js');

    api.addAssets('private/hiring-team-invitation.html', 'server');

    api.addFiles(['common/config.js', 'common/model.js', 'common/extends.js']);

    api.addFiles(['server/publications.js', 'server/methods.js'], ['server']);

    api.export(['HiringTeam']);

});

Package.onTest(function (api) {
    api.use('ecmascript');
    api.use('tinytest');
    api.use('hiring-team');
    api.addFiles('hiring-team-tests.js');
});
