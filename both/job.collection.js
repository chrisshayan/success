Locations = {
    0: "Select location",
    1: "Ho Chi Minh",
    2: "Ha Noi"
};

Schemas.Job = new SimpleSchema({
    title: {
        type: String
    },
    city: {
        type: String,
        autoform: {
            type: "select",
            options: Locations
        }
    },
    description: {
        type: String,
        autoform: {
            afFieldInput: {
                type: 'summernote',
                class: 'editor'
            }
        }
    },
    requirements: {
        type: String,
        autoform: {
            afFieldInput: {
                type: 'summernote',
                class: 'editor'
            }
        }
    },
    benifits: {
        type: String,
        autoform: {
            afFieldInput: {
                type: 'summernote',
                class: 'editor'
            }
        }
    },
    salaryMin: {
        type: Number,
        autoform: {}
    },
    salaryMax: {
        type: Number
    },
    tags: {
        type: [String],
        autoform: {
            type: "tags"
        }
    },
    createdAt: {
        type: Date,
        autoform: {
            omit: true
        }
    },
    createdBy: {
        type: String,
        regEx: SimpleSchema.RegEx.Id,
        autoform: {
            omit: true
        }
    },
    modifiedAt: {
        type: Date,
        autoform: {
            omit: true
        }
    },
    modifiedBy: {
        type: String,
        regEx: SimpleSchema.RegEx.Id,
        autoform: {
            omit: true
        }
    }
});

Collections.Jobs = new Mongo.Collection("jobs");
Collections.Jobs.attachSchema(Schemas.Job);
Collections.Jobs.allow({
    insert: function (userId, doc) {
        if (!userId) return false;
        return true;
    }
});
Collections.Jobs.before.insert(function (userId, doc) {
    doc.createdAt = new Date();
    doc.modifiedAt = new Date();
    doc.createdBy = doc.modifiedBy = userId;
});


Collections.Jobs.before.update(function (userId, doc) {
    doc.modifiedAt = new Date();
    doc.modifiedAt = userId;
});


