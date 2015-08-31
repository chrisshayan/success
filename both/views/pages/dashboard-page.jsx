DashboardPage = React.createClass({
    render() {
        return (
            <div style={ {paddingBottom: "50px"} }>
                <JobsList
                    status={1}
                    title={"PUBLISHED JOBS"}
                    icon={"fa-cloud"}
                    emptyMsg={"There is no position here."}/>

                <JobsList
                    status={0}
                    title={"CLOSED JOBS"}
                    icon={"fa-archive"}
                    emptyMsg={"Positions that no longer accepting new applicants will appear here."}/>
            </div>
        );
    }
});