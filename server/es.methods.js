var ESSearch = Meteor.wrapAsync(function (query, cb) {
    ES.search(query).then(function (body) {
        cb(null, body)
    }, function (error) {
        cb(error, {});
    });
});

var methods = {};
methods.jobListCount = function () {
    const counter = {online: 0, expired: 0};
    if (this.userId) {
        try {
            const result = ESSearch({
                index: 'vietnamworks',
                type: 'job',
                from: 0,
                size: 0,
                body: SuccessESQuery.jobListCounter(751)
            });

            if (result && result['aggregations']) {
                const aggs = result['aggregations'];
                if (aggs['online'] && aggs['online']['doc_count']) {
                    counter['online'] = aggs['online']['doc_count'];
                }

                if (aggs['expired'] && aggs['expired']['doc_count']) {
                    counter['expired'] = aggs['expired']['doc_count'];
                }
            }
        } catch (e) {
            console.trace(e);
        }
    }
    return counter;
};


methods.getCompany = function (companyId) {
    Meteor._sleepForMs(1000)
    let companyInfo = new ESCompanyInfo();
    if (this.userId) {
        try {
            const result = ESSearch({
                index: 'employerInformation',
                type: 'company',
                from: 0,
                size: 1,
                body: SuccessESQuery.getCompanyInfo(751)
            });

            if (result && result['hits']) {
                const hits = result['hits']['hits'];
                if (hits.length > 0) {
                    const data = hits[0]['_source'];
                    companyInfo = new ESCompanyInfo(data);
                }
            }
        } catch (e) {
            console.trace(e);
        }
    }
    return companyInfo;
};

Meteor.methods(methods);