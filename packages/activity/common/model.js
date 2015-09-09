/**
 * Created by HungNguyen on 8/21/15.
 */

var model = BaseModel.extendAndSetupCollection("activities");

Collection = model.collection;

model.appendSchema({
    typeId: {
        type: Number // 0 : user, 1 : company , 2 : jobId
    },
    action: {
        type: String
    },
    jobId: {
        type: String,
        optional: true
    },
    companyId: {
        type: String
    },
    content: {
        type: Object,
        blackbox: true
    },
    createdBy: {
        type: String
    },
    createdAt: {
        type: Date
    }

});

Activity.model = model;