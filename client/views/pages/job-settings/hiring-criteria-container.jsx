HiringCriteriaContainer = React.createClass({
    propTypes: {
        jobId: React.PropTypes.number.isRequired,
        hiringCriteria: React.PropTypes.object.isRequired
    },

    handleSelectCriteria(skill, cate) {
        Meteor.call('addJobCriteria', this.props.jobId, cate, skill.skillName, function(err, result) {

        });
    },

    handleRemoveCriteria(name, cate) {
        Meteor.call('removeJobCriteria', this.props.jobId, cate, name, function(err, result) {

        });
    },

    render() {
        return (
            <div className="row">
                {_.toArray(this.props.hiringCriteria).map(this.renderCategory)}
            </div>
        );
    },

    renderCategory(cate, key) {
        return (
            <div key={key} className="col-sm-3 col-md-3">
                <h3>{cate.name}</h3>
                <TagsInput id={cate.alias} placeholder={cate.hint} onSelect={this.handleSelectCriteria}/>
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
            <li key={key} className="primary-element">
                <span>{name}</span>
                <span className="pull-right remove-criteria" onClick={() => this.handleRemoveCriteria(name, cateId)}>
                    <i className="fa fa-minus"></i>
                </span>
            </li>
        );
    }
});