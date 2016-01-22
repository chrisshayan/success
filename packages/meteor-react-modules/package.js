/**
 * config
 * @type {boolean}
 */
var path = Npm.require('path'),
	fs = Npm.require('fs'),
	SSR = false,
	env = SSR ? ['client', 'server']: 'client';
var npmContainerDir = path.resolve('./packages/meteor-react-modules');
var packagesJsonPath = path.resolve(npmContainerDir + '/packages.json');
var depends = fs.readFileSync(packagesJsonPath, 'utf-8');

// download npm dependencies
Npm.depends(JSON.parse(depends));

Package.describe({
	name: 'meteor-react-modules',
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
	api.versionsFrom('1.2.1');
	api.use('ecmascript');
	api.use(['underscore','react@0.14.3', 'cosmos:browserify@0.9.3'], env);
	api.addFiles([
		'import.browserify.options.json',
		'import.browserify.js'
	], env);

	// export namespace to global
	api.export([
		'ReactHighcharts',
		'ReactBootstrap',
		'ReactOverlays'
	], env);
});

Package.onTest(function (api) {
	api.use('ecmascript');
	api.use('tinytest');
	api.use('meteor-react-modules');
	api.addFiles('meteor-react-modules-tests.js');
});
