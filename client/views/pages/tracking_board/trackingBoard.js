/**
 * Template jobTrackingBoard
 */
Template.jobTrackingBoard.onRendered(function () {
    // Initialize sortable
    $(".sortable-list").sortable({
        connectWith: ".connectList",
        receive: function (e, ui) {
            var item = ui.item[0];
            var applicationId = $(item).data('application-id');
            var toStage = $(this).data('stage');

            if (applicationId && toStage) {
                Meteor.call('updateApplicationState', applicationId, toStage, function (err, result) {
                    if (err) throw err;
                    if( result.success ) {
                        Notification.success(result.msg);
                    } else {
                        Notification.error(result.msg);
                    }
                });
            }
        }
    }).disableSelection();


});

Template.jobTrackingBoard.helpers({
    appliedCan: function () {
        return Collections.Applications.find({stage: 1});
    },
    testAssignCan: function () {
        return Collections.Applications.find({stage: 2});
    },
    interviewCan: function () {
        return Collections.Applications.find({stage: 3});
    },
    rejectedCan: function () {
        return Collections.Applications.find({stage: 5});
    },
    offerCan: function () {
        return Collections.Applications.find({stage: 4});
    },
});

/**
 * Template: Application
 */
Template.Application.helpers({
    stateLabel: function () {
        switch (this.stage) {
            case 1:
            case 2:
                return 'info-element';
                break;
            case 3:
                return 'warning-element';
                break;
            case 5:
                return 'danger-element';
                break;
            case 4:
                return 'success-element';
                break;
            default:
                return 'default-element'
        }

    }
});
