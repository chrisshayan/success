Router.configure({
    layoutTemplate: 'mainLayout',
    notFoundTemplate: 'notFound',
    loadingTemplate: 'waveLoading'
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


Router.route('/job/:jobId/stage/:stage', {
    name: "jobDetails",
    fastRender: true,
    waitOn: function() {
        if( !this.params.hasOwnProperty('jobId') && !this.params.hasOwnProperty('stage') )
            throw Meteor.Error(404);
        var stage = _.findWhere(Recruit.APPLICATION_STAGES, {alias: this.params.stage});
        return [
            Meteor.subscribe('jobs'),
            Meteor.subscribe('mailTemplates'),
            Meteor.subscribe('applicationCount', {jobId: this.params.jobId})
        ];
    },
    action: function() {
        var self = this;
        var stage = _.findWhere(Recruit.APPLICATION_STAGES, {alias: this.params.stage});
        if(!this.params.query.hasOwnProperty('application')) {

            var options = {
                jobId: parseInt(this.params.jobId),
                stage: stage.id
            };
            Meteor.call('getFirstJobApplication', options, function(err, applicationId) {
                if(err) throw err;
                if(applicationId) {
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
                jobId: parseInt(self.params.jobId),
                stage: stage.id,
                application: parseInt(self.params.query.application)
            };
            Meteor.call('checkApplicationInStage', options, function(err, isExists) {
                if(err) throw err;
                if(!isExists) {
                    Router.go('jobDetails', {
                        jobId: self.params.jobId,
                        stage: self.params.stage
                    });
                }
            });
        }
        this.render("jobDetails");
    },
    data: function() {
        var jobId = parseInt(this.params.jobId);
        return {
            jobs: Collections.Jobs.find({jobId: {$ne: jobId}}),
            job: Collections.Jobs.findOne({jobId: jobId}),
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
    waitOn: function(){
        return [
            Meteor.subscribe('companyInfo')
        ];
    },
    action: function() {
        this.render('companyInfo');
    }
});


Router.route('/settings/mailtemplates', {
    name: "mailTemplates",
    fastRender: true,
    waitOn: function() {
        return [
            Meteor.subscribe('mailTemplates'),
        ];
    },
    action: function() {
        this.render('mailTemplates');
    }
});


Router.route('/settings/mailtemplates/create', {
    name: "createMailTemplate",
    waitOn: function() {
        return [
            Meteor.subscribe('mailTemplates'),
        ];
    },
    action: function() {
        this.render('createMailTemplate');
    }
});

Router.route('/settings/mailtemplates/update/:_id', {
    name: "updateMailTemplate",
    waitOn: function() {
        return [
            Meteor.subscribe('mailTemplates'),
            Meteor.subscribe('mailTemplateDetails', this.params._id)
        ];
    },
    action: function() {
        this.render('createMailTemplate');
    },
    data: function() {
        return {
            doc: Collections.MailTemplates.findOne(this.params._id)
        };
    }
});

Router.route('/settings/mailsignature', {
    name: "mailSignature",
    waitOn: function() {
        return Meteor.subscribe('companySettings')
    },
    action: function() {
        this.render('mailSignature');
    },
    data: function() {
        return Collections.CompanySettings.findOne();
    }
})

Router.route('/activites', {
    name: "activities",
    waitOn: function() {
        return [
            Meteor.subscribe('activities'),
            Meteor.subscribe('candidateInfo'),
            Meteor.subscribe('jobs')
        ];
    },
    action: function() {
        this.render('activities');
    }
});