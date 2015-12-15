/**
 * Created by HungNguyen on 8/21/15.
 */

var appCollection = Application.getCollection();

var methods = {
    submitScoreCard: (data)=> {
        try {
            if (!this.userId || !data) return false;
            var user = this.user()
                , application = appCollection.findOne({
                appId: data.appId,
                type: data.type,
                jobId: data.jobId
            })
                , scoreCard = new ScoreCard();

            scoreCard.ref = {
                companyId: user.companyId,
                appId: data.appId,
                type: data.type,
                jobId: data.jobId,
                recruiterId: this.userId,
                candidateId: application.candidateId
            };

            if (!scoreCard.isExist()) return false;

            scoreCard.notes = {
                keyTakeAways: data.keyTakeAways,
                fitCompanyCulture: data.fitCompanyCulture
            };

            scoreCard.score_criteria = data.score_criteria;

            scoreCard.overall = data.overall;

            return scoreCard.save();
        } catch (e) {
            e.message = 'Submit scorecard error';
            console.trace(e);
            return false;
        }
    }, updateScoreCard: (id, data)=> {
        try {
            if (!this.userId) return false;
            var updateScoreCard = ScoreCardCollection.findOne({_id: id});

            if (!updateScoreCard || !data) return false;

            var modified = {
                notes: {
                    keyTakeAways: data.keyTakeAways || updateScoreCard.notes.keyTakeAways,
                    fitCompanyCulture: data.fitCompanyCulture || updateScoreCard.notes.fitCompanyCulture
                },
                score_criteria: data.score_criteria,
                overall: data.overall
            };

            _.extend(updateScoreCard, modified);

            return updateScoreCard.save();
        } catch
            (e) {
            e.message = 'Update scorecard error';
            console.trace(e);
            return false;
        }
    }
};

Meteor.methods(methods);
