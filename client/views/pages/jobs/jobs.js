Template.jobs.helpers({
    jobs: function(){
        var MOCK_JOBS = [];
        var job_status = ['Published', 'Closed', 'Draft'];
        _.each( _.range(25), function() {
            var job = {
                title: Fake.sentence(),
                status: _.sample(job_status),
                applied: _.random(100),
                createdAt: moment(new Date()).subtract(_.sample( _.range(0, 10) ), 'DAY').format('DD.MM.YYYY')
            };
            MOCK_JOBS.push( job );
        } );

        return MOCK_JOBS;
    },
});

Template.jobItem.onRendered(function() {
    this.$(".job-applied-chart").peity('line');
});

Template.jobItem.helpers({

    jobStatusLabel: function(){
        switch (this.status) {
            case 'Published':
                return 'label-primary';
            case 'Draft':
                return 'label-info';
            default:
                return "label-default"
        }
    }

})
