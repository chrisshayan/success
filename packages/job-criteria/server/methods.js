/**
 * Created by HungNguyen on 8/21/15.
 */


var methods = {
    addJobCriteria(jobId, cate, name) {
        if(!this.userId) return false;
        this.unblock();
        var Collection = JobExtra.getCollection();
        var extra = Collection.findOne({jobId: jobId});

        if(!extra) return false;
        extra.push(`hiringCriteria.${cate}.criteria`, name);
        return extra.save();
    },

    removeJobCriteria(jobId, cate, name) {
        if(!this.userId) return false;
        console.log('here')
        this.unblock();
        var Collection = JobExtra.getCollection();
        var extra = Collection.findOne({jobId: jobId});
        if(!extra) return false;
        var category = `hiringCriteria.${cate}.criteria`;
        var pullMod = {};
        pullMod[category] = name;
        return Collection.update({_id: extra._id}, {$pull: pullMod});
    },

};

Meteor.methods(methods);
