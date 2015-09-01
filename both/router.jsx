var Triggers = {};
//======================================================================//
//  AUTHENTICATION
//======================================================================//
Triggers.requiredLogin = function () {
    if (!(Meteor.loggingIn() || Meteor.userId())) {
        route = FlowRouter.current();
        if (route.route.name !== 'login') {
            Session.set('redirectAfterLogin', route.path);
        }
        FlowRouter.go('login');
    }

};
if(Meteor.isClient) {
    Accounts.onLogin(function () {
        var redirect = Session.get('redirectAfterLogin');
        if (redirect != null) {
            if (redirect !== '/login') {
                return FlowRouter.go(redirect);
            }
        } else {
            return FlowRouter.go('dashboard');
        }
    });

    Meteor.startup(function() {
        Tracker.autorun(function() {
            if (!Meteor.userId()) {

                //return FlowRouter.go('login');
            }
        });
    });
}
//======================================================================//


FlowRouter.notFound = {
    action() {
        ReactLayout.render(MainLayout, {content: <NotFound />});
    }
};

FlowRouter.route("/", {
    action() {
        ReactLayout.render(MainLayout, {content: <Home />});
    }
});

AppRoute = FlowRouter.group({
    prefix: "/app",
    triggersEnter: [Triggers.requiredLogin]
});

AppRoute.route('/login', {
    name: 'login',
    action() {
        ReactLayout.render(BlankLayout, {content: <LoginPage />});
    }
});
AppRoute.route('/logout', {
    name: 'logout',
    action() {
        Meteor.logout(function () {
            FlowRouter.go('login');
        });
    }
});

AppRoute.route('/dashboard', {
    name: 'dashboard',
    action() {
        ReactLayout.render(MainLayout, {content: <DashboardPage />});
    }
});