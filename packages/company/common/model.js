/**
 * Created by HungNguyen on 8/21/15.
 */


var model = BaseModel.extendAndSetupCollection('company');

Collection = model.collection;

model.appendSchema({
    companyId: {type: Number},
    data: {type: Object, optional: true},
    companyName: {type: String},
    companyAddress: {type: String},
    contactName: {type: String},
    phone: {type: Number, optional: true},
    cell: {type: Number, optional: true},
    fax: {type: Number},
    email: {type: String},
    //mailSignature: {type: String, optional: true},
    createdAt: {type: Date},
    updatedAt: {type: Date}
});

Company.model = model;