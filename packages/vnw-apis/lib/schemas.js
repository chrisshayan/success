Schemas = {};

Schemas.User = function() {
    return {
        userId: null,
        username: "",
        data: {},
        createdAt: new Date(),
        lastSyncedAt: new Date(),
        isSynchronizing: false
    }
};

Schemas.Job = function() {
    return {
        userId: null,
        jobId: null,
        data: {},
        createdAt: new Date(),
        lastSyncedAt: new Date()
    }
};

Schemas.Application = function() {
    return {
        entryId: null,
        userId: null,
        jobId: null,
        source: 1, // 1: is online, 2: sent directly
        stage: 1, // 1: applied, Default. 2: test assign, 3: Interview, 4: Offer letter, 5: Rejected
        data: {},
        createdAt: new Date(),
        lastSyncedAt: new Date()
    }
};


Schemas.Candidate = function() {
    return {
        userId: null,
        data: {},
        createdAt: new Date(),
        lastSyncedAt: new Date()
    }
};

Schemas.ApplicationScore = function() {
    return {
        entryId: null,
        data: {},
        createdAt: new Date(),
        lastSyncedAt: new Date()
    }
};

Schemas.MailTemplate = function() {
    return {
        name: "", // template name
        fromStage: null,
        toStage: null,
        type: 2, // 1: system (default), 2: user mail template
        emailFrom: "",
        subject: "",
        htmlBody: "",
        replyTo: "",
        createdAt: new Date(),
        createdBy: null,
        modifiedAt: new Date(),
        modifiedBy: null
    }
};

/**
 * Company info configuration
 * @returns Object
 */
Schemas.CompanySetting = function() {
    return {
        companyId: null,
        companyName: "",
        companyAddress: "",
        contactName: "",
        phone: "",
        cell: "",
        fax: "",
        emailFrom: "",
        emailReply: ""
    }
};

Schemas.Activity = function() {
    return {
        jobId: null,
        actionType: "",
        data: {}, // mixins data
        createdAt: new Date(),
        createdBy: null
    };
};