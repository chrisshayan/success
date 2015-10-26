HiringCriteriaContainer = React.createClass({
    mixins: [ReactMeteorData],
    getMeteorData() {
        var params = Router.current().params;
        var jobId = params.jobId;
        var categories = [];
        var isReady = Meteor.subscribe('currentJobCriteria', {jobId: jobId}).ready();
        if(isReady)
            categories = Meteor.job_criteria_set.find({jobId: jobId}).fetch();

        return {
            jobId: jobId,
            categories: categories
        };
    },
    handleSelectCriteria(skill, id) {
        Meteor.call('addJobCriteria', this.data.jobId, id, skill.skillName, function(err, result) {

        });
    },

    render() {
        return (
            <div className="row">
                {this.data.categories.map(this.renderCategory)}
            </div>
        );
    },

    renderCategory(cate, key) {
        return (
            <div key={key} className="col-sm-3 col-md-3">
                <h3>{cate.name}</h3>
                <TagsInput id={cate._id} placeholder={cate.hint} onSelect={this.handleSelectCriteria}/>
                <JobCriteriaSet category={cate}  />
            </div>
        );
    }
});


JobCriteriaSet = React.createClass({
    mixins: [ReactMeteorData],
    getMeteorData() {
        var cond = {
            criteriaSetId: this.props.category._id
        };
        return {
            criteria: Meteor.job_criteria.find(cond).fetch()
        };
    },

    handleRemoveCriteria(data) {
        Meteor.call('removeJobCriteria', data._id)
    },

    render() {
        return (
            <div>
                <ul className="sortable-list connectList agile-list ui-sortable">
                    {this.data.criteria.map(this.renderCriteria)}
                </ul>
            </div>
        );
    },

    renderCriteria(data, key) {
        return (
            <li key={key} className="primary-element">
                <span>{data.label}</span>
                <span className="pull-right remove-criteria" onClick={() => this.handleRemoveCriteria(data)}>
                    <i className="fa fa-minus"></i>
                </span>
            </li>
        );
    }
});

