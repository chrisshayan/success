/**
 * Created by HungNguyen on 8/24/15.
 */


Candidate.prototype.applications = function (options) {
    if (this.source.candidateId == void 0) return [];
    return Collection.find({candidateId: this.source.candidateId}, options || {}).fetch();
};