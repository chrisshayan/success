scheduleForm = Astro.Class({
	name: 'scheduleFormSchema',
	fields: {
		templateId: {
			type: 'string',
			validator: [
				Validators.required(null, 'Mail template is required.')
			]
		},
		interviewers: {
			type: 'array',
			validator: [
				Validators.minLength(1, 'Please add at least one interviewer.')
			]
		},
		scheduleDate: {
			type: 'date',
			validator: [
				Validators.date(null, 'Schedule date is required.'),
				Validators.required(null, 'Schedule date is required.')
			]
		},
		startTime: {
			type: 'date',
			validator: [
				Validators.date(null, 'Start time is required.'),
				Validators.required(null, 'Start time is required.'),
				Validators.gte(new Date(), ''),
			]
		},
		endTime: {
			type: 'date',
			validator: [
				Validators.date(null, 'End time is required.'),
				Validators.required(null, 'End time is required.')
			]
		},
		subject: {
			type: 'string',
			validator: [
				Validators.required(null, 'Subject is required.')
			]
		},
		body: {
			type: 'string',
			validator: [
				Validators.required(null, 'Email content is required.')
			]
		}
	}
});

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
			errors: {},
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
			endTime: endTime.format('HH:00')
		};
	},

	componentWillMount() {
		this.props.actions.changeTab(2);
		FormTabEvents.bind();
	},

	componentDidMount() {
		this.handle__FetchData();

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
			startDate: new Date(),
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
		if (actionContainer && actionContainer.hasClass('affix')) {
			scrollTo = container.offset().top - 45;
		} else {
			scrollTo = container.offset().top - 50 - 45;
		}

		body.stop().animate({scrollTop: scrollTo}, '500', 'swing', _.debounce(() => {
			this.refs.interviewers.focus();
		}, 1100));
	},

	componentWillUnmount() {
		FormTabEvents.unbind();
	},

	selectMailTemplate(templateId) {
		if (templateId) {
			var template = _.findWhere(this.state.templates, {_id: templateId});
			if (template) {
				var mailContent = this.refs.mailContent;
				var subject = this.refs.subject;
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
			$(this.refs.mailTemplate).val(templateId);
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
		var mailTemplate = this.refs.mailTemplate;
		var templateId = mailTemplate.value;
		this.selectMailTemplate(templateId);

		var errors = this.state.errors;
		errors.templateId = false;
		this.setState({errors: errors});

	},

	getFormData() {
		var subject = this.refs.subject;
		var mailContent = this.refs.mailContent;
		var mailTemplate = this.refs.mailTemplate;
		var scheduleDate = this.refs.scheduleDate;
		var startTime = this.refs.startTime.value.split(':');
		var endTime = this.refs.endTime.value.split(':');
		var sd = new moment(scheduleDate.value, 'DD/MM/YYYY');
		var st = sd.clone();
		st.hour(startTime[0]);
		st.minute(startTime[1]);

		var et = sd.clone();
		et.hour(endTime[0]);
		et.minute(endTime[1]);


		return {
			templateId: (mailTemplate.value !== '-1') ? mailTemplate.value : null,
			interviewers: _.pluck(this.state.interviewers, '_id'),
			location: this.state.location || '',
			scheduleDate: sd.isValid() ? sd.toDate() : null,
			startTime: this.refs.startTime.value && st.isValid() ? st.toDate() : null,
			endTime: this.refs.endTime.value && et.isValid() ? et.toDate() : null,
			subject: subject.value || null,
			body: $($(mailContent).code()).text() ? $(mailContent).code() : null
		};
	},

	validate(data) {
		var model = new scheduleForm(data);
		var result = model.validate();
		this.setState({errors: model.getValidationErrors()});
		if (result) {
			if (model.endTime <= model.startTime) {
				this.setState({errors: {endTime: 'End time must great than start time'}});
				result = false;
			}
		}

		return result;
	},


	handleSelectRecruiter(user) {
		let interviewers = this.state.interviewers;
		interviewers.push(user);
		var errors = this.state.errors;
		errors.interviewers = false;

		this.setState({
			errors: errors,
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
		var data = this.getFormData();
		if (this.validate(data)) {
			//this.setState({errors: {}});
			let msg = `
                <div class="text-left">
                    The invitation will be sent to all participants including an iCal attachment.
                    <br/><br/>
                    iCal is standard meeting invitation format that can be used in Outlook or other well-known calendars.
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
		var errors = this.state.errors;
		return (
			<div className="mail-box" ref="container">
				<div className="mail-body">
					<form className="form-horizontal" method="get">
						<div className="form-group">
							<label className="col-sm-2 control-label">Template:</label>

							<div className="col-sm-10">
								<select ref="mailTemplate" className="form-control tabbable"  onChange={this.changeMailTemplate}>
									{this.state.templates.map((t, idx) => (
										<option value={t._id} key={idx}>{t.name}</option>
									))}
								</select>
								{errors.templateId ? <p className="text-danger">{errors.templateId}</p> : null}
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
									ref="interviewers"
									except={_.pluck(this.state.interviewers, '_id')}
									placeholder="search interviewer..."
									onSelect={this.handleSelectRecruiter}
									/>

								<ul className="interviewers-list">
									{this.state.interviewers.map(this.renderInterviewer)}
								</ul>
								{errors.interviewers ? <p className="text-danger">{errors.interviewers}</p> : null}
							</div>
						</div>

						<div className="form-group">
							<label className="col-sm-2 control-label">Location:</label>

							<div className="col-sm-10">
								<GooglePlaceInput onChange={(loc) => this.setState({location: loc})} />
							</div>
						</div>

						<div className="form-group">
							<label className="col-sm-2 control-label">Date:</label>

							<div className="col-sm-4">
								<div className={classNames("input-group", {'error': errors.scheduleDate})}
								     data-autoclose="true">
									<input type="text" ref="scheduleDate" className="tabbable form-control date"
									       placeholder="dd/mm/yyyy" defaultValue={this.state.scheduleDate} />
                                    <span className="input-group-addon">
                                        <span className="fa fa-calendar"></span>
                                    </span>
								</div>
								{errors.scheduleDate ? <p className="text-danger">{errors.scheduleDate}</p> : null}
							</div>
							<div className="col-sm-6">
								<div className="input-daterange input-group">
									<div
										className={classNames("input-group", 'clockpicker', {'error': errors.startTime})}
										data-autoclose="true">
										<input type="text" ref="startTime" className="tabbable form-control"
										       defaultValue={this.state.startTime}  />
									</div>
									<span className="input-group-addon">to</span>

									<div className={classNames("input-group", 'clockpicker', {'error': errors.endTime})}
									     data-autoclose="true">
										<input type="text" ref="endTime" className="tabbable form-control"
										       defaultValue={this.state.endTime} />
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
									className="tabbable form-control"
									defaultValue={this.state.subject}
									onChange={(e) => this.setState({subject: e.target.value})}
									/>
								{errors.subject ? <p className="text-danger">{errors.subject}</p> : null}
							</div>
						</div>
					</form>
				</div>
				<div className="mail-text h-200">
					<div className="summernote tabbable" ref="mailContent" ></div>
					<div className="clearfix"></div>
				</div>
				{errors.body ? <p className="text-danger">{errors.body}</p> : null}
				<div className="mail-body text-right tooltip-demo">
					<button className="tabbable btn btn-sm btn-primary btn-outline" data-toggle="tooltip" data-placement="top"
					        title="Send" onClick={this.handleSave} ><i className="fa fa-reply"></i> Save
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
		var input = this.refs.searchField;
		var options = {componentRestrictions: {country: 'vn'}};
		this.autocomplete = new google.maps.places.Autocomplete(input, options);
		this.autocomplete.addListener('place_changed', this.handleChange);
	},

	componentWillUnmount: function () {
		delete this.autocomplete;
	},

	handleChange() {
		this.props.onChange && this.props.onChange(this.refs.searchField.value);
	},

	render: function () {
		return (
			<input
				ref="searchField"
				type="text"
				className="tabbable form-control"
				placeholder="Enter a location"
				onChange={this.handleChange}
				/>
		);
	}
});