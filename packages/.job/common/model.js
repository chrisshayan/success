/**
 * Created by HungNguyen on 8/21/15.
 */

//var model = BaseModel.extendAndSetupCollection("jobs");
var model = BaseModel.extendAndSetupCollection("jobs");

Collection = model.collection;

var JobRecruiterSchema = new SimpleSchema({

    recruiterId: { // user id
        type: String,
        optional: true
    },

    email: {
        type: String
    },

    name: {
        type: String
    }
});

var SkillSchema = new SimpleSchema({
    skillId: {
        type: String,
        optional: true
    },
    text: {
        type: String
    }
});

model.appendSchema({

    jobId: {
        type: Number
    },

    companyId: {
        type: Number
    },

    title: {
        type: String
    },

    slug: {
        type: String
    },

    level: {
        type: String
    },

    categories: {
        type: [String]
    },

    locations: {
        type: [String]
    },

    recruiters: {
        type: [JobRecruiterSchema],
        optional: true
    },

    salaryMin: {
        type: Number,
        defaultValue: 0
    },
    salaryMax: {
        type: Number,
        defaultValue: 0
    },

    showSalary: {
        type: Boolean,
        defaultValue: true
    },

    description: {
        type: String
    },

    requirements: {
        type: String
    },

    befifits: {
        type: [String],
        optional: true
    },

    skills: {
        type: [SkillSchema],
        optional: true
    },

    vnwData: {
        type: Object,
        blackbox: true,
        optional: true
    },
    createdAt: {
        type: Date
    },
    createdBy: {
        type: String
    },
    updatedAt: {
        type: Date
    },
    updatedBy: {
        type: String
    }
});

Job = model;