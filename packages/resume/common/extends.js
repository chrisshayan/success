/**
 * Created by HungNguyen on 8/28/15.
 */



Candidate.prototype.resume = function (options) {
    if (this.candidateId == void 0) return [];
    return Collection.find({candidateId: this.candidateId}, options || {}).fetch();
};


Application.prototype.resume = function (options) {
    if (this.resumeId == void 0) return [];
    return Collection.find({resumeId: this.resumeId}, options || {}).fetch();
};