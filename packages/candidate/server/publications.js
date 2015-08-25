/**
 * Created by HungNguyen on 8/21/15.
 */


Candidate.publications = {
    getById: function (companyId, options) {
        return Collection.find({companyId: companyId}, options);
    },
    getByJobId: function (jobId, options) {
        return Collection.find({jobId: jobId}, options);
    },
    getAllCandidate: function (options) {
        return Collection.find({}, options);
    }
};