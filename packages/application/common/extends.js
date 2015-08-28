/**
 * Created by HungNguyen on 8/24/15.
 */


Company.model.prototype.application = function (options) {
    if (this.companyId == void 0) return [];
    return Collection.find({companyId: this.companyId}, options || {}).fetch();
};

Job.model.prototype.application = function (options) {
    if (this.jobId == void 0) return [];
    return Collection.find({jobId: this.jobId}, options || {}).fetch();
};

Candidate.model.prototype.application = function (options) {
    if (this.candidateId == void 0) return [];
    return Collection.find({candidateId: this.candidateId}, options || {}).fetch();
};