/**
 * Created by HungNguyen on 8/7/15.
 */


Schemas.companySchema = new SimpleSchema({
    companyId: {
        type: Number
    },
    companyName: {
        type: String,
        label: "Company name"
    },
    ownedByUsername: {
        type: String,
        label: "Own by user"
    },
    ownedByUserId: {
        type: Number
    },
    logo: {
        type: String,
        label: "company logo's url"
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


var collections = new Mongo.Collection("Company");
collections.attachSchema(Schemas.companySchema);

Collections.Company = collections;


Meteor.methods({
    createCompany: function (obj) {
        if (!obj) {
            obj = {};
            obj.companyId = faker.random.number({min: 0, max: 99999});
            obj.companyName = faker.company.companyName();
            obj.ownedByUsername = 'testuser'; //hard code here;
            obj.ownedByUserId = 9999; // hard code here
            obj.logo = faker.image.avatar();
        }

        console.log('obj:', obj);
        Collections.Company.insert(obj);
    }
});