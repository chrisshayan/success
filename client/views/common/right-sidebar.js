var rightSidebar = BlazeComponent.extendComponent({

    onCreated: function () {

    },

    onRendered: function () {
        // Initialize slimscroll for right sidebar
        $('.sidebar-container').slimScroll({
            height: '100%',
            railOpacity: 0.4,
            wheelStep: 10
        });


        // Move right sidebar top after scroll
        $(window).scroll(function () {
            if ($(window).scrollTop() > 0 && !$('body').hasClass('fixed-nav')) {
                $('#right-sidebar').addClass('sidebar-top');
            } else {
                $('#right-sidebar').removeClass('sidebar-top');
            }
        });
    },
}).register("rightSidebar")

var LastCandidates = BlazeComponent.extendComponent({

    onCreated: function () {
        var self = this;
        var instance = Template.instance();
        this.newestApplication = new ReactiveVar(null);

        instance.autorun(function () {
            var trackSub = DashboardSubs.subscribe('lastApplications');
        });
    },

    filters: function () {
        return {
            status: 1,
            source: {
                $ne: 3
            }
        };
    },

    options: function () {
        return {
            limit: 10,
            sort: {
                createdAt: -1
            }
        };
    },

    fetch: function () {
        return Meteor.applications.find(this.filters(), this.options());
    },

    items: function () {
        return this.fetch();
    },
}).register("LastCandidates");


var LastCandidateItem = BlazeComponent.extendComponent({

    onCreated: function () {
        var self = this;
        this.application = this.data();
    },


    fullname: function () {
        var data = this.application;
        return data.candidateInfo && data.candidateInfo.fullname || '';
    },

    matchingScoreLabel: function () {
        var matchingScore = this.application.matchingScore;
        if (matchingScore >= 90)
            return " label-success ";
        if (matchingScore >= 70)
            return " label-primary ";
        if (matchingScore >= 50)
            return " label-warning ";
        if (!matchingScore || matchingScore <= 0)
            return " hidden ";

        return " label-default ";
    },

    appliedTimeago: function () {
        return moment(this.application.createdAt).fromNow();
    },

    tel: function () {
        var can = this.application.candidateInfo;
        return can && can.emails.length > 0 ? can.emails[0] : '';
    },

    stageLabel: function () {
        switch (this.application.stage) {
            case 1:
                return "Applied";
            case 2:
                return "Phone call";
            case 3:
                return "Interview";
            case 4:
                return "Offer";
            case 5:
                return "Hired";
            default:
                return "";
        }
    },

    profileUrl: function () {
        var app = this.application;
        if (!app) return "";
        var queryParams = "";
        if (app.source.type === 1) {
            queryParams = "?jobid=%s&appid=%s";
        } else {
            queryParams = "?jobid=%s&sdid=%s";
        }

        var url = Meteor.settings.public.applicationUrl;
        return url + sprintf(queryParams, app.jobId, app.entryId);
    },

    applicationDetailsUrl: function () {
        var params = {
            jobId: this.application.jobId,
            stage: Success.APPLICATION_STAGES[this.application.stage].alias
        };
        var query = {
            query: {
                application: this.application.entryId
            }
        }
        return Router.routes['jobDetails'].url(params, query);
    }
}).register("LastCandidateItem");


var LastOpenJobs = BlazeComponent.extendComponent({

    onCreated: function () {
        var self = this;
        var instance = Template.instance();

        instance.autorun(function () {
            var trackSub = DashboardSubs.subscribe('lastOpenJobs');
            if (trackSub.ready()) {
            }
        });
    },

    filters: function () {
        var filters = {
            status: 1
        };
        return filters;
    },

    options: function () {
        return {
            limit: 10,
            sort: {
                createdAt: -1
            }
        };
    },

    fetch: function () {
        //return Collections.Jobs.find(this.filters(), this.options());
        return Meteor['jobs'].find(this.filters(), this.options());
    },

    items: function () {
        return this.fetch();
    },
}).register("LastOpenJobs");


var LastOpenJobItem = BlazeComponent.extendComponent({

    onCreated: function () {
        var self = this;
        this.job = this.data();
    },

    timeago: function () {
        return moment(this.job.createdAt).fromNow();
    },

    expiredAt: function () {
        return moment(this.expiredAt).format("ll");
    },

    location: function () {
        return "Ho Chi Minh";
    },

    skills: function () {
        var nl2br = function (str, is_xhtml) {
            var breakTag = (is_xhtml || typeof is_xhtml === 'undefined') ? '<br ' + '/>' : '<br>'; // Adjust comment to avoid issue on phpjs.org display

            return (str + '').replace(/([^>\r\n]?)(\r\n|\n\r|\r|\n)/g, '$1' + breakTag + '$2');
        };
        return nl2br(this.job.data.skillexperience);
    },
    salaryRange: function () {
        var minSalary = (this.job.salaryMin) ? '$' + this.job.salaryMin + ' - ' : ''
            , maxSalary = (this.job.salaryMax) ? '$' + this.job.salaryMax : '';

        return minSalary + maxSalary;
    },

    jobDetailsUrl: function () {
        var params = {
            jobId: this.job.jobId,
            stage: Success.APPLICATION_STAGES[1].alias
        };
        return Router.routes['jobDetails'].url(params);
    }

}).register("LastOpenJobItem");