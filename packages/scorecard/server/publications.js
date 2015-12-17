/**
 * Created by HungNguyen on 8/21/15.
 */

var publications = {};

publications['scorecardSummary'] = function(cond = {}) {
    return {
        find() {
            return SummaryCollection.find(cond, {limit: 1, sort: {createdAt: -1}})
        }
    };
}

_.each(publications, (func, name) => {
    Meteor.publishComposite(name, func);
});


