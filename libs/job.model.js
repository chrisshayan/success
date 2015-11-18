ESJob = Astro.Class({
    name: 'ESJob',
    fields: {
        companyId: {
            type: 'number',
            default: 0
        },
        jobId: {
            type: 'number',
            default: 0
        },
        skills: {
            type: 'array',
            default: () => []
        },
        cities: {
            type: 'array',
            default: () => []
        },
        jobTitle: {
            type: 'string',
            default: ''
        },
        approvedDate: {
            type: 'date',
            default: 0
        },
        expiredDate: {
            type: 'date',
            default: 0
        },
        type: {
            type: 'string',
            default: 'online'
        },
        extra: {
            type: 'object'
        }
    }
});