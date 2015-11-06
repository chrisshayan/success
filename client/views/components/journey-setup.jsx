JourneySetup = React.createClass({
    mixins: [ReactMeteorData],

    getInitialState() {
        return {
            steps: [
                {name: 'JourneyWellcome', step: 0},
                {name: 'JourneyUpdateProfile', step: 1},
                {name: 'JourneyUpdateMailSignature', step: 2},
            ]
        }
    },

    getMeteorData() {
        var user = Meteor.user();
        return {
            user: user || {},
            userId: user ? user._id : null,
            current: user ? user.setupStep : 0
        }
    },

    nextButtonLabel() {
        if (this.data.current < this.state.steps.length) return "Next";
        else if (this.data.current == this.state.steps.length - 1) return "Finish";
        return 'Setup';
    },

    handleClickNext(e) {
        var self = this;
        var nextStep = this.data.current;
        if (this.data.current == this.state.steps.length - 1) nextStep = -1;
        else nextStep += 1;

        Meteor.setTimeout(function () {
            Meteor.users.update({_id: self.data.userId}, {
                $set: {
                    setupStep: nextStep
                }
            });
        }, 0);
    },

    render() {
        var cx = classNames({
            "modal": true,
            "inmodal": true,
            "in": true,
            "show": true
        });

        var content = null;
        if(this.data.current >= 0) {
            content = (
                <div>
                    <div className={cx} id="productTour" tabIndex="-1" role="dialog" ariaHidden="false">
                        <div className="modal-dialog modal-lg">
                            <div className="modal-content product-tour animated bounceInRight">
                                <div className="modal-body">
                                    <div className="carousel slide" id="carouselTour">
                                        <div className="carousel-inner">
                                            {this.state.steps.map(this.renderStepContent)}
                                        </div>
                                        <ol className="carousel-indicators">
                                            {this.state.steps.map(this.renderNav)}
                                        </ol>
                                        <div className="row controllers">
                                            <a data-slide="prev" href="#carouselTour"
                                               className="pull-left left carousel-control">
                                                <button type="button" className="btn btn-default">Back</button>
                                            </a>

                                            <a data-slide="next" href="#carouselTour"
                                               className="pull-right right carousel-control take-a-tour">
                                                <button type="button" className="btn btn-primary btn-take-a-tour"
                                                        onClick={this.handleClickNext}>{ this.nextButtonLabel() }</button>
                                            </a>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div className="modal-backdrop in"></div>
                </div>
            );
        }

        return content;
    },

    renderStepContent(step, idx) {
        var Step = eval(step.name);
        return <Step key={idx} step={step.step} active={this.data.current === step.step}/>;
    },

    renderNav(step, key) {
        var className = cx({
            'active': this.data.current === step.step
        });
        return (
            <li key={key} data-slide-to={step.step} data-target="#carouselTour" className={className}></li>
        );
    }
});


var JourneyWellcome = React.createClass({
    render() {
        var cx = classNames({
            'item': true,
            'active': this.props.active
        });
        return (
            <div className={ cx }>
                <div className="carousel-caption animated bounceInRight">
                    <h2>Welcome to SUCCESS Site</h2>

                    <p>You are landing to the new Application Tracking System that will
                        facilitate and speed up your hiring at VietnamWorks.com</p>
                </div>
                <img alt="image" className="img-responsive"
                     src="http://images.vietnamworks.com/img/producttour-dashboard.png"/>
            </div>
        );
    }
});

var JourneyUpdateProfile = React.createClass({
    render() {
        var cx = classNames({
            'item': true,
            'active': this.props.active
        });
        return (
            <div className={ cx }>
                <div className="carousel-caption animated bounceInRight">
                    <h2><i className="fa fa-flask"></i> Update your profile</h2>

                    <p>List, filter, edit, delete and duplicate your job posts. From each
                        job
                        you can easily manage the job applications received.</p>
                </div>
                <img alt="image" className="img-responsive"
                     src="http://images.vietnamworks.com/img/producttour-myjob.png"/>
            </div>
        );
    }
});


var JourneyUpdateMailSignature = React.createClass({
    render() {
        var cx = classNames({
            'item': true,
            'active': this.props.active
        });
        return (
            <div className={ cx }>
                <div className="carousel-caption animated bounceInRight">
                    <h2><i className="fa fa-flask"></i> Mail signature</h2>

                    <p>List, filter, edit, delete and duplicate your job posts. From each
                        job
                        you can easily manage the job applications received.</p>
                </div>
                <img alt="image" className="img-responsive"
                     src="http://images.vietnamworks.com/img/producttour-myjob.png"/>
            </div>
        );
    }
});