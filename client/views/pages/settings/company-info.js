Template.companyInfoForm.helpers({
   data: function() {
       return Collections.Companies.findOne();
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