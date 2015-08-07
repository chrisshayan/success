Router.configure({
    layoutTemplate: 'mainLayout',
    notFoundTemplate: 'notFound'
});

/**
 * Check user login
 */
Router.onBeforeAction(function () {
        if (!Meteor.userId())
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

Router.route('/logout', function() {
    AccountsTemplates.logout();
});

/**
 * Dashboard -> render jobs listing
 */
Router.route('/dashboard', {
    name: "dashboard",
    action: function () {
        this.render('dashboard');
    }
});


Router.route('/jobs', {
    name: "jobs",
    action: function () {
        this.render('jobs');
    }
})

Router.route('/jobs/add', {
    name: "addJob",
    action: function () {
        this.render('addJob');
    }
});


