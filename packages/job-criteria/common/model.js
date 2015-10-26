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
