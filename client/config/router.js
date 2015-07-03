Router.configure({
    layoutTemplate: 'mainLayout',
    notFoundTemplate: 'notFound'
});

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

/**
 * Dashboard -> render jobs listing
 */
Router.route('/dashboard', {
    name: "dashboard",
    action: function () {
        this.render('jobs');
    }
});

/**
 * Applicants tracking
 */
Router.route('/jobtracking', {
    name: "jobTrackingBoard",
    action: function () {
        this.render('jobTrackingBoard');
    }
});
