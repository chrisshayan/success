/**
 * Created by HungNguyen on 8/21/15.
 */
var model = BaseModel.extendAndSetupCollection("jobs");
Collection = model.collection;

///*SimpleSchema.messages({
//
// xInvalid: "Max salary must greater than min salary"
//});*/

model.prototype.updateJob = function (data, cb) {
    if (data == void 0 || typeof data === 'function') data = this;
    console.log('modifier', this.createdAt, this.updatedAt);
    return Meteor.call('updateJob', this, data, cb);
};

model.prototype.isExist = function (condition) {
    var query = condition || {'source.jobId': this.source.jobId};
    return Collection.findOne(query);
};

model.appendSchema({
    companyId: {
        type: Number,
        optional: true
    },
    /*    jobId: {
     type: Number,
     optional: true
     },*/
    source: {
        type: Object,
        blackbox: true
    },

    title: {
        type: String,
        label: "Job Title",
        autoform: {
            placeholder: "Position Title"
        }
    },

    level: {
        type: String,
        optional: true,
        autoform: {
            type: "select2",
            firstOption: true,
            options: function () {
                var user = Meteor.user();
                var items = [{label: "Please select", value: ""}];
                var criteria = {
                    languageId: user ? user.language() : 2
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
                var user = Meteor.user();
                var criteria = {
                    languageId: user ? user.language() : 2
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
                var user = Meteor.user();
                var criteria = {
                    languageId: user ? user.language() : 2
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
        /*custom: function () {
         if (this.isSet) {
         if (this.value < this.field("salaryMin").value)
         return "salaryMaxInvalid";
         }
         },*/
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

    skills: {
        type: [String],
        optional: true,
        autoform: {
            type: "tags"
        }
    },
    tags: {
        type: [String],
        optional: true,
        autoform: {
            type: "tags"
        }
    },

    vnwData: {
        type: Object,
        blackbox: true,
        optional: true
    },

    status: {
        type: Number,
        defaultValue: 1, // 1: open (or publish or active), 0: close
        optional: true
    },
    recruiters: {
        type: [Object],
        blackbox: true,
        defaultValue: []
    },
    stages: {
        type: [Object],
        optional: true
    },

    createdAt: {
        type: Date,
        defaultValue: Date.now()
    },
    updatedAt: {
        type: Date,
        defaultValue: Date.now()
    },
    expiredAt: {
        type: Date,
        defaultValue: Date.now()
    },
    createdBy: {
        type: String,
        optional: true
    }
});

vnwJob = model;


/**
 * PERMISSIONS AND HOOKS
 */

Collection.allow({
    insert: function (userId, doc) {
        return !!userId;
    },
    update: function (userId, doc) {
        return !!userId && doc.createdBy === userId;
    },
    remove: function (userId, doc) {
        return !!userId && doc.createdBy === userId;
    }
});


/*
 Collection.before.insert(function (userId, doc) {
 doc.createdAt = doc.updatedAt = new Date();
 doc.createdBy = doc.updatedBy = userId;
 });

 Collection.before.update(function (userId, doc) {
 doc.updatedAt = new Date();
 doc.updatedBy = userId;
 });*/


if (Meteor.isServer) {
    Collection.after.insert(function (userId, doc) {
        Collection.update({_id: doc._id}, {
            $set: {
                stages: {
                    0: 0,
                    1: 0,
                    2: 0,
                    3: 0,
                    4: 0,
                    5: 0
                }
            }
        })
    });

}
