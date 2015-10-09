/**
 * Created by HungNguyen on 8/21/15.
 */



var profile = new SimpleSchema({
    firstname: {
        type: String,
        optional: true
    },
    lastname: {
        type: String,
        optional: true
    }
});

Collection = Meteor.users;

User.appendSchema({
    emails: {
        type: [Object],
        // this must be optional if you also use other login services like facebook,
        // but if you use only accounts-password, then it can be required
        optional: true
    },

    "emails.$.address": {
        type: String,
        regEx: SimpleSchema.RegEx.Email
    },

    "emails.$.verified": {
        type: Boolean
    },

    emailSignature: {
        type: String,
        optional: true,
        defaultValue: ''
    },

    username: {
        type: String,
        optional: true
    },

    companyId: {
        type: Number,
        optional: true
    },

    vnwId: {
        type: Number,
        optional: true
    },

    vnwData: {
        type: Object,
        blackbox: true,
        optional: true
    },

    services: {
        type: Object,
        optional: true,
        blackbox: true
    },

    roles: {
        type: [String],
        optional: true
    },

    profile: {
        type: profile,
        optional: true
    },

    setupStep: {
        type: Number,
        defaultValue: 0 // 0: begin, -1: finish
    },

    createdAt: {
        type: Date
    }
});


Collection.allow({
    update: function (userId, doc, fieldNames, modifier) {
        var fieldNamesAllow = ['setupStep', 'profile'];
        return userId && doc._id === userId && _.difference(fieldNames, fieldNamesAllow).length === 0;
    }
});