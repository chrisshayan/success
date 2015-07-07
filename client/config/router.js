Router.configure({
    layoutTemplate: 'mainLayout',
    notFoundTemplate: 'notFound'
});
/**
 * Check user login
 */
Router.onBeforeAction(function () {
        if (!Meteor.userId() || Meteor.loggingIn())
            this.redirect('login');
        else
            this.next();
    }
    , {except: ['login', 'landing']}
);
/**
 * Redirect to dashboard if user is already logged in
 */
Router.onBeforeAction(function () {
        if (Meteor.userId())
            this.redirect('dashboard');
        else
            this.next();
    }
    , {only: 'login'}
);

/**
 * Landing page
 */
Router.route('/', {
    name: "landing",
    action: function () {
        this.layout('blankLayout')
        this.render('landing');
    }
});

/**
 * Login page
 */
Router.route('/login', {
    name: "login",
    action: function () {
        this.layout('blankLayout')
        this.render('login');
    }
});

Router.route('/logout', {
    name: "logout",
    action: function () {
        Meteor.logout();
    }
});

/**
 * Dashboard -> render jobs listing
 */
Router.route('/dashboard', {
    name: "dashboard",
    waitOn: function() {
        return [
            Meteor.subscribe('jobs', {userId: Meteor.userId()}),
            Meteor.subscribe('applicationCount')
        ];
    },
    action: function () {
        this.render('jobs');
    }
});

/**
 * Applicants tracking
 */
Router.route('/jobtracking/:jobId', {
    name: "jobTrackingBoard",
    waitOn: function() {
        var options = {jobId: parseInt(this.params.jobId)};
        return [
            Meteor.subscribe('jobDetails', options),
            Meteor.subscribe('applications', options),
            Meteor.subscribe('applicationScores'),
            Meteor.subscribe('candidates', options),
        ];
    },
    action: function () {
        this.render('jobTrackingBoard');
    }
});
