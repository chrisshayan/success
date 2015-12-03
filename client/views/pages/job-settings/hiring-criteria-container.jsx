HiringCriteriaContainer = React.createClass({
    propTypes: {
        jobId: React.PropTypes.number.isRequired,
        hiringCriteria: React.PropTypes.object.isRequired
    },

    getInitialState() {
        return {
            isLoading: false,
            recommendCriteria: {
                skills: [],
                personalityStrait: [],
                qualifications: [],
                details: []
            }
        }
    },

    handleSelectCriteria(tag, cate) {
        Meteor.call('addJobCriteria', this.props.jobId, cate, tag, function (err, result) {

        });
    },

    handleRemoveCriteria(name, cate) {
        Meteor.call('removeJobCriteria', this.props.jobId, cate, name, function (err, result) {

        });
    },

    componentWillMount() {
        this.setState({isLoading: true});
        Meteor.call('getRecommendCriteria', this.props.jobId, (err, recommendCriteria) => {
            if (!err && recommendCriteria) {
                this.setState({recommendCriteria})
            }
            this.setState({isLoading: false});
        });
    },

    render() {
        return (
            <div className="row">
                {this.state.isLoading ? <WaveLoading /> : _.toArray(this.props.hiringCriteria).map(this.renderCategory) }
            </div>
        );
    },

    renderCategory(cate, key) {
        let placeholder = '';
        switch (cate.alias) {
            case 'skills':
                placeholder = 'php, js, accounting,...';
                break;

            case 'personalityTraits':
                placeholder = 'team oriented, matunity,...';
                break;

            case 'qualifications':
                placeholder = 'motivated, bachelors,...';
                break;

            case 'details':
                placeholder = 'salary requirements,...';
                break;
        }

        return (
            <div key={key} className="col-sm-3 col-md-3 criteria-set">
                <h3>{cate.name}</h3>

                <CriteriaSearch
                    jobId={this.props.jobId}
                    alias={cate.alias}
                    placeholder={placeholder}
                    onSelect={ (tag) => this.handleSelectCriteria(tag, cate.alias)}/>

                <div>
                    <ul className="sortable-list connectList agile-list ui-sortable">
                        {cate.criteria.map((name, key) => this.renderCriteria(name, cate.alias, key))}
                    </ul>
                </div>
            </div>
        );
    },

    renderCriteria(name, cateId, key) {
        return (
            <li key={key} className="primary-element clearfix">
                <span className="pull-left" style={{width: '90%'}}>{name}</span>
                <span className="pull-right remove-criteria" onClick={() => this.handleRemoveCriteria(name, cateId)}>
                    <i className="fa fa-minus"></i>
                </span>
            </li>
        );
    }
});