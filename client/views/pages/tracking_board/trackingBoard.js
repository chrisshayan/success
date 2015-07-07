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
        return Collections.Applications.find({stage: 1});
    },
    testAssignCan: function() {
        return Collections.Applications.find({stage: 2});
    },
    interviewCan: function() {
        return Collections.Applications.find({stage: 3});
    },
    rejectedCan: function() {
        return Collections.Applications.find({stage: 5});
    },
    offerCan: function() {
        return Collections.Applications.find({stage: 4});
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
