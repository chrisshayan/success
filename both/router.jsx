FlowRouter.notFound = {
    action() {
        ReactLayout.render(MainLayout, {content: <NotFound />});
    }
};

FlowRouter.route("/", {
    action() {
        ReactLayout.render(MainLayout, {content: <Home />});
    }
})

AppRoute = FlowRouter.group({
    prefix: "/app"
});

AppRoute.route('/dashboard', {
    action() {
        ReactLayout.render(MainLayout, {content: <DashboardPage />});
    }
});


