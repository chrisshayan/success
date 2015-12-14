/**
 * Created by HungNguyen on 8/21/15.
 */

var publications = {};

_.each(publications, (func, name) => {
    Meteor.publishComposite(name, func);
});


