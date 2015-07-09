/**
 * Recruit methods
 */
Meteor.methods({
    /**
     * Update application state
     * @param entryId {Number}
     * @param toStage {Number} in range 1,2,3,4,5
     * @returns {Boolean} the update result
     */
    updateApplicationState: function (entryId, toStage) {
        check(entryId, Number);
        check(toStage, Number);
        check(toStage, Match.OneOf(1, 2, 3, 4, 5));

        var result = {
            success: false,
            msg: "Update unsuccessful"
        };
        //check application is exists
        var application = Collections.Applications.findOne({entryId: entryId});
        if (!application) {
            result.msg = "Application not found";
            return result;
        }

        var data = {
            $set: {
                stage: toStage
            }
        }
        result.success = Collections.Applications.update(application._id, data);
        if (result.success) {
            var stages = {
                1: "Applied",
                2: "Test assign",
                3: "Interview",
                4: "Offer letter",
                5: "Rejected"
            };
            result.msg = "Moved to " + stages[toStage] + "  successfully";

            // Log activities
            var activity = new Activity();
            activity.data = {
                jobId: application.jobId,
                applicationId: application.entryId,
                candidateId: application.userId,
                fromStage: application.stage,
                toStage: toStage
            };
            activity.createdBy = Meteor.userId();
            activity.updateApplicationStage();
        }
        return result;
    },
    /**
     * Delete mail template
     * @param _id {String} Mongo id
     */
    deleteMailTemplate: function (_id) {
        check(_id, String);
        return Collections.MailTemplates.remove(_id);
    }
});