/**
 * Created by HungNguyen on 8/21/15.
 */

Job.methods = {
    isExist: function (jobId) {
        if (jobId == void 0) return null;
        return (Collection.find({jobId: jobId}));
    },
    updateJob: function (query, data) {
        return !!(Collection.update(query, data));
    }
};

