/**
 * Created by HungNguyen on 8/21/15.
 */

const {
    APPLICATION_CREATE,
    APPLICATION_STAGE_UPDATE,
    RECRUITER_CREATE_COMMENT,
    RECRUITER_CREATE_EMAIL,
    RECRUITER_DISQUALIFIED,
    RECRUITER_REVERSE_QUALIFIED,
    RECRUITER_SCHEDULE,
    RECRUITER_SCORE_CANDIDATE
    } = ACTIVITY_TYPE;

const USER_FIELDS = {
    username: 1,
    emails: 1,
    profile: 1,
    companyId: 1,
    roles: 1
};

var publications = {
    activities: function (filters, options) {
        if (!this.userId) return this.ready();
        return {
            find: function () {
                if (!options) options = {};
                if (!options['limit']) options['limit'] = 10;
                options['limit'] += 1;
                return Collection.find(filters, options);
            },
            children: [
                {
                    /**
                     * publish users referenced
                     */
                        find(activity = {}) {
                        if (activity) {
                            const userIds = [];
                            if (activity['createdBy']) userIds.push(activity['createdBy']);

                            switch (activity.type) {
                                case RECRUITER_SCHEDULE:
                                    if (!_.isEmpty(activity['content']['interviewers'])) {
                                        _.each(activity['content']['interviewers'], (id) => userIds.push(id));
                                    }
                                    break;
                            }
                            return Meteor.users.find({_id: {$in: userIds}}, {fields: USER_FIELDS});
                        }
                        return null;
                    }
                }
            ]
        }
    }
};

_.each(publications, function (func, name) {
    Meteor.publishComposite(name, func);
});


