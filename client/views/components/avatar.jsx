Avatar = React.createClass({
    mixins: [ReactMeteorData],

    propTypes: {
        upload: React.PropTypes.bool,
        width: React.PropTypes.number,
        height: React.PropTypes.number,
        crop: React.PropTypes.string
    },

    getDefaultProps() {
        return {
            upload: false,
            width: 100,
            height: 100,
            crop: 'thumb'
        };
    },

    getInitialState() {
        return {
            hover: false
        };
    },

    getMeteorData() {
        var user = Meteor.users.findOne({_id: this.props.userId});
        if(!user) {
            user = {
                profile: {
                    avatar: ''
                }
            };
        }
        return {
            user: user
        };
    },

    openUploadWidget() {
        var self = this;
        var oldId = this.data.avatarId;
        const options = {
            format: 'jpg',
            width: 128,
            height: 128,
            crop: this.props.crop,
            quality: 100
        };

        cloudinary.openUploadWidget({
                cloud_name: 'pim',
                upload_preset: 'gcvsyt6b',
                multiple: false,
                cropping: 'server',
                cropping_aspect_ratio: '1',
                cropping_coordinates_mode: 'face',
                sources: ['local', 'url'],
                resource_type: 'image',
                client_allowed_formats: ["png","gif", "jpeg", "jpg"]
            },
            function (error, result) {
                if (!error) {
                    Meteor.call('removeAvatar', oldId);
                    Meteor.users.update({_id: self.props.userId}, {
                        $set: {
                            "profile.avatar": $.cloudinary.url(result[0].public_id, options)
                        }
                    });
                }
            });
    },

    render() {
        var styles = {
            avatar: {
                width: this.props.width + 'px',
                height: this.props.height + 'px',
                lineHeight: this.props.height + 'px',
                textAlign: 'center',
                border: '1px solid #ddd',
                backgroundColor: '#eee',
                backgroundImage: `url(${this.data.user.profile.avatar})`,
                backgroundSize: 'cover'
            },

            uploadOverlay: {
                width: this.props.width + 'px',
                height: this.props.height + 'px',
                lineHeight: this.props.height + 'px',
                textAlign: 'center',
                background: 'rgba(0, 0, 0, 0.4)',
                color: '#fff'
            }
        };
        var uploadContent = null;
        if (this.props.upload && this.data.user) {
            // change
            if (this.data.user.profile.avatar) {
                if (this.state.hover) {
                    uploadContent = (
                        <div style={styles.uploadOverlay} className="animated fadeIn img-circle">
                            <button className="btn btn-xs btn-outline btn-white" onClick={this.openUploadWidget}>
                                <i className="fa fa-camera"></i>&nbsp;
                                change
                            </button>
                        </div>
                    )
                }
            } else {
                uploadContent = (
                    <button className="btn btn-xs btn-outline btn-primary" onClick={this.openUploadWidget}>
                        <i className="fa fa-camera"></i>&nbsp;
                        upload
                    </button>
                )
            }
        }
        return (
            <div
                className="img-circle"
                style={styles.avatar}
                onMouseEnter={() => {this.setState({hover: true})}}
                onMouseLeave={() => {this.setState({hover: false})}}>
                {uploadContent}
            </div>
        );
    }
});