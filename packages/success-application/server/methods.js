/**
 * Created by HungNguyen on 8/21/15.
 */

var methods = {};
const {
    APPLICATION_CREATE,
    APPLICATION_STAGE_UPDATE,
    RECRUITER_CREATE_COMMENT,
    RECRUITER_CREATE_EMAIL,
    RECRUITER_DISQUALIFIED,
    RECRUITER_REVERSE_QUALIFIED,
    RECRUITER_SCHEDULE,
    RECRUITER_SCORE_CANDIDATE
    } = Activities.TYPE;

function replacePlaceholder(user, job, application, mail) {
    var valid = ["candidate_first_name", "position", "company", "mail_signature"];

    var replaces = {};
    var placeholders = mail.body.match(/\[\[(\w+)\]\]/gi);
    _.each(placeholders, function (p) {
        p1 = p.replace(/\[\[|\]\]/g, "");
        if (_.indexOf(valid, p1) >= 0) {
            if (replaces.hasOwnProperty(p)) return;
            switch (p1) {
                case "candidate_first_name":
                    replaces[p1] = application.firstname;
                    break;

                case "position":

                    replaces[p1] = job.jobTitle;
                    break;

                case "company":
                    replaces[p1] = job.companyName;
                    break;
                case "mail_signature":
                    replaces[p1] = user.emailSignature || '';
                    break;
            }
        }
    });

    _.templateSettings = {
        interpolate: /\[\[(.+?)\]\]/g
    };
    var template = _.template(mail.body);
    mail.body = template(replaces);

    return mail;
}

methods.applicationStageCount = function (jobId, stageId) {

    this.unblock();
    var result = {
        qualify: 0,
        disqualified: 0
    };
    if (this.userId && jobId && stageId !== null) {
        const stage = Success.APPLICATION_STAGES[stageId],
            AppCollection = Application.getCollection(),
            cond = {jobId: jobId, stage: stageId},
            cond1 = {disqualified: {$nin: [stage.alias]}},
            cond2 = {disqualified: stage.alias};

        result['qualify'] = AppCollection.find({...cond, ...cond1}).count();
        result['disqualified'] = AppCollection.find({...cond, ...cond2}).count();
    }
    return result;
};


/**
 * check job has application with specific stage
 * @param jobId
 * @param stage
 * @returns {boolean}
 */
methods.hasApplication = function (jobId, stage) {
    check(jobId, String);
    check(stage, Number);
    var jobCollection = JobExtra.getCollection();
    var job = jobCollection.findOne({_id: jobId});
    if (job) {
        return Collection.findOne({'source.jobId': job.source.jobId, stage: stage}, {
            sort: {
                createdAt: -1
            }
        });
    }
    return false;
};


methods['applications.toggleQualify'] = function (jobId = 0, appIds = [], stage = null, isQualified = null) {
    if (!this.userId || _.isEmpty(appIds) || stage === null || isQualified === null) return false;
    this.unblock();
    const userId = this.userId;

    _.each(appIds, (appId) => {
        const app = Application.findOne({jobId: jobId, appId: appId});
        if (app) {
            const selector = {_id: app._id};
            const modifier = {};
            const activity = new Activities({
                ref: {
                    companyId: app.companyId,
                    jobId: app.jobId,
                    appId: app.appId,
                    candidateId: app.candidateId
                },
                content: {
                    stage: _.findWhere(Success.APPLICATION_STAGES, {alias: stage})
                },
                createdBy: userId,
                createdAt: new Date()
            });

            if (isQualified === true) {
                modifier['$pull'] = {
                    disqualified: stage
                };

                activity.type = RECRUITER_REVERSE_QUALIFIED;
            } else {
                modifier['$push'] = {
                    disqualified: stage
                };

                activity.type = RECRUITER_DISQUALIFIED;
            }

            if (!_.isEmpty(modifier)) {

                const result = Collection.update(selector, modifier);
                if (result) {
                    Meteor.defer(() => {
                        activity.save();
                    });
                }
            }
        }
    });
    return true;
};


methods['applications.moveStage'] = function (appId, stage = null) {
    if (!this.userId || !_.isNumber(appId) || stage === null) return false;
    const userId = this.userId;
    const app = Collection.findOne({appId: appId});

    if (app) {
        const jobExtra = JobExtra.findOne({jobId: app.jobId});
        if (jobExtra) {
            const fromStage = Success.APPLICATION_STAGES[app.stage];
            const toStage = Success.APPLICATION_STAGES[stage];
            if (fromStage && toStage && fromStage.id != toStage.id) {
                app.set('stage', toStage.id);

                Meteor.defer(function () {
                    // update stage counter

                    jobExtra.inc({
                        [`stage.${fromStage.alias}`]: -1,
                        [`stage.${toStage.alias}`]: 1
                    });
                    jobExtra.save();
                });
                const result = app.save();
                if (result) {
                    Meteor.defer(function () {
                        const ref = {
                            companyId: app.companyId,
                            jobId: app.jobId,
                            appId: app.appId,
                            candidateId: app.candidateId
                        };
                        const content = {
                            from: fromStage,
                            to: toStage
                        };
                        new Activities({
                            type: Activities.TYPE.APPLICATION_STAGE_UPDATE,
                            ref: ref,
                            content: content,
                            createdBy: userId,
                            createdAt: new Date()
                        }).save();
                    });
                }
                return result;
            }
        }
    }
    return false;
};

function storeMention(type, typeId, text) {

}

