/**
 * Created by HungNguyen on 7/24/15.
 */


var VNW_TABLES = Meteor.settings.tables,
    VNW_QUERIES = Meteor.settings.queries;

var getPoolConnection = Meteor.wrapAsync(function (callback) {
    pool.getConnection(function (err, connection) {
        callback(err, connection);
    });
});

var fetchVNWData = Meteor.wrapAsync(function (connection, query, callback) {
    connection.query(query, function (err, rows, fields) {
        if (err) throw err;
        callback(err, rows);
    });
});


SYNC_VNW.syncCompany = function (companyId, callback) {
    var isNew = false;
    console.log('id', companyId);
    if (companyId) {
        check(companyId, Number);
        var hasCompany = Collections.CompanySettings.findOne({companyId: companyId});
        if (!hasCompany) {
            isNew = true;
            var pullCompanyInfoSql = sprintf(VNW_QUERIES.pullCompanyInfo, companyId);

            var connection = getPoolConnection();

            var rows = fetchVNWData(connection, pullCompanyInfoSql);
            try {
                _.each(rows, function (row) {
                    var company = Collections.CompanySettings.findOne({companyId: row.companyid});

                    if (!company) {
                        company = new Schemas.CompanySetting();
                        company.logo = row.logo;
                        company.companyId = row.companyid;
                        company.data = row;
                        company.companyName = row.companyname;
                        company.companyAddress = row.address;
                        company.contactName = row.contactname;
                        company.phone = row.telephone;
                        company.cell = row.cellphone;
                        company.fax = row.faxnumber;
                        Collections.CompanySettings.insert(company);
                    } else {
                        if (company.data != row) {
                            Collections.CompanySettings.update(company._id, {
                                $set: {
                                    logo: row.logo,
                                    data: row,
                                    companyName: row.companyname,
                                    companyAddress: row.address,
                                    contactName: row.contactname,
                                    phone: row.telephone,
                                    cell: row.cellphone,
                                    fax: row.faxnumber,
                                    lastSyncedAt: new Date()
                                }
                            });
                        }
                    }
                });
                connection.release();
            } catch (e) {
                connection.release();
                callback(e);
            }
        }
    } else {
        //Sync all company?
    }
    callback(null, isNew);
};




