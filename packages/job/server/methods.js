/**
 * Created by HungNguyen on 8/21/15.
 */

Job.methods = {
    updateJob: function (query, data) {
        return !!(Collection.update(query, data));
    }
};