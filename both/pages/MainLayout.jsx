MainLayout = React.createClass({
  render() {
    return (
      <div className="ibox-content">
        <Header />
        <main>{this.props.content}</main>
      </div>
    );
  }
});
