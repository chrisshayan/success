/**
 * Created by HungNguyen on 8/21/15.
 */


var methods = {
    addCandidate: function (data, jobId) {
        console.log('jid', jobId, this.userId);

        try {
            if (!this.userId) return false;
            check(data, Object);
            check(jobId, Match.Any);

            //var isCandidateExists = false;
            //var user = Meteor.users.findOne({_id: this.userId});
            //var company = user.defaultCompany();
            //var job = Collections.Jobs.findOne({_id: jobId});
            var job = Meteor['jobs'].findOne({_id: jobId});
            if (!job) return false;


            var email = (typeof data.email === 'string' && data.email.trim() != '') ? data.email.trim() : '';

            var criteria = {
                jobId: job.jobId,
                "candidateInfo.emails": data.email
            };
            var options = {
                limit: 1
            };
            var isAppExists = Meteor.applications.find(criteria, options).count() > 0;
            if (isAppExists) return false;

            //if (!isCandidateExists) {
            //can = new Schemas.Candidate();
            var can = new Candidate();
            can.username = email;

            can.source = {
                sourceId: 1
            };

            can.firstname = data.firstname || data.firstName;
            can.lastname = data.lastname || data.lastName;
            can.email = email;
            can.data = data;
            can.createdAt = new Date();

            can.save();
            console.log('can.source.candidateId', can.source.candidateId);
            if (can.source.candidateId == void 0) {
                can.source.candidateId = can._id;
                can.save();
            }

            console.log(can);
            //}

            //var application = new Schemas.Application();
            var application = new Application();
            application.source = {
                type: 3
            };

            application.stage = 0;
            application.companyId = job.companyId;
            application.jobId = job.jobId;
            application.candidateId = can._id;
            application.isDeleted = 0;
            application.jobId = jobId;
            application.data = {};
            var candidateInfo = {
                firstName: can.firstname || can.firstName || '',
                lastName: can.lastname || can.lastName || '',
                emails: [can.data.username, can.email],
                city: can.data.city || ''
            };
            candidateInfo['fullname'] = [candidateInfo.lastName, candidateInfo.firstName].join(' ');
            candidateInfo.emails = _.filter(candidateInfo.emails, (email) => email != void 0);
            application.candidateInfo = candidateInfo;
            application.save();

            //var appId = Meteor.applications.insert(application);
            application.source.entryId = application._id;

            //Meteor.applications.update({_id: appId}, {$set: {entryId: appId}});
            application.save();
            // Log applied activity
            var activity = new Activity();
            activity.companyId = job.companyId;
            activity.data = {
                applicationId: application._id,
                source: 3,
                userId: this.userId
            };
            activity.createdAt = application.createdAt;
            activity.createdBy = this.userId;
            activity.addCandidateToSourced();

            if (data.email) {
                Meteor.defer(function () {
                    try {
                        var apiUrl = process.env.VNW_API_URI + Meteor.settings.VNW_API.registerAccount;
                        var apiKey = process.env.VNW_API_KEY;
                        var result = Meteor.http.call(
                            "POST",
                            apiUrl, {
                                headers: {
                                    "content-type": "application/json",
                                    "Accept": "application/json",
                                    "content-md5": apiKey
                                },
                                data: {
                                    "email": data.email,
                                    "firstname": data.firstName,
                                    "lastname": data.lastName
                                }
                            }
                        );

                        var content = JSON.parse(result.content);
                        console.log("Add account vnw: ", content);
                    } catch (e) {
                        console.log("rest-api-failed", "Failed to call the REST api on VietnamWorks", e);
                    }
                })
            }

        } catch (e) {
            console.log('add candidate error');
            console.trace(e);
            return false;
        }
        return {candidateId: can._id};
    },
    checkCandidateExists: function (data) {
        check(data, {
            jobId: Match.Any,
            email: String
        });
        //var job = Collections.Jobs.findOne({_id: data.jobId});
        var job = Meteor['jobs'].findOne({_id: data.jobId});
        if (!job) return false;
        email = data.email.trim();

        var criteria = {
            jobId: job.source.jobId,
            "candidateInfo.emails": data.email
        };
        var options = {
            limit: 1
        };
        return Collection.find(criteria, options).count() > 0;
    }

};

Meteor.methods(methods);