JobApplicationTimeline = BlazeComponent.extendComponent({
    onCreated: function () {
        var self = this;
        this.props = new ReactiveDict;

        this.props.set("jobId", Session.get("currentJobId"));
        this.props.set("stage", Session.get("stage"));
        this.props.set("page", 1);
        this.props.set("inc", 5);
        this.props.set("isLoading", false);
        this.props.set("isLoadingMore", false);
        this.props.set("isShowMailForm", false);
        this.props.set("isShowCommentForm", false);

        this.props.set("isLoading", true);
        Template.instance().autorun(function () {
            var params = Router.current().params;
            var applicationId = params.query.application;
            if(!_.isNaN(+applicationId)){
                applicationId = +applicationId;
            }
            self.props.set("applicationId", applicationId);
            self.props.set("isShowMailForm", false);
            self.props.set("isShowCommentForm", false);

            JobDetailsSubs.subscribe('activityCounter', self.counterName(), self.filters());

            var trackSub = JobDetailsSubs.subscribe('applicationActivities', self.filters(), self.options());
            if (trackSub.ready()) {
                self.props.set("isLoading", false);
                self.props.set("isLoadingMore", false);
            }
        });

        this._onToggleMailForm = function (status) {
            if (typeof status == "undefined")
                status = !self.props.get("isShowMailForm");
            self.props.set("isShowMailForm", status);
        }

        this._onToggleCommentForm = function (status) {
            if (typeof status == "undefined")
                status = !self.props.get("isShowCommentForm");
            self.props.set("isShowCommentForm", status);
        }

        Event.on('toggleMailForm', this._onToggleMailForm);
        Event.on('toggleCommentForm', this._onToggleCommentForm);
    },

    onDestroyed: function () {
        var self = this;
        Event.removeListener('toggleMailForm', self._onToggleMailForm);
        Event.removeListener('toggleCommentForm', self._onToggleCommentForm);
    },

    counterName: function () {
        return "application_activity_" + this.props.get("applicationId");
    },

    filters: function () {
        return {
            "data.applicationId": this.props.get("applicationId")
        };
    },

    options: function () {
        return {
            sort: {
                createdAt: -1
            },
            limit: this.total()
        };
    },

    total: function () {
        return this.props.get("page") * this.props.get("inc");
    },

    maxLimit: function () {
        var counter = Collections.Counts.findOne(this.counterName());
        if (!counter) return 0;
        return counter.count;
    },

    fetch: function () {
        return Collections.Activities.find(this.filters(), this.options());
    },

    events: function () {
        return [{
            'click .loadmore': this.loadMore
        }];
    },

    loadMore: function () {
        var currentPage = this.props.get("page");
        this.props.set("page", currentPage + 1);
        this.props.set("isLoadingMore", true);
    },

    /**
     * HELPERS
     */
    items: function () {
        return this.fetch();
    },

    loadMoreAbility: function () {
        return this.maxLimit() - this.total() > 0;
    }

}).register('JobApplicationTimeline');


