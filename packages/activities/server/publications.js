/**
 * Created by HungNguyen on 8/21/15.
 */


/*var publications = {
    lastApplications: function () {
        return {
            find: function () {
                if (!this.userId) return this.ready();
                filters = {
                    fields: {
                        userId: 1, companyId: 1
                    }
                };

                var user = Meteor['users'].findOne(+this.userId, filters);
                if (!user) return {};

                var filters = {
                    source: {$ne: 3},
                    companyId: user.companyId
                };

                var options = Candidate.methods.getConfig('defaultPublishOptions');
                options['limit'] = 10;
                options['sort'] = {
                    createdAt: -1
                };

                return Collection.find(filters, options);
            },
            children: [
                {
                    find: function (application) {
                        var cond = {
                            candidateId: application.candidateId
                        };
                        var options = Application.methods.getConfig('defaultPublishOptions');
                        options.limit = 1;
                        return Meteor['applications'].find(cond, options);
                    }
                }
            ]
        }
    }
};

Meteor.publishComposite('lastApplications', publications.lastApplications);*/
