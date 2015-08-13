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
    mailTemplateAlreadyExists: "Mail template is already exists",
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
        lastSyncedAt: new Date()
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
        custom: function() {
            if(Meteor.isClient && this.isSet) {
                var self = this;
                Meteor.call("checkCandidateExists", this.value, function(err, result) {
                    if(err) throw err;
                    if(result)
                        Schemas.CandidateSource.namedContext("addCandidateForm").addInvalidKeys([{name: "email", type: "candidateExists"}]);

                });
            } else {
                email = this.value;
                if(!email) return;
                var criteria = {
                    $or: [
                        {"data.username": email},
                        {"data.email": email},
                        {"data.email1": email},
                        {"data.email2": email}
                    ]
                };
                if(Collections.Candidates.find(criteria).count() > 0) {
                    return "exists";
                }
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
            if(Meteor.isClient) {
                var val = this.value || "";
                if(this.field("source").value == "other" && val.trim().length <= 0) {
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
}

