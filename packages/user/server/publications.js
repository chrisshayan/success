Meteor.publishComposite('userData', function(){
    if(!this.userId) return null;
    return {
        find: function() {
            return Meteor.users.find({_id: this.userId}, {limit: 1});
        },
        children: [
            {
                find: function(user) {
                    return Collections.CompanySettings.find({companyId: user.companyId || null}, {limit: 1});
                }
            }
        ]
    };
});