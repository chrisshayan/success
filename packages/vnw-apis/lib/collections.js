//Namespace Collections
Collections = {};

/**
 * Users is Employer
 */
Collections.Users = new Mongo.Collection("vnw_users");

/**
 * Collection Companies
 */
Collections.Companies = new Mongo.Collection("vnw_company_info");
// Company helpers
Collections.Companies.helpers({
    companyLogo: function() {
        return this.logo;
    },
    name: function() {
        return this.data.companyname;
    },
    address: function() {
        return this.data.address;
    },
    phone: function() {
        return this.data.telephone;
    },
    cell: function() {
        return this.data.cellphone;
    },
    fax: function() {
        return this.data.faxnumber;
    },
    contact: function() {
        return {
            name: this.data.contactname || "",
            email: this.data.contactemail || ""
        }
    }
});

Collections.ApplicationScores = new Mongo.Collection("vnw_application_scores");
Collections.CompanySettings = new Mongo.Collection("vnw_company_settings");

/**
 * Collection Jobs
 */
Collections.Jobs = new Mongo.Collection("vnw_jobs");
//Job Helpers
Collections.Jobs.helpers({
    title: function () {
        return this.data.jobtitle;
    },
    appliedCount: function () {
        return Collections.Applications.find({jobId: this.jobId, stage: 1}).count() || "-";
    },
    phoneScreenCount: function () {
        return Collections.Applications.find({jobId: this.jobId, stage: 2}).count() || "-";
    },
    interviewCount: function () {
        return Collections.Applications.find({jobId: this.jobId, stage: 3}).count() || "-";
    },
    offerCount: function () {
        return Collections.Applications.find({jobId: this.jobId, stage: 4}).count() || "-";
    },
    hiredCount: function () {
        return Collections.Applications.find({jobId: this.jobId, stage: 5}).count() || "-";
    },
    views: function () {
        return this.data.noofviewed;
    },
    expiry: function () {
        return moment(this.data.expireddate).format('DD MMM YYYY');
    },
    createdTimeago: function() {
        var distance = (new Date() - new Date(this.data.createddate)) / (24 * 60 * 60 * 1000);
        distance = Math.ceil(distance);
        if( distance > 7)
            return moment(this.data.createddate).format('DD MMM YYYY');
        return moment(this.data.createddate).fromNow();
    },
    link: function () {
        return '/jobtracking/' + this.jobId;
    }
});

/**
 * Collection Applications
 */
Collections.Applications = new Mongo.Collection("vnw_applications");

Collections.Applications.allow({
    update: function(userId, doc) {
        return !!userId;
    }
});

/**
 * Collection Candidate
 * Candidate is job seeker who applied job
 */
Collections.Candidates = new Mongo.Collection("vnw_candidates");


/**
 * Collection Activities
 */
Collections.Activities = new Mongo.Collection("vnw_activities");
// Activity helpers
Collections.Activities.helpers({
    actionIcon: function () {
        return " fa-retweet ";
    },
    actionIconBg: function () {
        return " lazur-bg ";
    },
    actionTitle: function () {
        switch (this.actionType) {
            case 1:
                var _tmpl = "<p>Candidate <b><%=candidateName%></b> was moved to <b><%=stageName%></b> </p>";
                _tmpl += '<p>Job <a href="<%=jobLink%>"><%=jobName%></a></p>';
                var template = _.template(_tmpl);
                var can = Collections.Candidates.findOne({userId: this.data.candidateId});
                var job = Collections.Jobs.findOne({jobId: this.data.jobId});
                var title = template({
                    candidateName: can.fullname(),
                    stageName: Recruit.APPLICATION_STAGES[this.data.toStage],
                    jobName: job.title(),
                    jobLink: job.link()
                });
                break;
            default:
                var title = "<h4>Hello world<h4>";
        }
        return title;
    },

    actionTimeAgo: function () {
        var liveupdate = Session.get('now');
        return moment(this.createdAt).fromNow();
    }

});


/**
 * Collection mail templates
 */
Collections.MailTemplates = new Mongo.Collection("vnw_mail_templates");
//Check permissions
Collections.MailTemplates.allow({
    insert: function (userId, doc) {
        if (userId)
            return true;
        return false;
    },
    update: function(userId, doc, fieldNames, modifier) {
        if (doc.createdBy == userId) {
            return true;
        }
        return false;
    },
    remove: function (userId, doc) {
        if (doc.type == 2) {
            if (doc.createdBy == userId) {
                return true;
            }
        }
        return false;
    }
})
if (Meteor.isServer) {
    Collections.MailTemplates.before.insert(function (userId, doc) {
        if(!userId) return;
        doc.createdAt = new Date();
        doc.modifiedAt = new Date();
        doc.createdBy = parseInt(userId);
        doc.modifiedBy = parseInt(userId);
    });

}

/**
 * MailTemplates helpers
 */
Collections.MailTemplates.helpers({
    fromStageTitle: function () {
        return Recruit.APPLICATION_STAGES[this.fromStage];
    },
    toStageTitle: function () {
        return Recruit.APPLICATION_STAGES[this.toStage];
    },
    isAllowRemove: function() {
        return this.type == 2;
    }
});
