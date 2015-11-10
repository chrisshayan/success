let LinkedStateMixin = React.addons.LinkedStateMixin;

ScheduleEvent = React.createClass({
    mixins: [ReactMeteorData, LinkedStateMixin],
    propsType: {
        application: React.PropTypes.object.isRequired
    },
    getInitialState() {
        let d = new moment();
        let startTime = d.clone();
        startTime.add(1, 'hour');
        let endTime = startTime.clone();
        endTime.add(1, 'hour');


        return {
            mailTemplateError: false,
            subjectError: false,
            contentError: false,
            toError: false,
            interviewersError: false,
            locationError: false,
            scheduleDateError: false,
            startTimeError: false,
            endTimeError: false,

            interviewers: [],
            location: '',
            subject: '',
            scheduleDate: d.format('DD/MM/YYYY'),
            startTime: startTime.format('HH:00'),
            endTime: endTime.format('HH:00'),
        };
    },
    getMeteorData() {
        var templates = [{_id: -1, name: "Select mail template"}];
        templates = _.union(templates, Collections.MailTemplates.find().fetch());
        return {
            templates: templates
        }
    },
    componentDidMount() {
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

        $('.summernote').summernote({
            toolbar: [
                ['group', ['mailPlaceholder']],
                ['style', ['bold', 'italic', 'underline', 'clear']],
                ['color', ['color']],
                ['para', ['ul', 'ol', 'paragraph']],
                ['insert', ['link', 'hr']]
            ]
        });

        let container = this.refs.container.getDOMNode();
        let scrollTo = $(container).offset().top - 140;
        $('body').animate({
            scrollTop: scrollTo
        }, 'slow');


        $('.date').datepicker({
            todayBtn: "linked",
            keyboardNavigation: false,
            forceParse: false,
            calendarWeeks: true,
            autoclose: true
        });

        $('.clockpicker').clockpicker();
    },


    changeMailTemplate(e) {
        var mailTemplate = React.findDOMNode(this.refs.mailTemplate);
        var templateId = mailTemplate.value;
        var template = _.findWhere(this.data.templates, {_id: templateId});
        if (template) {
            var mailContent = React.findDOMNode(this.refs.mailContent);
            this.setState({subject: template.subject});
            $(mailContent).code(template.htmlBody);
        }
    },

    getFormData() {
        var subject = React.findDOMNode(this.refs.subject);
        var mailContent = React.findDOMNode(this.refs.mailContent);
        var mailTemplate = React.findDOMNode(this.refs.mailTemplate);
        var scheduleDate = React.findDOMNode(this.refs.scheduleDate);
        var startTime = React.findDOMNode(this.refs.startTime).value.split(':');
        var endTime = React.findDOMNode(this.refs.endTime).value.split(':');
        var sd = new moment(scheduleDate.value, 'DD/MM/YYYY');
        var st = sd.clone();
        st.hour(startTime[0]);
        st.minute(startTime[1]);

        var et = sd.clone();
        et.hour(endTime[0]);
        et.minute(endTime[1]);


        let data = {
            templateId: mailTemplate.value,
            interviewers: _.pluck(this.state.interviewers, '_id'),
            location: this.state.location,
            scheduleDate: sd.isValid() ? sd.toDate() : false,
            startTime: st.isValid() ? st.toDate() : false,
            endTime: et.isValid() ? et.toDate() : false,
            subject: this.state.subject,
            html: $(mailContent).code()
        };

        return data;
    },

    validate() {
        return true;
    },


    handleSelectRecruiter(user) {
        let interviewers = this.state.interviewers;
        interviewers.push(user);
        this.setState({
            interviewers: _.unique(interviewers)
        });
    },

    handleRemoveInterviewer(user, e) {
        e.preventDefault();
        let interviewers = _.without(this.state.interviewers, user);
        this.setState({
            interviewers: interviewers
        });
    },


    handleSave(e) {
        e.preventDefault();
        if(this.validate()) {
            let data = this.getFormData();
            let msg = `
                <div class="text-left">
                    The invitation will be sent to all participants including an iCal attachment.
                    <br/><br/>
                    Please ensure participants accept the invitation or re-schedule if needed
                </div>
            `;
            swal({
                title: "",
                text: msg,
                type: "info",
                showCancelButton: true,
                confirmButtonColor: "#1ab394",
                confirmButtonText: "OK",
                closeOnConfirm: false,
                html: true
            }, () => {
                this.props.onSave && this.props.onSave(data);
            });

        }
    },

    handleDiscard(e) {
        this.props.onDiscard && this.props.onDiscard();
    },

    candidateEmail() {
        let canInfo = this.props.application && this.props.application['candidateInfo']
            ? this.props.application['candidateInfo']
            : null;
        if(canInfo) {
            return canInfo.fullname + ' -- ' + canInfo.emails[0];
        }
        return '';
    },

    render() {
        return (
            <div className="mail-box" ref="container">
                <div className="mail-body">
                    <form className="form-horizontal" method="get">
                        <div className="form-group">
                            <label className="col-sm-2 control-label">Template:</label>

                            <div className="col-sm-10">
                                <select ref="mailTemplate" className="form-control" onChange={this.changeMailTemplate}>
                                    {this.data.templates.map( (t,idx) => <option value={t._id}
                                                                                 key={idx}>{t.name}</option> )}
                                </select>
                                {this.state.mailTemplateError ? <p className="text-danger">Please choose a mail
                                    template</p> : null}
                            </div>
                        </div>
                        <div className="form-group">
                            <label className="col-sm-2 control-label">Candidate:</label>

                            <div className="col-sm-10">
                                <span className="label label-primary">{this.candidateEmail()}</span>
                            </div>
                        </div>

                        <div className="form-group">
                            <label className="col-sm-2 control-label">Interviewers:</label>

                            <div className="col-sm-10">

                                <RecruiterSearch
                                    except={_.pluck(this.state.interviewers, '_id')}
                                    placeholder="search interviewer..."
                                    onSelect={this.handleSelectRecruiter}/>

                                <ul className="interviewers-list">
                                    {this.state.interviewers.map(this.renderInterviewer)}
                                </ul>
                            </div>
                        </div>

                        <div className="form-group">
                            <label className="col-sm-2 control-label">Location:</label>

                            <div className="col-sm-10">
                                <input type="text" className="form-control" placeholder="Enter a location" valueLink={this.linkState('location')}/>
                            </div>
                        </div>

                        <div className="form-group">
                            <label className="col-sm-2 control-label">Date:</label>

                            <div className="col-sm-4">
                                <div className="input-group" data-autoclose="true">
                                    <input type="text" ref="scheduleDate" className="form-control date" placeholder="dd/mm/yyyy" defaultValue={this.state.scheduleDate}/>
                                    <span className="input-group-addon">
                                        <span className="fa fa-calendar"></span>
                                    </span>
                                </div>
                            </div>
                            <div className="col-sm-6">
                                <div className="input-daterange input-group">
                                    <div className="input-group clockpicker" data-autoclose="true">
                                        <input type="text" ref="startTime" className="form-control" defaultValue={this.state.startTime}/>
                                    </div>
                                    <span className="input-group-addon">to</span>
                                    <div className="input-group clockpicker" data-autoclose="true">
                                        <input type="text" ref="endTime" className="form-control" defaultValue={this.state.endTime}/>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="form-group">
                            <label className="col-sm-2 control-label">Subject:</label>

                            <div className="col-sm-10">
                                <input type="text" className="form-control" valueLink={this.linkState('subject')}/>
                                {this.state.subjectError ? <p className="text-danger">Please input mail
                                    subject</p> : null}
                            </div>
                        </div>
                    </form>
                </div>
                <div className="mail-text h-200">
                    {this.state.contentError ? <p className="text-danger">Please input mail content</p> : null}
                    <div className="summernote" ref="mailContent"></div>
                    <div className="clearfix"></div>
                </div>
                <div className="mail-body text-right tooltip-demo">
                    <button className="btn btn-sm btn-primary btn-outline" data-toggle="tooltip" data-placement="top"
                            title="Send" onClick={this.handleSave}><i className="fa fa-reply"></i> Save
                    </button>
                    &nbsp;
                    <button onClick={this.handleDiscard} className="btn btn-white btn-sm btn-outline"
                            data-toggle="tooltip" data-placement="top"
                            title="Discard email"><i className="fa fa-times"></i> Discard
                    </button>
                </div>
                <div className="clearfix"></div>
            </div>

        );
    },

    renderInterviewer(u, key) {
        let name = [u.profile.firstname, u.profile.lastname];
        if(u['username']) {
            name.push(`- @${u.username}`)
        }
        return (
            <li key={key}>
                <span>{name.join(' ')}</span>
                <span className="btn btn-link" onClick={(e) => this.handleRemoveInterviewer(u, e)}>
                    <i className="fa fa-times" />
                </span>
            </li>
        );
    }
});