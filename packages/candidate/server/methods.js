/**
 * Created by HungNguyen on 8/21/15.
 */

Candidate.methods = {
    isExist: function (canId) {
        if (!canId) return false;
        return Collection.findOne({candidateId: canId});
    },
    updateCandidate: function (query, data) {
        if (!data || typeof data !== 'object') return;
        return Collection.update(query, data);
    }
};