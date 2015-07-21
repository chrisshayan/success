JobApplicationTimeline = BlazeComponent.extendComponent({
    onCreated: function () {
        var self = this;

        this.jobId = new ReactiveVar(null);
        this.stage = new ReactiveVar(null);
        this.applicationId = new ReactiveVar(null);

        this.page = new ReactiveVar(1);
        this.isLoading = new ReactiveVar(false);
        this.loadMoreAbility = new ReactiveVar(false);
        this.latestOptions = new ReactiveVar({});

        // store activities
        this.activities = new ReactiveVar([]);

        Template.instance().autorun(function () {
            var params = Router.current().params;
            var stage = _.findWhere(Recruit.APPLICATION_STAGES, {alias: params.stage});
            self.jobId.set(parseInt(params.jobId));
            self.applicationId.set(parseInt(params.query.application));
            self.stage.set(stage);

            // get job applications
            var options = {
                application: self.applicationId.get(),
                page: self.page.get()
            };

            // Component only request when options change
            var latestOptions = self.latestOptions.get();
            if (!_.isEqual(latestOptions, options)) {
                if (latestOptions.jobId != options.jobId
                    || latestOptions.stage != options.stage
                    || latestOptions.application != options.application) {
                    self.activities.set([]);
                }
                self.isLoading.set(true);

                Meteor.call("getActivities", options, function (err, result) {
                    if (err) throw err;
                    self.isLoading.set(false);
                    var currentItems = self.activities.get();
                    _.each(result.items, function (item) {
                        currentItems.push(item);
                    });
                    self.activities.set(currentItems);

                    self.loadMoreAbility.set(result.loadMoreAbility);
                    self.latestOptions.set(options);
                });
            }
        });

        Event.on("fetchActivities", function () {
            var params = Router.current().params;
            var stage = _.findWhere(Recruit.APPLICATION_STAGES, {alias: params.stage});
            self.jobId.set(parseInt(params.jobId));
            self.applicationId.set(parseInt(params.query.application));
            self.stage.set(stage);

            // get job applications
            var options = {
                application: self.applicationId.get(),
                page: self.page.get()
            };

            self.isLoading.set(true);

            Meteor.call("getActivities", options, function (err, result) {
                if (err) throw err;
                self.isLoading.set(false);
                var currentItems = [];
                _.each(result.items, function (item) {
                    currentItems.push(item);
                });
                self.activities.set(currentItems);

                self.loadMoreAbility.set(result.loadMoreAbility);
            });

        });
    },

    events: function () {
        return [{
            'click .loadmore': this.loadMore
        }];
    },

    loadMore: function () {
        var currentPage = this.page.get();
        this.page.set(currentPage + 1);
    },

    /**
     * HELPERS
     */
    isEmpty: function () {
        return this.activities.get().length < 1;
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
        return moment(this.createdAt).fromNow();
    }

}).register('JobApplicationTimelineItem');


SendEmailCandidateForm = BlazeComponent.extendComponent({
    onCreated: function () {
        var self = this;
        this.show = new ReactiveVar(true);
        this.isLoading = new ReactiveVar(false);

        this.candidate = new ReactiveVar(null);
        this.application = new ReactiveVar(null);


        Event.on('toggleSendEmailCandidateForm', function () {
            if (self.show.get()) {
                self.show.set(false);
            } else {
                self.isLoading.set(true);
                $(".mail-subject").val("");
                $(".mail-content").code("");
                $(".mail-template-options").val(-1);
                var params = Router.current().params;
                if (params.query.hasOwnProperty("application")) {
                    Meteor.call('getApplicationDetails', parseInt(params.query.application), function (err, result) {
                        if (err) throw err;
                        if (result) {
                            self.application.set(result.application);
                            self.candidate.set(result.candidate);
                            $(".mail-to").val(result.candidate.data.username);
                            self.isLoading.set(false);
                        }
                    });
                }
                self.show.set(true);

                /*
                 * - Add slide effect and fix issue when slide
                 */

                var $details = $('.full-height-scroll.white-bg');
                var $mailContainer = $('.mail-container');

                $details.animate({
                    scrollTop: $mailContainer.offset().top - $details.offset().top
                }, 'slow', function () {
                    $details.siblings('.slimScrollBar')
                        .css({'top': h / 2 + 'px'});
                });

            }

        });

        this.editor = undefined;
    },

    onRendered: function () {
        this.show.set(false);
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
        var data = {
            subject: $(".mail-subject").val() || "",
            content: $(".mail-content").code() || "",
            mailTemplate: $(".mail-template-options").val() || "",
            application: this.application.get().entryId
        };

        Meteor.call('sendMailToCandidate', data, function (err, result) {
            if (err) throw err;
            if (result) {
                Notification.success("Mail sent");
                self.show.set(false);
                self.isLoading.set(false);
                Event.emit('fetchActivities');
            }
        });
    },

    cancel: function () {
        this.show.set(false);
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
        this.show = new ReactiveVar(false);
        this.isLoading = new ReactiveVar(false);

        Event.on('toggleCommentCandidateForm', function () {
            if (self.show.get()) {
                self.show.set(false);
            } else {
                $(".comment-candidate").val("");
                self.show.set(true);
            }
        });

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
                self.show.set(false);
                self.isLoading.set(false);
                Event.emit('fetchActivities');
            }
        });
    },

    cancel: function () {
        this.show.set(false);
    }

}).register('AddCommentCandidateForm');