Meteor.publishComposite('userData', function(){
    if(!this.userId) return null;
    var self = this;
    return {
        find: function() {
            return Meteor.users.find({_id: self.userId}, {limit: 1});
        },
        children: [
            {
                find: function(user) {
                    var company = user.defaultCompany();
                    return Collections.CompanySettings.find({companyId: company.companyId || null}, {limit: 1});
                }
            }, {
                find: function(user) {
                    return Meteor.hiringTeam.find({userId: user._id});
                }
            }
        ]
    };
});