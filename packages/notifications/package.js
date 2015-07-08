Package.describe({
    name: 'lab:notifications',
    version: '0.0.1',
    summary: 'Notification system',
    git: '',
    documentation: 'README.md'
});

Package.onUse(function (api) {
    api.versionsFrom('0.9.0');
    api.use(['templating','reactive-var'], 'client');
    api.addFiles([
        'notifications.js',
        'notifications.html'
    ], 'client');

    api.export('Notification');
});

Package.onTest(function (api) {
    api.use('tinytest');
    api.use('lab:notifications');
    api.addFiles('notifications-tests.js');
});
