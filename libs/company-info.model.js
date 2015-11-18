ESCompanyInfo = Astro.Class({
    name: 'ESCompanyInfo',
    fields: {
        companyId: {
            type: 'number',
            default: 0
        },
        companyLogoURL: {
            type: 'string',
            default: ''
        },
        companyName: {
            type: 'string',
            default: ''
        },
        companyProfile: {
            type: 'string',
            default: ''
        },
        address: {
            type: 'string',
            default: ''
        },
        contactName: {
            type: 'string',
            default: ''
        },
        contactEmail: {
            type: 'string',
            default: ''
        },
        website: {
            type: 'string',
            default: ''
        }
    }
});