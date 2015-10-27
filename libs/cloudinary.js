if (Meteor.isClient) {
    Meteor.startup(function () {
        $.cloudinary.config({
            cloud_name: "pim"
        });
    })
}

if (Meteor.isServer) {

    Meteor.methods({
        removeAvatar(publicId) {
            try {
                if (this.userId) {
                    check(publicId, String);
                    var user = Meteor.users.findOne({_id: this.userId});
                    if (user) {
                        var profile = user.profile;
                        if (profile && profile.avatar && profile.avatar == publicId) {
                            Cloudinary.api.delete_resources(publicId);
                            return true;
                        }
                    }
                }
            } catch (e) {
                return false;
            }
            return false;
        }
    });

    Meteor.startup(function () {
        Cloudinary.config({
            cloud_name: 'pim',
            api_key: '986997698754388',
            api_secret: 'o6cHTchepPpDDgIH-eEY74Er8lE'
        });

        Cloudinary.rules.delete = function () {
            return false
        }
    });

}