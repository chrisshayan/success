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

model.prototype.updateCompany = function (data, cb) {
    if (data == void 0 || typeof data === 'function') data = this;

    return Meteor.call('updateCompanyInfo', this, data, cb)
};


var obj = {
    companyId: 1,
    vnwData: {},
    companyName: 'test',
    companyAddress: 'hhhh',
    contactName: 'tessdsdst',
    cell: '120110010110',
    phone: '010202020202',
    fax: '00230203203',
    createdBy: 119191,
    updatedAt: new Date(),
    blah: 'blah'
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
        type: Date,
        defaultValue: new Date()
    },
    updatedAt: {
        type: Date,
        defaultValue: new Date()
    }
});

Company = model;