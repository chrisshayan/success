Recruit = {};

/**
 * Constant: Application stages
 * @type {{1: string, 2: string, 3: string, 4: string, 5: string}}
 */
Recruit.APPLICATION_STAGES = {
    1: "Applied",
    2: "Test assign",
    3: "Interview",
    4: "Offer letter",
    5: "Rejected"
};

/**
 * Initial data after first time user login
 * @param userId {Number}
 */
Recruit.initialEmployerData = function(userId) {
    check(userId, Number);
    var defaultMailTemplates = [
        {
            name: "From Applied to Test assign",
            fromStage: 1,
            toStage: 2,
            type: 1,
            emailFrom: "",
            subject: "From Applied to Test assign",
            htmlBody: "<h2>Test From Applied to Test assign</h2>"
        },{
            name: "From Test assign to Interview",
            fromStage: 2,
            toStage: 3,
            type: 1,
            emailFrom: "",
            subject: "From Test assign to Interview",
            htmlBody: "<h2>Test From Test assign to Interview</h2>"
        },{
            name: "From Interview to Offer letter",
            fromStage: 3,
            toStage: 4,
            type: 1,
            emailFrom: "",
            subject: "From Interview to Offer letter",
            htmlBody: "<h2>From Interview to Offer letter</h2>"
        },{
            name: "From Interview to Rejected",
            fromStage: 3,
            toStage: 5,
            type: 1,
            emailFrom: "",
            subject: "From Interview to Rejected",
            htmlBody: "<h2>From Interview to Rejected</h2>"
        },
    ];
    _.each(defaultMailTemplates, function(tmpl) {
        var template = new Schemas.MailTemplate();
        template = _.extend(template, tmpl);
        template.modifiedBy = template.createdBy = userId;
        Collections.MailTemplates.insert(template);
    });

    // 1: applied, Default. 2: test assign, 3: Interview, 4: Offer letter, 5: Rejected
}