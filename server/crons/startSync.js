/**
 * Created by HungNguyen on 7/24/15.
 */
var VNW_TABLES = Meteor.settings.tables,
    VNW_QUERIES = Meteor.settings.queries;


//Namespace to share methods to manual sync data from Vietnamworks
//SYNC_VNW = {};

var startQueue = new PowerQueue({
    isPaused: true
});


SYNC_VNW.syncNewLogin = function (user, callback) { // (userId, companyId) {
    //check(userId, Number);
    var companyId = user.companyId
        , userId = user.userId;

    var syncCompany = Meteor.wrapAsync(SYNC_VNW.syncCompany);

    var isNew = syncCompany(companyId);
    console.log('new company: ', isNew);

    if (isNew) {
        SYNC_VNW.syncJob(companyId, userId);
    }
    return isNew;
};