JobApplicationTimelineItem = BlazeComponent.extendComponent({
    onCreated: function () {
        var self = this;
        this.actionType = this.data().actionType;
        this.createdAt = this.data().createdAt;
        this.icon = "";
        this.title = "";
        this.content = "";
        this.showMoreLabel = new ReactiveVar("show more");

        /**
         * info handle
         */
        switch (this.actionType) {
            case 1: // moved stage action
                var from = this.data().data.fromStage;
                var to = this.data().data.toStage;
                var stage = Recruit.APPLICATION_STAGES[to];
                if (from > to) {
                    if (from - to > 1)
                        this.icon = " fa-long-arrow-left ";
                    else
                        this.icon = " fa-arrow-left ";
                } else {
                    if (to - from > 1)
                        this.icon = " fa-long-arrow-right ";
                    else
                        this.icon = " fa-arrow-right ";
                }
                this.title = sprintf("Moved candidate to <strong>%s</strong>", stage.label);
                break;

            case 2:// Applied date
                this.title = "Applied for this position";
                this.icon = " fa-briefcase ";
                break;


            case 3:// Disqualified application
                this.title = "Disqualified";
                this.icon = " fa-thumbs-down ";
                break;

            case 4:// Disqualified application
                this.title = "Revert qualify";
                this.icon = " fa-life-saver ";
                break;

            case 5:// Mail sent
                var mail = this.data().data;
                this.title = mail.subject;
                this.icon = " fa-envelope-o ";
                this.content = mail.html;
                break;

            case 6:// Comment
                var comment = this.data().data;
                this.title = comment.content;
                this.icon = " fa-comment ";
                break;

            case 7:// Comment
                this.title = "Added for this position";
                this.icon = " fa-briefcase ";
                break;

            default:
                this.icon = " fa-heart-o ";
                break;
        }
    },

    events: function () {
        return [{
            'click .application-timeline-content-more': this.showMoreContent
        }];
    },

    /**
     * Event show more content
     */
    showMoreContent: function (e) {
        var content = Template.instance().find(".application-timeline-content p");
        if ($(content).hasClass("more")) {
            $(content).removeClass("more");
            this.showMoreLabel.set("show more");
        } else {
            this.showMoreLabel.set("show less");
            $(content).addClass("more");
        }

    },

    /**
     * HELPERS
     */
    /**
     * get acitivity datetime
     * if activity is today, return time
     * else return date
     * @returns {String}
     */
    datetime: function () {
        var datetime = moment(this.createdAt);
        if (datetime.diff(Date.now(), 'day')) {
            return datetime.format("ll");
        }
        return datetime.format("h:mm a");
    },

    /**
     * get activity time ago
     * @returns {*}
     */
    timeago: function () {
        return moment(this.createdAt).fromNow()
    }

}).register('JobApplicationTimelineItem');


SendEmailCandidateForm = BlazeComponent.extendComponent({
    onCreated: function () {
        var self = this;
        this.isLoading = new ReactiveVar(false);

        this.candidate = new ReactiveVar(null);
        this.application = new ReactiveVar(null);
        this.applicationId = new ReactiveVar(null);

        Template.instance().autorun(function () {
            var params = Router.current().params;
            if (params.query.hasOwnProperty("application")) {
                self.applicationId.set(parseInt(params.query.application));
                var application = Collections.Applications.findOne({entryId: self.applicationId.get()});
                if (application) {
                    self.application.set(application);
                    var candidate = Collections.Candidates.findOne({candidateId: application.candidateId});
                    if (candidate) {
                        self.candidate.set(candidate);
                    } else {
                        self.candidate.set(null);
                    }
                } else {
                    self.application.set(null);
                }
            } else {
                self.applicationId.set(null);
            }
        });

        this.editor = undefined;
    },

    onRendered: function () {
        var self = this;
        //reset value
        $(".mail-to").val("");
        $(".mail-subject").val("");
        $(".mail-content").code("");
        $(".mail-template-options").val("");
        var selectors = {
            details: '.full-height-scroll.white-bg',
            slimScroll: {
                slimClass: '',
                slimScrollClass: '.slimScrollBar'
            }
        };
        var $details = $(selectors.details);
        var $mailContainer = $("#sendEmailCandidateForm");

        var height = $mailContainer.offset().top - $details.offset().top;

        $details.animate({
            scrollTop: height
        }, 'slow', function () {
            $details.siblings(selectors.slimScroll.slimScrollClass)
                .css({'top': height / 2 + 'px'});
        });

        Template.instance().autorun(function () {
            var candidate = self.candidate.get();
            if (candidate) {
                var toAddress = candidate.data.email1 || candidate.data.email2 || candidate.data.username;
                $(".mail-to").val(toAddress);
            }
        });
    },

    events: function () {
        return [{
            'change .mail-template-options': this.selectTemplate,
            'click .mail-send-action': this.send,
            'click .mail-cancel-action': this.cancel,
        }];
    },

    /**
     * Event select mail template options
     */
    selectTemplate: function (e, tmpl) {
        var template = Collections.MailTemplates.findOne(e.target.value);
        if (template) {
            $(".mail-subject").val(template.subject);
            $('.editor.mail-content').code(template.htmlBody);
        }
    },

    /**
     * EVent to request send email
     */
    send: function () {
        var self = this;
        self.isLoading.set(true);
        var appId = this.applicationId.get();
        if (!appId) return;


        var data = {
            subject: $(".mail-subject").val() || "",
            content: $(".mail-content").code() || "",
            mailTemplate: $(".mail-template-options").val() || "",
            application: appId,
            emailFrom: Meteor.currentRecruiter().email
        };

        Meteor.call('sendMailToCandidate', data, function (err, result) {
            if (err) throw err;
            if (result) {
                Notification.success("Mail sent");
                self.isLoading.set(false);
                Event.emit('toggleMailForm', false);
            }
        });
    },

    cancel: function () {
        Event.emit('toggleMailForm', false);
    }

}).register('SendEmailCandidateForm');


