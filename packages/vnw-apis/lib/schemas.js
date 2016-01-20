/**
 * Custom error message
 */
SimpleSchema.messages({
    required: "[label] is required",
    minString: "[label] must be at least [min] characters",
    maxString: "[label] cannot exceed [max] characters",
    minNumber: "[label] must be at least [min]",
    maxNumber: "[label] cannot exceed [max]",
    minDate: "[label] must be on or after [min]",
    maxDate: "[label] cannot be after [max]",
    badDate: "[label] is not a valid date",
    minCount: "You must specify at least [minCount] values",
    maxCount: "You cannot specify more than [maxCount] values",
    noDecimal: "[label] must be an integer",
    notAllowed: "[value] is not an allowed value",
    expectedString: "[label] must be a string",
    expectedNumber: "[label] must be a number",
    expectedBoolean: "[label] must be a boolean",
    expectedArray: "[label] must be an array",
    expectedObject: "[label] must be an object",
    expectedConstructor: "[label] must be a [type]",
    regEx: [
        {msg: "[label] failed regular expression validation"},
        {exp: SimpleSchema.RegEx.Email, msg: "[label] must be a valid e-mail address"},
        {exp: SimpleSchema.RegEx.WeakEmail, msg: "[label] must be a valid e-mail address"},
        {exp: SimpleSchema.RegEx.Domain, msg: "[label] must be a valid domain"},
        {exp: SimpleSchema.RegEx.WeakDomain, msg: "[label] must be a valid domain"},
        {exp: SimpleSchema.RegEx.IP, msg: "[label] must be a valid IPv4 or IPv6 address"},
        {exp: SimpleSchema.RegEx.IPv4, msg: "[label] must be a valid IPv4 address"},
        {exp: SimpleSchema.RegEx.IPv6, msg: "[label] must be a valid IPv6 address"},
        {exp: SimpleSchema.RegEx.Url, msg: "[label] must be a valid URL"},
        {exp: SimpleSchema.RegEx.Id, msg: "[label] must be a valid alphanumeric ID"}
    ],
    keyNotInSchema: "[key] is not allowed by the schema",

    /**
     * Custom error messages
     */
    movedStageNotAllowTheSame: "From stage and to stage are not allow the same.",
    mailTemplateAlreadyExists: "Mail template already exists",
    candidateExists: "This candidate is already applied"
});
Schemas = {};

Schemas.User = function () {
    return {
        userId: null, //
        companyId: null, //
        username: "",
        data: {},
        createdAt: new Date(),
        lastSyncedAt: new Date(),
        isSynchronizing: false
    }
};


Schemas.CompanyInfo = function () {
    return {
        companyId: null,
        logo: null,
        data: {},

        createdAt: new Date(),
        lastSyncedAt: new Date()
    }
};

Schemas.Job = function () {
    return {
        companyId: null,
        jobId: null,
        data: {},
        createdAt: new Date(),
        lastSyncedAt: new Date()
    }
};

Schemas.Application = function () {
    return {
        entryId: null,
        candidateId: null,
        companyId: null,
        jobId: null,
        source: 1, // 1: is online, 2: sent directly, 3: add manually
        stage: 1, // 1: applied, Default. 2: test assign, 3: Interview, 4: Offer letter, 5: Rejected
        matchingScore: 0,
        data: {},
        disqualified: false,
        createdAt: new Date(),
        modifiedAt: null,
        modifiedBy: null,
        fullname: null,
        lastSyncedAt: new Date(),
        isDeleted: 0
    }
};


Schemas.Candidate = function () {
    return {
        candidateId: null,
        data: {},
        createdAt: new Date(),
        lastSyncedAt: new Date()
    }
};

Schemas.ApplicationScore = function () {
    return {
        entryId: null,
        data: {},
        createdAt: new Date(),
        lastSyncedAt: new Date()
    }
};

Schemas.MailTemplate = function () {
    return {
        name: "", // template name
        type: 2, // 1: system (default), 2: user mail template
        emailFrom: "",
        subject: "",
        htmlBody: "",
        createdAt: new Date(),
        createdBy: null,
        modifiedAt: new Date(),
        modifiedBy: null
    }
};

/**
 * Company info configuration
 * @returns Object
 */
Schemas.CompanySetting = function () {
    return {
        companyId: null,
        data: null,
        companyName: "",
        companyAddress: "",
        contactName: "",
        phone: "",
        cell: "",
        fax: "",
        emailFrom: "",
        mailSignature: ""
    }
};

Schemas.Activity = function () {
    return {
        jobId: null,
        actionType: "",
        data: {}, // mixins data
        createdAt: new Date(),
        createdBy: null
    };
};


