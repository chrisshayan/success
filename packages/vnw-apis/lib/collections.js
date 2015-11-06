CandidateTransform = function (doc) {
    _.extend(this, doc);
};

CandidateTransform.prototype = {
    constructor: CandidateTransform,

    fullname: function () {
        var data = this.data;
        var firstName = data.firstname || data.firstName || "";
        var lastName = data.lastname || data.lastName || "";
        return lastName + " " + firstName;
    },

    /**
     * get candidate city location
     * @returns {String}
     */
    city: function () {
        return this.data.city || this.source() || "";
    },

    /**
     * Get candidate phone: cellphone or homephone
     * @returns {String}
     */
    phone: function () {
        return this.data.cellphone || this.data.homephone || "";
    },

    skills: function () {
        return this.data.skills;
    },

    headline: function () {
        return this.data.jobtitle || this.data.headline;
    },

    source: function () {
        if (!this.data.source) return "";
        if (this.data.source == "other") return this.data.otherSource;
        return this.data.source;
    },

    email: function () {
        return this.data.email1 || this.data.email2 || this.data.username || this.data.email;
    }
};

ApplicationTransform = function (doc) {
    _.extend(this, doc);
};

ApplicationTransform.prototype = {
    constructor: ApplicationTransform,

    /**
     * Get 2 lines of cover letter
     * @returns {String}
     */
    shortCoverLetter: function () {
        if (!this.data.coverletter) return "";
        return this.data.coverletter.split(/\s+/).splice(0, 14).join(" ") + "...";
    },

    coverLetter: function () {
        var cover = '';
        if (this.data.coverletter) {
            cover = this.data.coverletter.replace(/(\r\n|\n)/gi, '<br/>');
            cover = cover.replace(/\<br\/\>\s?\<br\/\>/g, '<br/>');
        }
        return cover;
    },

    /**
     * Get matching score label
     * @returns {String}
     */
    matchingScoreLabel: function () {
        var matchingScore = this.matchingScore;
        if (matchingScore >= 90)
            return " label-success ";
        if (matchingScore >= 70)
            return " label-primary ";
        if (matchingScore >= 50)
            return " label-warning ";
        if (!matchingScore || matchingScore <= 0)
            return " hidden ";

        return " label-default ";
    },

    timeago: function () {
        return moment(this.createdAt).fromNow();
    },

    vnwProfileLink: function () {
        var queryParams = "";
        if (this.source == 3) {
            return "";
        } else if (this.source == 1) {
            queryParams = "?jobid=%s&appid=%s";
        } else {
            queryParams = "?jobid=%s&sdid=%s";
        }

        var url = Meteor.settings.public.applicationUrl;
        return url + sprintf(queryParams, this.jobId, this.entryId);
    },

    isSentDirectly: function () {
        return this.source === 2;
    },

    resumeFileUrl: function () {
        if (Meteor.isClient)
            link = "downloadresume/" + this.companyId + "/" + this._id + '/' + Session.get('cvToken');
        else link = '/';

        return Meteor.absoluteUrl(link);
    },


    link: function () {
        //var job = Collections.Jobs.findOne({jobId: this.jobId});
        if (!this.source.jobId) return Router.url('Job');
        var job = Meteor['jobs'].findOne({jobId: this.source.jobId});


        var params = {
            _id: job._id,
            stage: Success.APPLICATION_STAGES[this.stage].alias
        };
        var queryParams = {
            query: {
                application: this._id
            }
        };
        return Router.url('Job', params, queryParams)
    }
};


//Namespace Collections
Collections = {};
Collections.Users = new Mongo.Collection("vnw_users");

Collections.CompanySettings = new Mongo.Collection("vnw_company_settings");

Collections.Jobs = new Mongo.Collection("vnw_jobs", {
    //transform: function (doc) {
    //    if (!doc.hasOwnProperty("data") || !doc.data.hasOwnProperty("expireddate")) return doc;
    //
    //    var today = new Date(moment().format("YYYY-MM-DD 00:00:00")).getTime();
    //    var expired = new Date(doc.data.expireddate).getTime();
    //    if (expired >= today) {
    //        doc.status = 1;
    //    } else {
    //        doc.status = 0;
    //    }
    //    return doc;
    //}
});

Collections.Jobs.allow({
    update: function () {
        return true;
    }
});

function transformTags(userId, doc) {
    if (doc.tags) {
        var tags = [];
        _.each(doc.tags, function (t) {
            tags.push(t.toLowerCase());
        });
        doc.tags = tags;
    }
}

Collections.Jobs.before.insert(transformTags);
Collections.Jobs.before.update(transformTags);

function transformVNWId(id) {
    if (_.isNaN(+id))
        return id;
    return +id;
}

Collections.Candidates = new Mongo.Collection("vnw_candidates", {
    transform: function (doc) {
        return new CandidateTransform(doc);
    }
});


Collections.Applications = new Mongo.Collection("vnw_applications", {
    transform: function (doc) {
        return new ApplicationTransform(doc);
    }
});

Collections.Applications.allow({
    update: function (userId, doc) {
        return !!userId;
    }
});

if (Meteor.isServer) {
    Collections.Jobs.after.insert(function (userId, doc) {
        Collections.Jobs.update({_id: doc._id}, {
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

    Collections.Applications.after.insert(function (userId, doc) {
        var mod = {};
        mod['stages.' + doc.stage] = 1;
        Collections.Jobs.update({jobId: doc.jobId}, {
            $inc: mod
        });
    });

    Collections.Applications.after.update(function (userId, doc, fieldNames, modifier, options) {
        if (fieldNames.indexOf('stage') >= 0) {
            console.log("Move from: ", this.previous.stage)
            console.log("to: ", doc.stage);
            var mod = {};
            mod['stages.' + this.previous.stage] = -1;
            mod['stages.' + doc.stage] = 1;

            Collections.Jobs.update({jobId: doc.jobId}, {
                $inc: mod
            });
        }
    }, {fetchPrevious: true});
}


Collections.Activities = new Mongo.Collection("vnw_activities");

/**
 * Collection MailTemplates
 */
Collections.MailTemplates = new Mongo.Collection("vnw_mail_templates");
Collections.MailTemplates.allow({
    insert: function (userId, doc) {
        return (userId);
    },
    update: function (userId, doc, fieldNames, modifier) {
        return true;
    },
    remove: function (userId, doc) {

        return (doc.type == 2 && doc.createdBy == userId);
    }
});

/* synced once per day Colection */

Collections.SkillTerms = new Mongo.Collection("vnw_skills");
Collections.Cities = new Mongo.Collection('vnw_cities');
Collections.Degrees = new Mongo.Collection('vnw_degrees');


Collections.Resumes = new Mongo.Collection('vnw_resumes');

if (Meteor.isServer) {
    Collections.MailTemplates.before.insert(function (userId, doc) {
        if (!userId) return;
        doc.createdAt = new Date();
        doc.modifiedAt = new Date();
        doc.createdBy = parseInt(userId);
        doc.modifiedBy = parseInt(userId);
    });
}

if (Meteor.isClient) {
    // virtual collection for counter
    Collections.Counts = new Mongo.Collection("vnw_counts");
}