/**
 * Created by HungNguyen on 8/21/15.
 */

var appCollection = Application.getCollection();

var methods = {
    submitScoreCard: function (data) {
        try {
            if (!this.userId || !data) return false;
            var user = Meteor.users.findOne({_id: this.userId})
                , application = appCollection.findOne({
                appId: data.appId,
                type: data.type,
                jobId: data.jobId
            })
                , scoreCard = new ScoreCard();

            if (!application) return false;

            scoreCard.set('ref', {
                companyId: user.companyId,
                appId: data.appId,
                type: data.type,
                jobId: data.jobId,
                recruiterId: this.userId,
                candidateId: application.candidateId
            });
            let existScoreCard = scoreCard.existScoreCard();
            if (existScoreCard) {
                scoreCard = scoreCard.existScoreCard();
                scoreCard.set('updatedAt', new Date());
            }

            scoreCard.set('notes', data.notes);
            scoreCard.set('score_criteria', data.criteria || []);
            scoreCard.set('overall', data.overall);

            return scoreCard.save();
        } catch (e) {
            //e.message = 'Submit scorecard error';
            console.trace(e);
            return false;
        }
    }
};

Meteor.methods(methods);


