MailComposer = React.createClass({
    mixins: [ReactMeteorData],
    getInitialState() {
        return {
            mailTemplateError: false,
            subjectError: false,
            contentError: false,
            toError: false
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
        // Initialize summernote plugin
        var to = React.findDOMNode(this.refs.to);
        var subject = React.findDOMNode(this.refs.subject);
        var mailContent = React.findDOMNode(this.refs.mailContent);
        to.value = this.props.to.emails.join(",");
        subject.value = "";
        mailContent.value = "";

        $(to).tagsinput("items");


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
    },


    changeMailTemplate(e) {
        var mailTemplate = React.findDOMNode(this.refs.mailTemplate);
        var templateId = mailTemplate.value;
        var template = _.findWhere(this.data.templates, {_id: templateId});
        if(template) {
            var subject = React.findDOMNode(this.refs.subject);
            var mailContent = React.findDOMNode(this.refs.mailContent);
            $(subject).val(template.subject);
            $(mailContent).code(template.htmlBody);
        }
    },

    sendEmails(e) {

        var validate = false;
        var subject = React.findDOMNode(this.refs.subject);
        var mailContent = React.findDOMNode(this.refs.mailContent);
        var mailTemplate = React.findDOMNode(this.refs.mailTemplate);
        var data = {
            mailTemplate: mailTemplate.value,
            to: this.props.to.appIds,
            subject: subject.value,
            content: $(mailContent).code(),
            emailFrom: ""
        };
        //validate &= data.to.length > 0;
        if(data.mailTemplate == "-1") {
            this.setState({mailTemplateError: true});
            validate = false;
        } else {
            this.setState({mailTemplateError: false});
            validate = true;
        }

        if(data.subject.length <= 0) {
            this.setState({subjectError: true});
            validate = false;
        } else {
            this.setState({subjectError: false});
            validate = true;
        }
        var _plainContent = $($(mailContent).code()).text().trim();
        if(_plainContent.length <= 0) {
            this.setState({contentError: true});
            validate = false;
        } else {
            this.setState({contentError: false});
            validate = true;
        }

        if(validate === true) {
            Meteor.call('sendMailToCandidates', data, function(err, result){
                if(err) throw err;
            });
            Notification.success("Emails sent");
            this.props.onDiscard();
        }

        e.preventDefault();
    },

    render() {
        return (
            <div className="mail-box">
                <div className="mail-body">
                    <form className="form-horizontal" method="get">
                        <div className="form-group">
                            <label className="col-sm-2 control-label">Template:</label>

                            <div className="col-sm-10">
                                <select ref="mailTemplate" className="form-control" onChange={this.changeMailTemplate}>
                                    {this.data.templates.map( (t,idx) => <option value={t._id} key={idx}>{t.name}</option> )}
                                </select>
                                {this.state.mailTemplateError ? <p className="text-danger">Please choose a mail template</p> : null}
                            </div>
                        </div>
                        <div className="form-group">
                            <label className="col-sm-2 control-label">To:</label>

                            <div className="col-sm-10">
                                <input type="text" className="form-control" ref={"to"} disabled />
                            </div>
                        </div>
                        <div className="form-group">
                            <label className="col-sm-2 control-label">Subject:</label>

                            <div className="col-sm-10">
                                <input type="text" ref={"subject"} className="form-control"/>
                                {this.state.subjectError ? <p className="text-danger">Please input mail subject</p> : null}
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
                    <button className="btn btn-sm btn-primary" data-toggle="tooltip" data-placement="top"
                            title="Send" onClick={this.sendEmails}><i className="fa fa-reply"></i> Send</button>
                    &nbsp;
                    <button onClick={this.props.onDiscard} className="btn btn-white btn-sm" data-toggle="tooltip" data-placement="top"
                            title="Discard email"><i className="fa fa-times"></i> Discard</button>
                </div>
                <div className="clearfix"></div>
            </div>

        );
    }
});