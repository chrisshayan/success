PageHeading = React.createClass({
    propsType: {
        title: React.PropTypes.string
    },
    render() {
        let breadcrumb = null;
        let style = {marginLeft: 0};
        if (this.props.breadcrumb) {
            breadcrumb = (
                <ol className="breadcrumb">
                    {this.props.breadcrumb.map((item, key) => {
                        if (key == this.props.breadcrumb.length - 1) {
                            return (
                                <li className="active" key={key}>
                                    <strong>{item.label}</strong>
                                </li>
                            );
                        } else {
                            return (
                                <li key={key}>
                                    <a href={item.route}>{item.label}</a>
                                </li>
                            );
                        }
                    })}
                </ol>
            );
        }
        return (
            <div className="row wrapper border-bottom white-bg page-heading hidden-print" style={style}>
                <div className="col-lg-6">
                    <h2>{this.props.title}</h2>
                    {breadcrumb}
                </div>

                <div className="col-lg-6">
                    <div className="title-action btn-mains">
                        {this.props.children}
                    </div>
                </div>
            </div>
        );
    }
});