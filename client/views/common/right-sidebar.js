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

        instance.autorun(function () {
            var trackSub = DashboardSubs.subscribe('lastApplications');
            if (trackSub.ready()) {
            }
        });
    },

    filters: function () {
        return {};
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
        return Collections.Applications.find(this.filters(), this.options());
    },

    items: function () {
        return this.fetch();
    },
}).register("LastCandidates");


var LastCandidateItem = BlazeComponent.extendComponent({

    onCreated: function () {
        var self = this;
        this.application = this.data();
        this.candidate = new ReactiveVar(null);

        Template.instance().autorun(function() {
            self.candidate.set(Collections.Candidates.findOne({candidateId: self.application.candidateId}));
        });
    },



    fullname: function () {
        if(!this.candidate.get()) return "";
        var data = this.candidate.get().data;
        return data.lastname + " " + data.firstname;
    },

    appliedTimeago: function () {
        return moment(this.application.createdAt).fromNow();
    },

    tel: function() {
        if(!this.candidate.get()) return "";
        var data = this.candidate.get().data;
        return data.cellphone || data.homephone || "";
    },

    stageLabel: function() {
        switch (this.application.stage) {
            case 1:
                return "Applied";
            case 2:
                return "Phone call";
            case 3:
                return "Interview";
            case 1:
                return "Offer";
            case 1:
                return "Hired";
            default:
                return "";
        }
    },

    profileUrl: function () {
        var url = Meteor.settings.public.applicationUrl;
        return sprintf(url, this.application.entryId);
    },
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
        var today = new Date(moment().format("YYYY-MM-DD 00:00:00"));
        var filters = {
            'data.expireddate': {
                $gte: today
            }
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
        return Collections.Jobs.find(this.filters(), this.options());
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


    jobTitle: function() {
        return this.job.data.jobtitle;
    },

    timeago: function () {
        return moment(this.job.createdAt).fromNow();
    },

    expiredAt: function() {
        return moment(this.job.data.expireddate).format("ll");
    },

    location: function() {
        return "Ho Chi Minh";
    },

    skills: function() {
        var nl2br = function (str, is_xhtml) {
            var breakTag = (is_xhtml || typeof is_xhtml === 'undefined') ? '<br ' + '/>' : '<br>'; // Adjust comment to avoid issue on phpjs.org display

            return (str + '').replace(/([^>\r\n]?)(\r\n|\n\r|\r|\n)/g, '$1' + breakTag + '$2');
        };
        return nl2br(this.job.data.skillexperience);
    },

    jobDetailsUrl: function() {
        var params = {
            jobId: this.job.jobId,
            stage: Recruit.APPLICATION_STAGES[1].alias
        };
        return Router.routes['jobDetails'].url(params);
    }

}).register("LastOpenJobItem");