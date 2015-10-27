Avatar = React.createClass({
    mixins: [ReactMeteorData],

    propTypes: {
        userId: React.PropTypes.string.isRequired,
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
        return {
            user: user,
            avatarId: user && user.profile.avatar ? user.profile.avatar : null
        };
    },

    openUploadWidget() {
        var self = this;
        var oldId = this.data.avatarId;
        cloudinary.openUploadWidget({
                cloud_name: 'pim',
                upload_preset: 'gcvsyt6b',
                multiple: false,
                cropping: 'server',
                cropping_aspect_ratio: '1',
                cropping_coordinates_mode: 'face',
                sources: ['local', 'url', 'camera'],
                resource_type: 'image',
                client_allowed_formats: ["png","gif", "jpeg", "jpg"]
            },
            function (error, result) {
                if (!error) {
                    Meteor.call('removeAvatar', oldId);
                    Meteor.users.update({_id: self.props.userId}, {
                        $set: {
                            "profile.avatar": result[0].public_id
                        }
                    });
                }
            });
    },

    getUrl() {
        var options = {
            format: 'jpg',
            width: this.props.width,
            height: this.props.height,
            crop: this.props.crop,
            quality: 100
        };
        return $.cloudinary.url(this.data.avatarId, options)
    },
    render() {
        var styles = {
            avatar: {
                width: this.props.width + 'px',
                height: this.props.height + 'px',
                lineHeight: this.props.height + 'px',
                textAlign: 'center',
                border: '1px solid #ddd',
                backgroundImage: `url(${this.getUrl()})`,
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
            if (this.data.avatarId) {
                if (this.state.hover) {
                    uploadContent = (
                        <div style={styles.uploadOverlay} className="animated fadeIn">
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
                style={styles.avatar}
                onMouseEnter={() => {this.setState({hover: true})}}
                onMouseLeave={() => {this.setState({hover: false})}}>
                {uploadContent}
            </div>
        );
    }
});