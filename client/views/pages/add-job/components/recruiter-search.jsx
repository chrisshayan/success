var cx = React.addons.classSet;

RecruiterSearch = React.createClass({
    mixins: [ReactMeteorData],

    getInitialState() {
        return {
            q: '',
            itemActive: null
        };
    },

    getMeteorData() {
        if (this.state.q.length > 0) {
            var sub = RecruiterSubs.subscribe('recruiterSearch', this.filter(), this.option());
        }

        return {
            isReady: sub && sub.ready() ? true : false,
            isSearching: sub ? !sub.ready() : false,
            recruiters: Meteor.users.find(this.filter(), this.option()).fetch()
        };
    },

    filter: function () {
        return {
            _id: {$nin: this.props.except || []},
            $or: [
                {
                    username: {
                        $regex: '^' + this.state.q,
                        $options: 'i'
                    }
                },
                {
                    "emails.address": {
                        $regex: '^' + this.state.q,
                        $options: 'i'
                    }
                },
                {
                    "profile.firstname": {
                        $regex: '^' + this.state.q,
                        $options: 'i'
                    }
                },
                {
                    "profile.lastname": {
                        $regex: '^' + this.state.q,
                        $options: 'i'
                    }
                }
            ]
        }
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
                    k = this.data.recruiters.length - 1;
                } else {
                    k -= 1;
                    if (k < 0) {
                        k = this.data.recruiters.length - 1;
                    }
                }
                break;
            case 40: // move down
                if (k === null) {
                    k = 0;
                } else {
                    k += 1;
                    if (k >= this.data.recruiters.length) {
                        k = 0;
                    }
                }
                break;
            case 13: // select
                this.handleSelect(this.data.recruiters[k]);
                break;
        }
        if (k !== null) {
            this.setState({itemActive: k})
        }
    },

    handleSelect(user) {
        if(this.state.q.length <= 0) return;
        this.setState({
            q: '',
            itemActive: null
        });
        if(user)
            this.props.onSelect(user);
    },

    render() {
        var styles = {
            container: {
                position: 'relative'
            },
            result: {
                position: 'absolute',
                top: '95%',
                left: '2.5%',
                zIndex: 9999,
                width: '95%',
                display: this.data.isReady ? 'block' : 'none',
                background: '#fff',
                border: '1px solid #eee'
            }
        };
        var className = cx({
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
                    value={this.state.q}
                    placeholder="search recruiter..."
                    style={{width: '100%'}}/>

                <div style={ styles.result }>
                    {!this.data.recruiters.length ? <p style={{padding: '4px 10px 0 10px'}}>(no matches)</p> : null}
                    {this.data.recruiters.map(this.renderRecruiter)}
                </div>
            </div>
        );
    },

    renderRecruiter(u, key) {
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
            <div key={key} style={ styles.recruiter } className='recruiter-search-item' onClick={ () => this.handleSelect(u) }>
                <div style={ styles.name }>{[u.profile.firstname, u.profile.lastname].join(' ')}</div>
                <div style={ styles.email }>{u.defaultEmail()}</div>
            </div>
        );
    }
});