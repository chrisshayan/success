DashboardSubs = new SubsManager({
    cacheLimit: 100,
    expireIn: 2
});

JobDetailsSubs = new SubsManager({
    cacheLimit: 1000,
    expireIn: 2
});

StaticSubs = new SubsManager({
    cacheLimit: 1000,
    expireIn: 30
});

RecruiterSubs = new SubsManager({
    cacheLimit: 100,
    expireIn: 30
});

StaticSubs.subscribe('staticModels');

Meteor.subscribe('userData');

Router.configure({
    layoutTemplate: 'mainLayout',
    notFoundTemplate: 'notFound',
    loadingTemplate: 'waveLoading'
});
/**
 * Check user login
 */
Router.onBeforeAction(function () {
        if (!Meteor.userId() || Meteor.loggingIn()) {
            this.redirect('login');
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
        if (Meteor.userId()) {
            this.render(null);
            this.redirect('dashboard');
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
    name: "landing",
    action: function () {
        this.layout('blankLayout');
        this.render('landing');
    }
});

/**
 * Login page
 */
Router.route('/login', {
    name: "login",
    action: function () {
        this.layout('blankLayout');
        this.render('login');
    }
});

Router.route('/active-account/:keyid', {
    name: "activeAccount",
    waitOn: function () {
    },
    action: function () {
        this.layout('blankLayout');
        this.render('activeAccount');
    }
});


Router.route('/logout', {
    name: "logout",
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
    name: "dashboard",
    fastRender: true,
    action: function () {
        this.render('Dashboard');
    }
});


Router.route('/job/:jobId/stage/:stage', {
    name: "jobDetails",
    fastRender: true,
    waitOn: function () {
        if (!this.params.hasOwnProperty('jobId') && !this.params.hasOwnProperty('stage'))
            throw Meteor.Error(404);
        var subs = [
            Meteor.subscribe('jobDetails', {jobId: this.params.jobId}),
            //Meteor.subscribe('mailTemplates')
        ];

        return subs;
    },
    action: function () {
        var self = this;
        var stage = _.findWhere(Success.APPLICATION_STAGES, {alias: this.params.stage});
        if (!this.params.query.hasOwnProperty('application')) {

            var options = {
                jobId: this.params.jobId,
                stage: stage.id
            };
            Meteor.call('getFirstJobApplication', options, function (err, applicationId) {
                if (err) throw err;
                if (applicationId) {
                    Router.go('jobDetails', {
                        jobId: self.params.jobId,
                        stage: self.params.stage
                    }, {
                        query: {
                            application: applicationId
                        }
                    });
                }

            });
        } else {
            var options = {
                jobId: Utils.transformVNWId(self.params.jobId),
                stage: stage.id,
                application: self.params.query.application
            };
            Meteor.call('checkApplicationInStage', options, function (err, isExists) {
                if (err) throw err;
                if (!isExists) {
                    Router.go('jobDetails', {
                        jobId: Utils.transformVNWId(self.params.jobId),
                        stage: self.params.stage
                    });
                }
            });
        }
        this.render("jobDetails");
    },
    data: function () {
        return {
            job: Collections.Jobs.findOne({jobId: Utils.transformVNWId(this.params.jobId)}),
            //isEmpty: !this.params.query.hasOwnProperty('application')
        }
    }
});


Router.route('/job-details/:_id/stage/:stage', {
    name: "Job",
    fastRender: true,
    waitOn: function () {
        if (!this.params.hasOwnProperty('_id') && !this.params.hasOwnProperty('stage'))
            throw Meteor.Error(404);

        return [Meteor.subscribe('jobDetails', {jobId: this.params._id}), Meteor.subscribe('mailTemplates')];
    },
    action: function () {
        /**
         * if url contains application, check app exists
         * if url not contains app, find first application of job's stage
         */
        var params = this.params;
        var queryParams = this.params.query;
        var stage = _.findWhere(Success.APPLICATION_STAGES, {alias: params.stage});
        var application = queryParams.application || null;
        var job = Collections.Jobs.find({_id: this.params._id}).count();
        if (!job) {
            this.render(null);
            Router.go('notFound');
        }
        if (application) {
            var options = {
                jobId: params._id,
                stage: stage.id,
                application: application
            };
            Meteor.call('checkApplicationInStage', options, function (err, isExists) {
                if (err) throw err;
                if (!isExists) {
                    Router.go('Job', {
                        _id: params._id,
                        stage: stage.alias
                    });
                }
            });
        } else {
            var options = {
                jobId: this.params._id,
                stage: stage.id
            };
            Meteor.call('getFirstJobApplication', options, function (err, applicationId) {
                if (err) throw err;
                if (applicationId) {
                    Router.go('Job', {
                        _id: params._id,
                        stage: params.stage
                    }, {
                        query: {
                            application: applicationId
                        }
                    });
                }

            });
        }
        this.render('jobDetails');
    },
    data: function () {

        return {
            job: Collections.Jobs.findOne({_id: this.params._id}),
            isEmpty: !this.params.query.hasOwnProperty('application')
        }
    }
});


/**
 * Routes for settings
 */
Router.route('/settings/companyinfo', {
    name: "companyInfo",
    fastRender: true,
    waitOn: function () {
        return [
            DashboardSubs.subscribe('companyInfo')
        ];
    },
    action: function () {
        this.render('companyInfo');
    },
    data: function () {
        return Collections.CompanySettings.findOne();
    }
});


Router.route('/settings/mailtemplates', {
    name: "mailTemplates",
    fastRender: true,
    waitOn: function () {
        return [
            Meteor.subscribe('mailTemplates'),
        ];
    },
    action: function () {
        this.render('mailTemplates');
    }
});


Router.route('/settings/mailtemplates/create', {
    name: "createMailTemplate",
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
    name: "updateMailTemplate",
    waitOn: function () {
        return [
            Meteor.subscribe('mailTemplates'),
            Meteor.subscribe('mailTemplateDetails', this.params._id)
        ];
    },
    action: function () {
        this.render('createMailTemplate');
    },
    data: function () {
        return {
            doc: Collections.MailTemplates.findOne(this.params._id)
        };
    }
});

Router.route('/settings/mailsignature', {
    name: "mailSignature",
    waitOn: function () {
        return Meteor.subscribe('companySettings');
    },
    action: function () {
        this.render('mailSignature');
    },
    data: function () {
        return Collections.CompanySettings.findOne();
    }
});


Router.route('/settings/hiringTeam', {
    name: "hiringTeam",
    waitOn: function () {
        return [
            DashboardSubs.subscribe('companyInfo')
        ];
    },
    action: function () {
        this.render('hiringTeam');
    },

    data: function () {
        return {
            companyInfo: Collections.CompanySettings.findOne()
        };
    }
});

Router.route('/activites', {
    name: "activities",
    waitOn: function () {
        return [
            Meteor.subscribe('activities'),
            Meteor.subscribe('candidateInfo'),
            Meteor.subscribe('jobs')
        ];
    },
    action: function () {
        this.render('activities');
    }
});


/*Router.route('/add-job', {
 name: 'addJob',
 waitOn: function () {
 return DashboardSubs.subscribe('addJobPage');
 },
 action: function () {
 this.render('AddJob');
 }
 });*/


Router.route('/job-settings', {
    name: 'addJob',
    waitOn: function () {
        return DashboardSubs.subscribe('addJobPage');
    },
    action: function () {
        this.render('AddJob');
    }
});

Router.route('/job-settings/:jobId', {
    name: 'teamSettings',
    /*template: 'teamSettings',*/
    waitOn: function () {
        return [
            Meteor.subscribe('teamSettings', this.params.jobId),
            DashboardSubs.subscribe('addJobPage')
        ];
    },
    action: function () {
        this.render('AddJob');
    },
    data: function () {
        return Collections.Jobs.findOne({_id: this.params.jobId});
    }
});