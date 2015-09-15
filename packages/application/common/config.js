/**
 * Created by HungNguyen on 8/21/15.
 */


var CONFIG = {
    defaultActivitiesOptions: {
        fields: {
            entryId: 1,
            candidateId: 1,
            companyId: 1,
            jobId: 1,
            source: 1,
            stage: 1,
            matchingScore: 1,
            disqualified: 1,
            createdAt: 1,
            "data.appSubject": 1,
            "data.coverletter": 1,
            "data.resumeid": 1
        }
    },
    defaultPublishOptions: {
        fields: {
            entryId: 1,
            candidateId: 1,
            companyId: 1,
            jobId: 1,
            source: 1,
            stage: 1,
            matchingScore: 1,
            disqualified: 1,
            createdAt: 1,
            "data.appSubject": 1,
            "data.coverletter": 1,
            "data.resumeid": 1
        }
    }
};

Core.registerConfig('application', CONFIG);