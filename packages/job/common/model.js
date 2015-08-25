/**
 * Created by HungNguyen on 8/21/15.
 */

var model = BaseModel.extendAndSetupCollection("jobs");

Collection = model.collection;

model.appendSchema({
    jobId: {type: Number},
    companyId: {type: Number},
    jobEmailTo: {type: String},
    vnwData: {type: Object, optional: true},
    createdAt: {type: Date},
    updatedAt: {type: Date}

});

Job.model = model;