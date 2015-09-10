/**
 * Created by HungNguyen on 9/3/15.
 */


_gaCategory = 'Success';

if (Meteor.isClient) {
    Utils = {
        trackEvent: function (actionName, info) {
            //add prefix for category
            if (typeof info !== 'object' || info == void 0)
                return false;

            info.category = [_gaCategory, info.category].join(':');
            analytics.track(actionName, info);
        },

        transformVNWId: function (id) {
            if (_.isNaN(+id))
                return id;
            return +id;
        }
    };
}


