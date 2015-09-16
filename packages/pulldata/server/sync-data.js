/**
 * Created by HungNguyen on 9/15/15.
 */

CRON_VNW = {};

var syncUser = function (userInfo) {
    var _user = Meteor.users.find({userId: userInfo.userid});

    if (!_user) {
        _user = new User();
    }
};

var queryCompany = function () {
    var pullCompanyInfoSql = sprintf(Utils.VNW_QUERIES.pullCompanyInfo, companyId);
    try {
        var rows = Utils.fetchVNWData(pullCompanyInfoSql);
        pullCompanies(rows);
    }
};


var pullCompanies = function (rows) {
    if (rows == void 0 || rows.length == 0) return;

    rows.forEach(function (row) {
        var company = Meteor['companies'].findOne({companyId: companyId});
        var updatedAt = Utils.formatDatetimeFromVNW(row.lastDateUpdated);
        var isUpdated = (Utils.parseTimeToString(company.updatedAt) === Utils.parseTimeToString(updatedAt));

        if (company && !isUpdated)
            return;

        if (!company)
            company = new Company();

        company.companyId = companyId;
        company.vnwData = row;
        company.companyName = row.companyname;
        company.companyAddress = row.address;
        company.contactName = row.contactname;
        company.phone = row.telephone;
        company.cell = row.cellphone;
        company.fax = row.faxnumber;
        company.email = Meteor.user().email;
        company.createdBy = Meteor.user().userId;
        company.updatedAt = updatedAt;

        if (isUpdated)
            company.save();
        else
            company.updateCompany();
    });

};


var queryJob = function () {

};


var pullJobs = function (rows, companyId) {
    if (rows == void 0 || rows.length == 0) return;
    rows.forEach(function (row) {
        var job = Meteor['jobs'].findOne({jobId: row.jobid});
        var updatedAt = Utils.formatDatetimeFromVNW(row.lastupdateddate);
        var isUpdated = (Utils.parseTimeToString(job.updatedAt) === Utils.parseTimeToString(updatedAt));

        if (job && !isUpdated)
            return;

        if (!job)
            job = new Job();

        job.companyId = companyId;
        job.title = row.jobtitle;
        job.jobId = row.jobid;
        job.level = row.joblevelid;
        job.categories = null;
        job.locations = 0;
        job.salaryMin = 0;
        job.salaryMax = 0;
        job.showSalary = 0;
        job.description = 0;
        job.requirements = 0;
        job.benefits = 0;
        job.skills = 0;
        job.vnwData = row;
        job.status = 0;
        job.createdAt = 0;
        job.createdBy = 0;
        job.updatedAt = 0;
        job.updatedBy = 0;


    })
};