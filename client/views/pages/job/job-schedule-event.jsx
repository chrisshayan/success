ScheduleEvent = React.createClass({
    propsType: {
        appId: React.PropTypes.number.isRequired
    },
    getInitialState() {
        let d = new moment();
        let startTime = d.clone();
        startTime.add(1, 'hour');
        let endTime = startTime.clone();
        endTime.add(1, 'hour');


        return {
            isLoading: false,
            emails: [],
            templates: [],

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

    componentWillMount() {
        this.props.actions.changeTab(2);
    },

    componentDidMount() {
        this.handle__FetchData();

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

        $('.date').datepicker({
            todayBtn: "linked",
            keyboardNavigation: false,
            forceParse: false,
            calendarWeeks: true,
            autoclose: true,
            format: 'dd/mm/yyyy'
        });

        $('.clockpicker').clockpicker();

        let container = $("#job-candidate-content");
        let actionContainer = $('.job-candidate-actions');
        var body = $("html, body");
        let scrollTo = 0;
        if(actionContainer && actionContainer.hasClass('affix')) {
            scrollTo = container.offset().top - 45;
        } else {
            scrollTo = container.offset().top - 50 - 45;
        }
        body.stop().animate({scrollTop: scrollTo}, '500', 'swing');
    },

    selectMailTemplate(templateId) {
        if (templateId) {
            var template = _.findWhere(this.state.templates, {_id: templateId});
            if (template) {
                var mailContent = React.findDOMNode(this.refs.mailContent);
                var subject = React.findDOMNode(this.refs.subject);
                $(subject).val(template.subject);
                $(mailContent).code(template.htmlBody);
            }
        }
    },

    handle__SelectDefaultTemplate() {
        const templates = _.filter(this.state.templates, function (r) {
            return r.name.match(/arrange an interview/i)
        });
        if (templates.length > 0) {
            const templateId = templates[0]['_id'] || '';
            $(this.refs.mailTemplate.getDOMNode()).val(templateId);
            this.selectMailTemplate(templateId);
        }
    },

    handle__FetchData() {
        this.setState({isLoading: true});
        Meteor.call('getScheduleEventData', [this.props.appId], (err, data) => {
            if (!err) {
                this.setState({
                    isLoading: false,
                    emails: data.emails,
                    templates: data.templates
                });

                this.handle__SelectDefaultTemplate();
            }
        });
    },

    changeMailTemplate(e) {
        var mailTemplate = React.findDOMNode(this.refs.mailTemplate);
        var templateId = mailTemplate.value;
        this.selectMailTemplate(templateId);
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
            subject: subject.value,
            body: $(mailContent).code()
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
        if (this.validate()) {
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
        const app = this.props.application;
        if (app) {
            return app.fullname + ' -- ' + app.emails[0];
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
                                    {this.state.templates.map((t, idx) => <option value={t._id}
                                                                                  key={idx}>{t.name}</option>)}
                                </select>
                                {this.state.mailTemplateError ? <p className="text-danger">Please choose a mail
                                    template</p> : null}
                            </div>
                        </div>
                        <div className="form-group">
                            <label className="col-sm-2 control-label">Candidate:</label>

                            <div className="col-sm-10">
                                <div className="form-control-static">
                                    {this.state.emails.map((email, key) => <span key={key}><span
                                        className="label label-info label-mail-to">{email}</span>&nbsp;</span>)}
                                </div>
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
                                <GooglePlaceInput onChange={(loc) => this.setState({location: loc})}/>
                            </div>
                        </div>

                        <div className="form-group">
                            <label className="col-sm-2 control-label">Date:</label>

                            <div className="col-sm-4">
                                <div className="input-group" data-autoclose="true">
                                    <input type="text" ref="scheduleDate" className="form-control date"
                                           placeholder="dd/mm/yyyy" defaultValue={this.state.scheduleDate}/>
                                    <span className="input-group-addon">
                                        <span className="fa fa-calendar"></span>
                                    </span>
                                </div>
                            </div>
                            <div className="col-sm-6">
                                <div className="input-daterange input-group">
                                    <div className="input-group clockpicker" data-autoclose="true">
                                        <input type="text" ref="startTime" className="form-control"
                                               defaultValue={this.state.startTime}/>
                                    </div>
                                    <span className="input-group-addon">to</span>

                                    <div className="input-group clockpicker" data-autoclose="true">
                                        <input type="text" ref="endTime" className="form-control"
                                               defaultValue={this.state.endTime}/>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="form-group">
                            <label className="col-sm-2 control-label">Subject:</label>

                            <div className="col-sm-10">
                                <input
                                    type="text"
                                    ref="subject"
                                    className="form-control"
                                    defaultValue={this.state.subject}
                                    onChange={(e) => this.setState({subject: e.target.value})}/>
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
        if (u['username']) {
            name.push(`- @${u.username}`)
        }
        return (
            <li key={key}>
                <span>{name.join(' ')}</span>
                <span className="btn btn-link" onClick={(e) => this.handleRemoveInterviewer(u, e)}>
                    <i className="fa fa-times"/>
                </span>
            </li>
        );
    }
});

GooglePlaceInput = React.createClass({
    componentDidMount: function () {
        var input = this.refs.searchField.getDOMNode();
        var options = {componentRestrictions: {country: 'vn'}};
        this.autocomplete = new google.maps.places.Autocomplete(input, options);
        this.autocomplete.addListener('place_changed', this.handleChange);
    },

    componentWillUnmount: function () {
        delete this.autocomplete;
    },

    handleChange() {
        this.props.onChange && this.props.onChange(this.refs.searchField.getDOMNode().value);
    },

    render: function () {
        return (
            <input type="text" className="form-control" ref="searchField"
                   placeholder="Enter a location"
                   onChange={this.handleChange}
            />
        );
    }
});