methods['application.addComment'] = function (jobId = 0, appId = 0, text = '') {
    if (!this.userId) return false;
    check(jobId, Number);
    check(appId, Number);
    check(text, String);
    var userId = this.userId;
    var app = Application.findOne({jobId: jobId, appId: appId});
    if (!app) return false;
    const ref = {
        companyId: app.companyId,
        jobId: jobId,
        candidateId: app.candidateId,
        appId: appId
    };
    const content = {
        text: text
    };

    const activityId = new Activities({
        type: Activities.TYPE.RECRUITER_CREATE_COMMENT,
        ref: ref,
        content: content,
        createdBy: userId,
        createdAt: new Date()
    }).save();

    if (activityId) {
        Meteor.defer(function () {
            Mention.generateMentions(
                ref,
                Mention.TYPE.ACTIVITY_COMMENT,
                activityId,
                text,
                userId
            );
        });
    }
    return activityId;
};

methods['application.sendMessage'] = function (jobId = 0, appIds = [], data = {}) {
    if (!this.userId) return false;
    this.unblock();
    check(jobId, Number);
    check(appIds, [Number]);
    check(data, Object);

    const user = Meteor.users.findOne({_id: this.userId});
    const job = JobExtra.findOne({jobId: jobId});
    if (!user || !job) return false;

    Meteor.defer(() => {
        _.each(appIds, (appId) => {
            var app = Application.findOne({jobId: jobId, appId: appId});
            if (!app) return false;
            data = replacePlaceholder(user, job, app, data);

            Email.send({
                from: user.defaultEmail(),
                to: app.defaultEmail(),
                subject: data.subject,
                html: data.body
            });

            const ref = {
                companyId: app.companyId,
                jobId: jobId,
                candidateId: app.candidateId,
                appId: appId
            };

            new Activities({
                type: Activities.TYPE.RECRUITER_CREATE_EMAIL,
                ref: ref,
                content: data,
                createdBy: this.userId,
                createdAt: new Date()
            }).save();
        });
    });
    return true;
};

methods['application.scheduleInterview'] = function (jobId = 0, appId = 0, data = {}) {
    //Meteor.defer(() => {

    if (!this.userId) return false;
    this.unblock();
    check(jobId, Number);
    check(appId, Number);
    check(data, Object);

    const user = Meteor.users.findOne({_id: this.userId});
    const job = JobExtra.findOne({jobId: jobId});
    var app = Application.findOne({jobId: jobId, appId: appId});
    if (!user || !job || !app) return false;
    data = replacePlaceholder(user, job, app, data);

    let listRecruiters = job.recruiters.manager.concat(job.recruiters.recruiter).map(function (rec) {
        return rec.userId;
    });

    var diff = _.unique(_.difference(data.interviewers, listRecruiters));
    if (diff.length !== 0) {
        diff.forEach(function (recId) {
            let rec = Meteor.users.findOne({_id: recId});
            if (rec) {
                var itemInfo = {
                    userId: rec._id,
                    email: rec.defaultEmail(),
                    name: rec.fullname() || rec.username || rec.defaultEmail() || ''
                };
                job.push('recruiters.recruiter', itemInfo);
            }
        });

        job.save()
    }

    const ref = {
        companyId: app.companyId,
        jobId: jobId,
        candidateId: app.candidateId,
        appId: appId,
        type: app.type
    };

    const activityId = new Activities({
        type: Activities.TYPE.RECRUITER_SCHEDULE,
        ref: ref,
        content: data,
        createdBy: this.userId,
        createdAt: new Date()
    }).save();

    var attendees = [];
    attendees.push({
        cn: app.fullname,
        mailTo: app.defaultEmail(),
        partStat: "NEEDS-ACTION",
        _id: null
    });

    _.each(data.interviewers, function (id) {
        var u = Meteor.users.findOne({_id: id});
        if (u) {
            var uName = u.fullname() || u.defaultEmail();
            attendees.push({
                cn: uName,
                mailTo: u.defaultEmail(),
                partStat: "NEEDS-ACTION",
                _id: id
            });
        }
    });

    var organizerName = user.fullname() || user.defaultEmail();
    var calOptions = {
        prodId: "//Vietnamworks//Success",
        method: "REQUEST",
        events: [
            {
                uid: activityId,
                summary: data.subject,
                location: data.location,
                dtStart: data.startTime,
                dtEnd: data.endTime,
                organizer: {cn: organizerName, mailTo: user.defaultEmail()},
                attendees: attendees
            }
        ]
    };
    var cal = new IcsGenerator(calOptions);


    Meteor.defer(()=> {
        try {
            Email.send({
                from: user.defaultEmail(),
                to: _.pluck(attendees, 'mailTo'),
                subject: data.subject,
                html: data.body,
                headers: {
                    "Content-class": "urn:content-classes:calendarmessage"
                },
                attachments: [
                    {
                        fileName: 'invite.ics',
                        contents: cal.toIcsString(),
                        contentType: 'text/calendar'
                    }
                ]
            });

            //create task
            attendees.splice(0, 1); //remove user's email

            var jobdata = {
                sender: user.defaultEmail(),
                subject: null,
                html: null,
                recruiters: attendees,
                ref: ref,
                timeRange: {
                    start: data.startTime,
                    end: data.endTime
                }
            };

            var estimateDate = new moment(data.scheduleDate).subtract(1, 'day')
                , now = new moment();

            var time = (estimateDate > now) ? estimateDate.toDate() : null;

            sJobCollections.addJobtoQueue('remindInterviewJob', jobdata, null, time);

        } catch (e) {
            console.log('Set Schedule failed');
            console.trace(e);

            Activities.remove({_id: activityId});

            return false;
        }
    });

    return activityId;
    //});

};

methods['application.updateAvatar'] = function (appId, appType, avatar) {
    const app = Application.findOne({appId: appId, type: appType});
    if (app) {
        app.set('avatar', avatar);
        return app.save();
    }
    return false;
};


Meteor.methods(methods);