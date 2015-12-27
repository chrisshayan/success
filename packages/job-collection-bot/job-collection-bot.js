// Write your package code here!


var SyncQueue = Collections.SyncQueue;


sJobCollections = (function () {
    return {
        registerJobs: function (name, jobProcessing, options) {
            if (typeof name !== 'string' || typeof jobProcessing !== 'function') return false;

            return SyncQueue.processJobs(name, options, jobProcessing);
        },
        addJobtoQueue: function (type, data, options) {
            if (typeof type !== 'string') return false;

            options = options || {
                    retries: 5,
                    wait: 1 * 60 * 1000
                };

            return Job(SyncQueue, type, data).retry(options).save();
        }
    }
})();