// Set up login services
Meteor.startup(function() {
    // Add Facebook configuration entry
    ServiceConfiguration.configurations.update(
        { "service": "facebook" },
        {
            $set: {
                "appId": "572941299523006",
                "secret": "5e94b02871f63db6e154783273a55d05"
            }
        },
        { upsert: true }
    );

    // Add GitHub configuration entry
    ServiceConfiguration.configurations.update(
        { "service": "linkedin" },
        {
            $set: {
                "clientId": "75ysoxebubgit0",
                "secret": "978OjtvjoxU2l4tZ"
            }
        },
        { upsert: true }
    );
});