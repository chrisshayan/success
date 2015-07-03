/**
 * @param state {String} hiring process state
 * @param total {Number} number of applications want to generate
 * @return {Array}
 */
var genApplications = function(state, total) {
    var items = [];
    _.each( _.range(total), function() {
        var _item = Fake.user();
        _item.state = state;
        _item.createdAt = moment(new Date()).subtract(_.sample( _.range(0, 10) ), 'DAY').format('DD.MM.YYYY');
        items.push( _item );
    });
    return items;
}

/**
 * Template jobTrackingBoard
 */
 Template.jobTrackingBoard.onRendered(function() {

     // Initialize sortable
     $(".sortable-list").sortable({
         connectWith: ".connectList"
     }).disableSelection();

 });

Template.jobTrackingBoard.helpers({
    appliedCan: function() {
        return genApplications('applied', 10);
    },
    testAssignCan: function() {
        return genApplications('test_assignment', 10);
    },
    interviewCan: function() {
        return genApplications('interview', 5);
    },
    rejectedCan: function() {
        return genApplications('rejected', 3);
    },
    offerCan: function() {
        return genApplications('offer', 10);
    },
});

/**
 * Template: Application
 */
Template.Application.helpers({
    stateLabel: function() {
        switch (this.state) {
            case 'applied':
                return 'info-element';
            break;
            case 'test_assignment':
                return 'info-element';
            break;
            case 'interview':
                return 'warning-element';
            break;
            case 'rejected':
                return 'danger-element';
            break;
            case 'offer':
                return 'success-element';
            break;
            default:
                return 'default-element'
        }

    }
});
