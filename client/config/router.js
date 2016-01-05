DashboardSubs = new SubsManager({
	cacheLimit: 100,
	expireIn  : 2
});

JobDetailsSubs = new SubsManager({
	cacheLimit: 1000,
	expireIn  : 2
});

StaticSubs = new SubsManager({
	cacheLimit: 1000,
	expireIn  : 30
});

RecruiterSubs = new SubsManager({
	cacheLimit: 100,
	expireIn  : 30
});

SkillsSubs = new SubsManager({
	cacheLimit: 1000,
	expireIn  : 30
});

StaticSubs.subscribe('staticModels');
StaticSubs.subscribe('mailTemplates');

Tracker.autorun(function () {
	Meteor.subscribe('userData');
});

Router.configure({
	layoutTemplate  : 'mainLayout',
	notFoundTemplate: 'notFound',
	loadingTemplate : 'waveLoading'
});
/**
 * Check user login
 */
Router.onBeforeAction(function () {
		if (!Meteor.userId() || Meteor.loggingIn()) {
			const query = {};
			const returnUrl = Router.current().originalUrl.toString().toLowerCase();
			if(returnUrl.indexOf('logout') < 0) {
				query['query'] = {
					returnUrl: Router.current().originalUrl
				};
			}
			this.redirect('login', {}, query);
			this.render(null);
		} else {
			this.next();
		}
	}
	, {except: ['login', 'landing', 'activeAccount']}
);
/**
 * Redirect to dashboard if user is already logged in
 */
Router.onBeforeAction(function () {
		if (!Meteor.loggingIn() && Meteor.userId()) {
			this.render(null);
			const redirectUrl = Router.current().params.query['returnUrl'];
			if(redirectUrl) {
				Router.go(redirectUrl);
			} else {
				this.redirect('dashboard');
			}
		} else {
			this.next();
		}
	}
	, {only: 'login'}
);

/**
 * Landing page
 */
Router.route('/', {
	name  : "landing",
	action: function () {
		this.layout('blankLayout');
		this.render('landing');
	}
});

/**
 * Login page
 */
Router.route('/login', {
	name  : "login",
	action: function () {
		this.layout('blankLayout');
		this.render('login');
	}
});

Router.route('/active-account/:keyid', {
	name  : "activeAccount",
	waitOn: function () {
	},
	action: function () {
		this.layout('blankLayout');
		this.render('activeAccount');
	}
});


Router.route('/logout', {
	name  : "logout",
	action: function () {
		this.render(null);
		DashboardSubs.clear();
		JobDetailsSubs.clear();
		Meteor.logout();
	}
});

/**
 * Dashboard -> render jobs listing
 */

Router.route('/dashboard', {
	name      : "dashboard",
	fastRender: true,
	action    : function () {
		this.render('JobsPage');
	}
});


/**
 * Routes for settings
 */
Router.route('/settings/companyinfo', {
	name      : "companyInfo",
	fastRender: true,
	waitOn    : function () {
		return [
			DashboardSubs.subscribe('companyInfo')
		];
	},
	action    : function () {
		this.render('companyInfo');
	},
	data      : function () {
		return Collections.CompanySettings.findOne();
	}
});


Router.route('/settings/mailtemplates', {
	name      : "mailTemplates",
	fastRender: true,
	waitOn    : function () {
		return [
			Meteor.subscribe('mailTemplates'),
		];
	},
	action    : function () {
		this.render('mailTemplates');
	}
});


Router.route('/settings/mailtemplates/create', {
	name  : "createMailTemplate",
	waitOn: function () {
		return [
			Meteor.subscribe('mailTemplates')
		];
	},
	action: function () {
		this.render('createMailTemplate');
	}
});

Router.route('/settings/mailtemplates/update/:_id', {
	name  : "updateMailTemplate",
	waitOn: function () {
		return [
			Meteor.subscribe('mailTemplates'),
			Meteor.subscribe('mailTemplateDetails', this.params._id)
		];
	},
	action: function () {
		this.render('createMailTemplate');
	},
	data  : function () {
		return {
			doc: Collections.MailTemplates.findOne(this.params._id)
		};
	}
});


Router.route('/settings/hiringTeam', {
	name  : "hiringTeam",
	action: function () {
		this.render('hiringTeam');
	}
});

Router.route('/activites', {
	name  : "activities",
	waitOn: function () {
		return [
			Meteor.subscribe('activities'),
			Meteor.subscribe('jobs')
		];
	},
	action: function () {
		this.render('activities');
	}
});


Router.route('/job-settings/:jobId', {
	name  : 'JobSettings',
	action: function () {
		this.render('JobSettings');
	}
});

Router.route('/profile', {
	name  : 'updateProfile',
	waitOn: function () {
		return [];
	},
	action: function () {
		this.render('updateProfile');
	}
});


Router.route('/job/:jobId/:stage', {
	name  : 'Job',
	waitOn: function () {
		return [
			Meteor.subscribe('jobDetails', +this.params.jobId)
		];
	},
	action() {
		this.render('Job');
	}
});


/**
 * Mentions routes
 */
Router.route('/@:username', {
	name: 'Mention.User',
	action() {
		this.render('Mention.User');
	}
});

Router.route('/hashtag/:hashtag', {
	name: 'Mention.HashTag',
	action() {
		this.render('Mention.HashTag');
	}
});