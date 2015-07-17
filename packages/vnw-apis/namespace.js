Recruit = {};

/**
 *
 * @type {{1: string, 2: string, 3: string, 4: string, 5: string}}
 */
Recruit.APPLICATION_STAGES = {
    1: {
        id: 1,
        alias: "applied",
        label: "Applied"
    },
    2: {
        id: 2,
        alias: "phone",
        label: "Phone Screen"
    },
    3: {
        id: 3,
        alias: "interview",
        label: "Interview"
    },
    4: {
        id: 4,
        alias: "offer",
        label: "Offer"
    },
    5: {
        id: 5,
        alias: "hired",
        label: "Hired"
    },
};

/**
 * Initial data after first time user login
 * @param userId {Number}
 */
Recruit.initialEmployerData = function(userId, username) {
    check(userId, Number);
    check(username, String);

    if( Meteor.settings.private.hasOwnProperty('mailTemplates') ) {
        _.each(Meteor.settings.private.mailTemplates, function(tmpl) {
            var template = new Schemas.MailTemplate();
            template = _.extend(template, tmpl);
            template.type = 1;
            template.emailFrom = username;
            template.modifiedBy = template.createdBy = userId;
            Collections.MailTemplates.insert(template);
        });
    }

}