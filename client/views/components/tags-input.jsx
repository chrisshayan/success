const skillCollection = new Mongo.Collection('es_skills');

TagsInput = React.createClass({
    mixins: [ReactMeteorData],

    getInitialState() {
        return {
            q: '',
            itemActive: null
        };
    },

    getMeteorData() {
        var fetch = [this.filter(), this.option()];
        var isReady = false;
        if (this.state.q.length > 0) {
            var sub = SkillsSubs.subscribe('skillSearch', this.state.q);
            isReady = sub && sub.ready();
        }

        return {
            isReady: isReady,
            isSearching: sub ? !sub.ready() : false,
            skills: skillCollection.find(...fetch).fetch()
        };
    },

    filter: function () {
        var f = {
            skillName: {
                $regex: this.state.q,
                $options: 'i'
            }
        };
        if (!_.isEmpty(this.props.except)) {
            f['_id'] = {$nin: this.props.except};
        }

        return f;
    },

    option() {
        return {
            limit: 5
        };
    },

    handleKeyUp(e) {
        var k = this.state.itemActive;
        switch (e.which) {

            case 38: // move up
                if (k === null) {
                    k = this.data.skills.length - 1;
                } else {
                    k -= 1;
                    if (k < 0) {
                        k = -1
                    }
                }
                break;
            case 40: // move down
                if (k === null) {
                    k = 0;
                } else {
                    k += 1;
                    if (k >= this.data.skills.length) {
                        k = -1;
                    }
                }
                break;
            case 13: // select
                var skill = this.data.skills[k];
                if (!skill) {
                    if (this.state.q.length > 0) {
                        skill = {
                            skillName: this.state.q
                        };
                    }
                }
                this.handleSelect(skill);
                break;
        }
        if (k !== null) {
            this.setState({itemActive: k})
        }
    },

    handleKeyDown(e) {
        switch (e.which) {
            case 8:
                if(this.state.q.length <= 0) {
                    this.props.onRemoveLastTag && this.props.onRemoveLastTag();
                }
                break;
        }
    },

    handleSelect(skill) {
        if (this.state.q.length <= 0) return;
        this.setState({
            q: '',
            itemActive: null
        });
        if (skill) {
            this.props.onSelect && this.props.onSelect(skill, this.props.id || null);
        }
    },

    render() {
        var styles = {
            container: {
                position: 'relative',
                display: 'inline-block'
            },
            result: {
                position: 'absolute',
                top: '100%',
                left: '2.5%',
                zIndex: 9999,
                width: '95%',
                display: this.data.isReady ? 'block' : 'none',
                background: '#fff',
                border: '1px solid #eee'
            }
        };
        var className = classNames({
            'recruiter-search': true,
            'form-control': true,
            'loading': this.data.isSearching
        });

        return (
            <div style={ styles.container }>
                <input
                    className={className}
                    onChange={(e) => this.setState({q: e.target.value})}
                    onKeyUp={this.handleKeyUp}
                    onKeyDown={this.handleKeyDown}
                    value={this.state.q}
                    placeholder={this.props.placeholder || 'Search skill...'}
                    style={this.props.style || {width: '100%'}}/>

                <div style={ styles.result }>
                    {!this.data.skills.length ? <p style={{padding: '4px 10px 0 10px'}}>(no matches)</p> : null}
                    {this.data.skills.map(this.renderSkill)}
                </div>
            </div>
        );
    },

    renderSkill(skill, key) {
        var styles = {
            recruiter: {
                background: key == this.state.itemActive ? '#5288bb' : '#fff',
                color: key == this.state.itemActive ? '#fff' : 'inherit'
            },
            name: {
                fontWeight: 700
            },
            email: {}
        };
        return (
            <div key={key} style={ styles.recruiter } className='recruiter-search-item'
                 onClick={ () => this.handleSelect(skill) }>
                <div style={ styles.name }>{skill.skillName}</div>
            </div>
        );
    }
});