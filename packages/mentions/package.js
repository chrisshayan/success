Package.describe({
	name         : 'success:mentions',
	version      : '0.0.1',
	summary      : '',
	git          : '',
	documentation: 'README.md'
});

Package.onUse(function (api) {
	api.use([
		'ecmascript',
		'mongo',
		'jagi:astronomy@1.2.2',
		'matb33:collection-hooks',
		'reywood:publish-composite'
	]);

	api.addAssets([
		'private/notify-mention.html'
	], 'server');

	api.use(['vnw:jobcollectionbot'], 'server');

	api.addFiles([
		'common/model.js',
		'common/config.js',
		'common/extends.js',
	]);

	api.addFiles([
		'server/hooks.js',
		'server/background-tasks.js',
		'server/methods.js',
		'server/publications.js',
	], 'server');

	api.export(['Mention']);
});

Package.onTest(function (api) {
	api.use('ecmascript');
	api.use('tinytest');
	api.use('success:mentions');
	api.addFiles('mentions-tests.js');
});
