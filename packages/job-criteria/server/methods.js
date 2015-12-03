/**
 * Created by HungNguyen on 8/21/15.
 */

var criteriaSuggestion = JobCriteriaSuggestion.collection;


var methods = {
    getRecommendCriteria(jobId) {
        const Collection = JobCriteriaSuggestion.collection;
        const results = {
            skills: [],
            personalityTraits: [],
            qualifications: [],
            details: []
        };

        Collection.find({templateName: 'personalityTraits'}, {limit: 10}).map(function (doc) {
            results.personalityTraits.push({
                id: doc._id,
                text: doc.keyword
            });
        });

        Collection.find({templateName: 'qualifications'}, {limit: 10}).map(function (doc) {
            results.qualifications.push({
                id: doc._id,
                text: doc.keyword
            });
        });

        Collection.find({templateName: 'details'}, {limit: 10}).map(function (doc) {
            results.details.push({
                id: doc._id,
                text: doc.keyword
            });
        });

        return results;
    },

    addJobCriteria(jobId, cate, name) {
        if (!this.userId || typeof name !== 'string' || typeof cate !== 'string') return false;
        name = name.toLowerCase().trim();
        this.unblock();
        var Collection = JobExtra.getCollection();
        var extra = Collection.findOne({jobId: jobId});

        if (!extra) return false;

        if (!criteriaSuggestion.findOne({templateName: cate, keyword: name})) {
            Meteor.defer(function () {
                var newItem = new JobCriteriaSuggestion();
                newItem.templateName = cate;
                newItem.keyword = name;
                newItem.save();
            });
        }

        extra.push(`hiringCriteria.${cate}.criteria`, name);
        return extra.save();
    },

    removeJobCriteria(jobId, cate, name) {
        if (!this.userId) return false;

        this.unblock();
        var Collection = JobExtra.getCollection();
        var extra = Collection.findOne({jobId: jobId});
        if (!extra) return false;
        var category = `hiringCriteria.${cate}.criteria`;
        var pullMod = {};
        pullMod[category] = name;
        return Collection.update({_id: extra._id}, {$pull: pullMod});
    },

};

Meteor.methods(methods);
