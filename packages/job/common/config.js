/**
 * Created by HungNguyen on 8/21/15.
 */


var CONFIG = {
    DEFAULT_GET_LATEST_JOB_OPTIONS: {
        fields: {
            jobId: 1,
            userId: 1,
            companyId: 1,
            createdAt: 1,
            isActive: 1,
            jobEmailTo: 1,
            "data.jobtitle": 1,
            "data.iscompleted": 1,
            "data.salarymin": 1,
            "data.salarymax": 1,
            "data.skillexperience": 1,
            "data.expireddate": 1
        }
    },
    DEFAULT_GETJOB_OPTIONS_VALUES: {limit: 10},
    DEFAULT_COUNTER_FIELDS: {fields: {_id: 1}},
    DEFAULT_JOB_OPTIONS: {
        fields: {
            jobId: 1,
            userId: 1,
            companyId: 1,
            "data.jobtitle": 1,
            "data.iscompleted": 1,
            "data.noofviewed": 1,
            "data.createddate": 1,
            "data.expireddate": 1
        }
    },
    DEFAULT_APPLICATION_OPTIONS: {
        entryId: 1,
        candidateId: 1,
        companyId: 1,
        jobId: 1,
        source: 1,
        stage: 1,
        matchingScore: 1,
        disqualified: 1,
        "data.createddate": 1,
        "data.appSubject": 1,
        "data.coverletter": 1
    },
    DEFAULT_CANDIDATE_OPTIONS: {
        _id: 1,
        userId: 1,
        "data.city": 1,
        "data.username": 1,
        "data.firstname": 1,
        "data.lastname": 1,
        "data.genderid": 1,
        "data.birthday": 1,
        "data.address": 1,
        "data.district": 1,
        "data.email1": 1,
        "data.homephone": 1,
        "data.cellphone": 1,
        "data.createddate": 1
    }
};

Core.registerConfig('job', CONFIG);
