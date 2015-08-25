/**
 * Created by HungNguyen on 8/21/15.
 */

Application.methods = {
    updateApplications: function (query, options) {
        return Collection.update(query, options || {});
    }
};