Template.mailContentEditor.onRendered(function () {
    var instance = Template.instance();

    (function (factory) {
        /* global define */
        if (typeof define === 'function' && define.amd) {
            // AMD. Register as an anonymous module.
            define(['jquery'], factory);
        } else {
            // Browser globals: jQuery
            factory(window.jQuery);
        }
    }(function ($) {
        // template
        var tmpl = $.summernote.renderer.getTemplate();

        /**
         * @class plugin.hello
         *
         * Hello Plugin
         */
        $.summernote.addPlugin({
            /** @property {String} name name of plugin */
            name: 'mail',
            buttons: {
                mailPlaceholder: function (lang, options) {
                    var list = '<li><a data-event="selectPlaceholder" href="#" data-value="candidate_first_name">Candidate first name</a></li>';
                    list += '<li><a data-event="selectPlaceholder" href="#" data-value="position">Job title</a></li>';
                    list += '<li><a data-event="selectPlaceholder" href="#" data-value="company">Company name</a></li>';
                    list += '<li><a data-event="selectPlaceholder" href="#" data-value="mail_signature">Mail signature</a></li>';
                    var dropdown = '<ul class="dropdown-menu">' + list + '</ul>';

                    return tmpl.iconButton(options.iconPrefix + 'asterisk', {
                        title: 'Placeholder',
                        hide: true,
                        dropdown: dropdown
                    });
                }
            },

            events: { // events
                selectPlaceholder: function (event, editor, layoutInfo, value) {
                    var $editable = layoutInfo.editable();
                    editor.insertText($editable, sprintf(" [[%s]]", value));
                }
            }
        });
    }));

    instance.editor = $(instance.firstNode).summernote({
        toolbar: [
            ['group', ['mailPlaceholder']],
            ['style', ['bold', 'italic', 'underline', 'clear']],
            ['para', ['ul', 'ol', 'paragraph']]
        ]
    });
})


AddCommentCandidateForm = BlazeComponent.extendComponent({
    onCreated: function () {
        var self = this;
        this.isLoading = new ReactiveVar(false);
    },

    onRendered: function () {
        var selectors = {
            details: '.full-height-scroll.white-bg',
            slimScroll: {
                slimClass: '',
                slimScrollClass: '.slimScrollBar'
            }
        };
        var $details = $(selectors.details);
        var $mailContainer = $("#addCommentForm");

        var height = $mailContainer.offset().top - $details.offset().top;

        $details.animate({
            scrollTop: height
        }, 'slow', function () {
            $details.siblings(selectors.slimScroll.slimScrollClass)
                .css({'top': height / 2 + 'px'});
        });
    },

    onDestroyed: function () {
        Event.removeListener("toggleCommentCandidateForm");
    },

    events: function () {
        return [{
            'click .mail-send-action': this.send,
            'click .mail-cancel-action': this.cancel,
        }];
    },

    /**
     * Event select mail template options
     */
    selectTemplate: function (e, tmpl) {
        var template = Collections.MailTemplates.findOne(e.target.value);
        if (template) {
            $(".mail-subject").val(template.subject);
            $('.editor.mail-content').code(template.htmlBody);
        }
    },

    /**
     * EVent to request send email
     */
    send: function () {
        var self = this;
        var params = Router.current().params;
        if (!params.query.hasOwnProperty("application")) return;

        self.isLoading.set(true);
        var data = {
            content: $(".comment-candidate").val(),
            application: parseInt(params.query.application)
        };

        Meteor.call('addCommentApplication', data, function (err, result) {
            if (err) throw err;
            if (result) {
                Event.emit('toggleCommentForm', false);
                self.isLoading.set(false);
            }
        });
    },

    cancel: function () {
        Event.emit('toggleCommentForm', false);
    }

}).register('AddCommentCandidateForm');