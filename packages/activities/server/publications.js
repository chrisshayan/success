/**
 * Created by HungNguyen on 8/21/15.
 */


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
            children: []
        }
    }
};

_.each(publications, function(func, name) {
    Meteor.publishComposite(name, func);
});


