/**
 * JobCriteriaSetTemplate
 */
JobCriteriaSetTemplate = BaseModel.extendAndSetupCollection("job_criteria_set_templates");

JobCriteriaSetTemplate.appendSchema({
    companyId: {
        type: Number,
        optional: true
    },

    name: {
        type: String
    },

    hint: {
        type: String,
        optional: true
    },

    description: {
        type: String,
        optional: true
    }
});


/**
 * JobCriteriaSet
 */
JobCriteriaSet = BaseModel.extendAndSetupCollection("job_criteria_set");
JobCriteriaSet.appendSchema({
    templateId: {
        type: String,
        optional: true
    },
    companyId: {
        type: String,
        optional: true
    },

    jobId: {
        type: String
    },

    name: {
        type: String
    },

    hint: {
        type: String,
        optional: true
    },

    description: {
        type: String,
        optional: true
    }

});


/**
 * contains criteria of criteria set
 */
JobCriteria = BaseModel.extendAndSetupCollection("job_criteria");
JobCriteria.appendSchema({
    companyId: {
        type: Number
    },

    jobId: {
        type: String
    },

    criteriaSetId: {
        type: String
    },

    label: {
        type: String
    }

});

/**
 * contains criteria of criteria set
 */
JobCriteriaSuggestion = BaseModel.extendAndSetupCollection("criteria_suggestion");
var JCSCollection = JobCriteriaSuggestion.collection;
JobCriteriaSuggestion.appendSchema({
    templateName: {
        type: String
    },
    keyword: {
        type: String
    },
    weight: {
        type: Number,
        defaultValue: 0
    }
});

// do not insert if duplicate
if (Meteor.isServer) {
    JCSCollection.before.insert(function (userId, doc) {
        doc.keyword = doc.keyword.toLowerCase();
        return !(JCSCollection.findOne({
            templateId: doc.templateId,
            keyword: doc.keyword
        }));
    })
}