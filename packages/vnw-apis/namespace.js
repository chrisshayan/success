Success = {};

/**
 *
 * @type {{0: string, 1: string, 2: string, 3: string, 4: string, 5: string}}
 */
Success.APPLICATION_STAGES = {
    //0: {
    //    id: 0,
    //    alias: "sourced",
    //    label: "Sourced"
    //},
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
    }
};

/**
 * Initial data after first time user login
 * @param userId {Number}
 */
Success.initialEmployerData = function(userId, username, companyId) {
    check(userId, Number);
    check(username, String);

    if( Meteor.settings.private.hasOwnProperty('mailTemplates') ) {
        _.each(Meteor.settings.private.mailTemplates, function(tmpl) {
            var template = new Schemas.MailTemplate();
            template = _.extend(template, tmpl);
            template.type = 1;
            template.emailFrom = username;
            template.companyId =  companyId;
            template.modifiedBy = template.createdBy = userId;
            Collections.MailTemplates.insert(template);
        });
    }

}