/**
 * Created by HungNguyen on 8/21/15.
 */


/**
 * Created by HungNguyen on 8/21/15.
 */


var publications = {
    currentJobCriteria: function (_id) {
        if (!_id) return null;
        return Collection.find({_id: _id});
    }
};


Meteor.publish('currentJobCriteria', publications.currentJobCriteria);