Schemas.Template = new SimpleSchema({
    name: {
        type: String,
        label: "Name",
        max: 200
    },
    type: {
        type: Number,
        defaultValue: 2, // 1: system (default), 2: user mail template
        autoform: {
            omit: true
        }
    },
    emailFrom: {
        type: String,
        label: "From",
        optional: true,
        regEx: SimpleSchema.RegEx.Email
    },
    subject: {
        type: String,
        label: "Subject",
        max: 500
    },
    htmlBody: {
        type: String,
        label: "Content",
        autoform: {
            afFieldInput: {
                type: "summernote",
                height: "250px",
                class: "editor"
            }
        }
    },
    createdAt: {
        type: Date,
        optional: true,
        autoform: {
            omit: true
        }
    },
    createdBy: {
        type: Number,
        optional: true,
        autoform: {
            omit: true
        }
    },
    modifiedAt: {
        type: Date,
        optional: true,
        autoform: {
            omit: true
        }
    },
    modifiedBy: {
        type: Number,
        optional: true,
        autoform: {
            omit: true
        }
    },
    companyId: {
        type: Number,
        autoform: {
            omit: true
        }
    }
});

Collections.MailTemplates.attachSchema(Schemas.Template);

Schemas.sendEmailCandidateForm = new SimpleSchema({
    to: {
        type: String,
        label: "To",
        autoform: {
            class: "mail-to",
            disabled: true
        }
    },
    template: {
        type: String,
        label: "Mail template",
        autoform: {
            type: "select",
            class: "mail-template-options",
            options: function () {
                return Collections.MailTemplates.find().map(function (r) {
                    return {
                        label: r.name,
                        value: r._id
                    };
                });
            }
        }
    },
    subject: {
        type: String,
        label: "Subject",
        autoform: {
            class: "mail-subject"
        }
    },
    content: {
        type: String,
        label: ""
    }

});

Schemas.addCommentCandidateForm = new SimpleSchema({
    content: {
        type: String,
        label: "",
        autoform: {
            type: "textarea",
            class: "form-control"
        }
    }
});

Schemas.CandidateSource = new SimpleSchema({
    firstName: {
        type: String,
        label: "First name",
        autoform: {
            label: false,
            placeholder: "First name (required)"
        }
    },
    lastName: {
        type: String,
        label: "Last name",
        autoform: {
            label: false,
            placeholder: "Last name (required)"
        }
    },
    headline: {
        type: String,
        label: "Headline",
        optional: true,
        autoform: {
            label: false,
            placeholder: "Headline"
        }
    },
    email: {
        type: String,
        label: "Email",
        regEx: SimpleSchema.RegEx.Email,
        optional: true,
        custom: function () {
            if (Meteor.isClient && this.isSet) {
                var self = this;
                var urlParams = Router.current().params;
                var checkData = {
                    jobId: urlParams._id,
                    email: this.value
                };

                Meteor.call("checkCandidateExists", checkData, function (err, result) {
                    if (err) throw err;
                    if (result)
                        Schemas.CandidateSource.namedContext("addCandidateForm").addInvalidKeys([{
                            name: "email",
                            type: "candidateExists"
                        }]);

                });
            }
        },
        autoform: {
            label: false,
            placeholder: "Email"
        }
    },
    phone: {
        type: Number,
        label: "Phone",
        optional: true,
        autoform: {
            label: false,
            placeholder: "Phone"
        }
    },
    source: {
        type: String,
        label: "Source",
        autoform: {
            type: "select",
            label: false,
            options: [
                {label: "Linkedin", value: "linkedin"},
                {label: "Google", value: "google"},
                {label: "Facebook", value: "facebook"},
                {label: "Jobstreet", value: "jobstreet"},
                {label: "ITViec", value: "itviec"},
                {label: "CareerBuilder", value: "careerbuilder"},
                {label: "CareerLink", value: "careerlink"},
                {label: "Other", value: "other"}
            ]
        }
    },
    otherSource: {
        type: String,
        optional: true,
        custom: function () {
            if (Meteor.isClient) {
                var val = this.value || "";
                if (this.field("source").value == "other" && val.trim().length <= 0) {
                    return "required";
                }
            }
        },
        autoform: {
            label: false,
            placeholder: "Other source"
        }
    },
    profileLink: {
        type: String,
        label: "Profile link",
        optional: true,
        regEx: SimpleSchema.RegEx.Url,
        autoform: {
            label: false,
            placeholder: "Profile link"
        }
    },
    comment: {
        type: String,
        label: "Comment",
        optional: true,
        autoform: {
            type: "textarea",
            label: false,
            placeholder: "Comment"
        }
    },
    skills: {
        type: [String],
        label: "Candidate skills",
        optional: true,
        autoform: {
            type: "tags",
            placeholder: "Candidate skills"
        }
    }
});

Schemas.skill = function () {
    return {
        skillId: Number,
        skillName: String
    }
};

