/**
 * Created by HungNguyen on 8/21/15.
 */

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
                if(!options) options = {};
                if(!options['limit']) options['limit'] = 10;
                options['limit'] += 1;
                return Collection.find(filters, options);
            },
            children: [
                {
                    /**
                     * publish creator info
                     */
                    find(activity = {}) {
                         if(activity && activity.createdBy) {
                             return Meteor.users.find({_id: activity.createdBy}, {fields: USER_FIELDS});
                         }
                        return null;
                    }
                }
            ]
        }
    }
};

_.each(publications, function(func, name) {
    Meteor.publishComposite(name, func);
});


