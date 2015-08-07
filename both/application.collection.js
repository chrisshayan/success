/**
 * Created by HungNguyen on 8/7/15.
 */


/**
 * Created by HungNguyen on 8/7/15.
 */


Schemas.applicationSchema = new SimpleSchema({
    firstname: {
        type: String,
        label: "Company name"
    },
    lastname: {
        type: String,
        label: "Own by user"
    },
    jobId: {
        type: String
    },
    companyId: {
        type: String
    },
    coverLetter: {
        type: String,
        label: "cover letter"
    },
    lastSync: {
        type: Date,
        defaultValue: new Date()

    },
    createdAt: {
        type: Date,
        defaultValue: new Date()
    }

});


var collections = new Mongo.Collection("Application");
collections.attachSchema(Schemas.applicationSchema);

Collections.Applications = collections;


Meteor.methods({
    createApplication: function (inputObj) {
        inputObj = inputObj || {};
        var obj = {
            firstname: faker.name.firstName(),
            lastname: faker.name.lastName(),
            //jobId: ,
            //companyId: ,
            coverLetter: 'This is a test application'
        };

        _.extend(obj, inputObj);

        console.log('obj:', obj);
        Collections.Applications.insert(obj);
    }
});