Schemas.resume = function () {
    this.resumeId = null;
    this.resumeTitle = null;
    this.userId = null;
    this.fullName = null;
    this.highestDegreeId = null;
    this.mostRecentPosition = null;
    this.mostRecentEmployer = null;
    this.suggestedSalary = null;
    this.careerObjective = null;
    this.updatedAt = null;
    this.createdAt = null;
    this.emailAddress = null;
    this.cellphone = null;
    this.address = null;
    this.desireJobTitle = null;
    this.education = [];
    this.experience = [];
    this.reference = [];

};

Schemas.city = function () {
    this.languageId = null;
    this.id = null;
    this.country = null;
    this.name = null;
    this.order = null;
};

Schemas.degree = function () {
    this.languageId = null;
    this.id = null;
    this.highestDegreeName = null;
    this.highestDegreeOrder = null;
    this.weight = null;
    this.isExact = null;
};

SimpleSchema.messages({
    salaryMaxInvalid: "Max salary must greater than min salary"
});

Schemas.addJobForm = new SimpleSchema({
    /*companyId: {
     type: String,
     autoform: {
     type: 'select2',
     firstOption: true,
     options: function () {
     Meteor.call('getCompanyListByUser', function (err, results) {
     if (err) {
     console.error(err);
     return [];
     }
     if (results) {
     console.log('comp results : ', results);
     var a = results.map(function (comp) {
     return {
     label: comp.companyName,
     value: comp.companyId
     }
     });
     console.log(a);
     return a;
     }

     })
     }
     }
     },*/

    title: {
        type: String,
        label: "Job Title",
        autoform: {
            placeholder: "Position Title"
        }
    },

    level: {
        type: String,
        autoform: {
            type: "select2",
            firstOption: true,
            options: function () {
                var items = [{label: "Please select", value: ""}];
                var criteria = {
                    languageId: 2
                };
                var levels = Meteor.job_levels.find(criteria).map(function (doc) {
                    return {
                        label: doc.name,
                        value: doc._id
                    }
                });
                _.each(levels, function (i) {
                    items.push(i)
                });
                return items;
            }
        }
    },

    categories: {
        type: [String],
        autoform: {
            type: "select2",
            multiple: true,
            options: function () {
                var criteria = {
                    languageId: 2
                };
                var options = {
                    sort: {
                        order: 1
                    }
                };
                return Meteor.industries.find(criteria, options).map(function (doc) {
                    return {
                        label: doc.name,
                        value: doc._id
                    }
                });
            }
        }
    },

    locations: {
        type: [String],
        autoform: {
            type: "select2",
            multiple: true,
            options: function () {
                var criteria = {
                    languageId: 2
                };
                var options = {
                    sort: {
                        order: 1
                    }
                };
                return Meteor.cities.find(criteria, options).map(function (doc) {
                    return {
                        label: doc.name,
                        value: doc._id
                    }
                });
            }
        }
    },

    salaryMin: {
        type: Number,
        defaultValue: 0,
        autoform: {
            type: "select2",
            options: function () {
                var items = [];
                var salaryRange = [0, 500, 1000, 1500, 2000, 3000, 5000, 10000];
                _.each(salaryRange, function (salary) {
                    items.push({
                        label: salary,
                        value: salary
                    });
                });
                return items;
            }
        }
    },

    salaryMax: {
        type: Number,
        defaultValue: 500,
        custom: function () {
            if (this.isSet) {
                if (this.value < this.field("salaryMin").value)
                    return "salaryMaxInvalid";
            }
        },
        autoform: {
            type: "select2",
            options: function () {
                var items = [];
                var salaryRange = [500, 1000, 1500, 2000, 3000, 5000, 10000];
                _.each(salaryRange, function (salary) {
                    items.push({
                        label: salary,
                        value: salary
                    });
                });
                return items;
            }
        }
    },

    showSalary: {
        type: Boolean,
        optional: true,
        defaultValue: true,
        autoform: {
            type: "boolean-radios",
            trueLabel: "Yes",
            falseLabel: "No"
        }
    },

    description: {
        type: String,
        autoform: {
            type: "textarea",
            rows: 7,
            cols: 30,
            placeholder: "Enter your description here"
        }
    },

    requirements: {
        type: String,
        autoform: {
            type: "textarea",
            rows: 7,
            cols: 30,
            placeholder: "Enter your requirements here"
        }
    },

    benefits: {
        type: String,
        optional: true,
        autoform: {
            type: "textarea",
            rows: 7,
            cols: 30,
            placeholder: "Enter benefits"
        }
    },

    tags: {
        type: [String],
        optional: true,
        autoform: {
            type: "tags",
            afFieldInput: {
                placeholder: "Click to add tag"
            }
        }
    }
});