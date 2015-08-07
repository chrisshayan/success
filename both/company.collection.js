/**
 * Created by HungNguyen on 8/7/15.
 */


Collections.Companies = new Mongo.Collection("Companies");

Schemas.companySchema = new SimpleSchema({
    companyName: {
        type: String,
        label: "Company name"
    },
    ownedByUsername: {
        type: String,
        label: "Own by user",
        autoform: {
            omit: true
        }
    },
    ownedByUserId: {
        type: Number,
        autoform: {
            omit: true
        }
    },
    logo: {
        type: String,
        label: "company logo's url"
    },
    lastSync: {
        type: Date,
        defaultValue: new Date(),
        autoform: {
            omit: true
        }


    },
    createdAt: {
        type: Date,
        defaultValue: new Date(),
        autoform: {
            omit: true
        }
    }

});


Collections.Companies.attachSchema(Schemas.companySchema);


Meteor.methods({
    createCompany: function (inputObj) {
        inputObj = inputObj || {};

        var obj = {};
        //obj._id = companyId
        obj.companyName = faker.company.companyName();
        obj.ownedByUsername = 'testuser'; //hard code here;
        obj.ownedByUserId = 9999; // hard code here
        obj.logo = faker.image.avatar();

        _.extend(obj, inputObj);
        console.log('obj:', obj);

        Collections.Companies.insert(obj);
    }
})
;