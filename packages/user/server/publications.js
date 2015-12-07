Meteor.publishComposite('userData', function(){
    if(!this.userId) return null;
    this.unblock();
    var self = this;
    return {
        find: function() {
            return Meteor.users.find({_id: self.userId});
        },
        children: [
            {
                find: function(user) {
                    if(!user) return null;
                    return Meteor.hiringTeam.find({ userId: user._id});
                }
            }
        ]
    };
});