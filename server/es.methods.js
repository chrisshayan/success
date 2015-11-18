var ESSearch = Meteor.wrapAsync(function (query, cb) {
    ES.search(query).then(function (body) {
        cb(null, body)
    }, function (error) {
        cb(error, {});
    });
});

var methods = {};
methods.jobListCount = function () {
    let counter = {
        online: 0,
        expired: 0
    };
    if(this.userId) {
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
                if(aggs['online'] && aggs['online']['doc_count']) {
                    counter['online'] = aggs['online']['doc_count'];
                }

                if(aggs['expired'] && aggs['expired']['doc_count']) {
                    counter['expired'] = aggs['expired']['doc_count'];
                }
            }
        } catch (e) {
            console.trace(e);
        }
    }
    return counter;
};

Meteor.methods(methods);