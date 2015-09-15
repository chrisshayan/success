/**
 * Created by HungNguyen on 8/21/15.
 */


//var model = BaseModel.extendAndSetupCollection('company');
var model = BaseModel.extendAndSetupCollection('companies');

Collection = model.collection;

model.prototype.user = function (options) {
    if (this.companyId == void 0) return [];
    UserApi.methods.find({companyId: this.companyId}, options || {}).fetch();
};

model.appendSchema({
    companyId: {
        type: Number
    },
    vnwData: {
        type: Object,
        blackbox: true
    },
    'vnwData.$.comanyid': {
        type: String,
        optional: true
    },
    companyName: {
        type: String
    },
    companyAddress: {
        type: String
    },
    contactName: {
        type: String
    },
    phone: {
        type: Number,
        optional: true
    },
    cell: {
        type: Number,
        optional: true
    },
    fax: {
        type: Number
    },
    email: {
        type: String
    }, //mailSignature: {type: String, optional: true},
    createdBy: {
        type: String
    }, // userId first Login
    createdAt: {
        type: Date
    },
    updatedAt: {
        type: Date
    }
});

Company = model;