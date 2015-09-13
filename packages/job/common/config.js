/**
 * Created by HungNguyen on 8/21/15.
 */

var CONFIG = {
    defaultJobOptions: {
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
    }
};

Core.registerConfig('job', CONFIG);
