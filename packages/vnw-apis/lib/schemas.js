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