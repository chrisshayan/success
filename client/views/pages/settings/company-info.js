Template.companyInfoForm.helpers({
   data: function() {
       return Collections.Companies.findOne();
   },
    companyLogo: function() {
        return this.logo;
    },
    name: function() {
        return this.data.companyname;
    },
    address: function() {
        return this.data.address;
    },
    phone: function() {
        return this.data.telephone;
    },
    cell: function() {
        return this.data.cellphone;
    },
    fax: function() {
        return this.data.faxnumber;
    },
    contact: function() {
        return {
            name: this.data.contactname || "",
            email: this.data.contactemail || ""
        }
    }
});

Template.companyInfoForm.events({
    'change #logo': function (e, tmpl) {
        var reader = new FileReader(); //create a reader according to HTML5 File API
        var self = this;
        reader.onload = function(event){

            Meteor.call('uploadCompanyLogo', reader.result, function(err, result) {

            });
        }
        reader.readAsDataURL(e.target.files[0])

    }
})