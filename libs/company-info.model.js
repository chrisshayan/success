ESCompanyInfo = Astro.Class({
    name: 'ESCompanyInfo',
    fields: {
        companyId: {
            type: 'number',
            default() {
                return 0;
            }
        },
        companyLogoURL: {
            type: 'string',
            default() {
                return '';
            }
        },
        companyName: {
            type: 'string',
            default() {
                return '';
            }
        },
        companyProfile: {
            type: 'string',
            default() {
                return '';
            }
        },
        address: {
            type: 'string',
            default() {
                return '';
            }
        },
        contactName: {
            type: 'string',
            default() {
                return '';
            }
        },
        contactEmail: {
            type: 'string',
            default() {
                return '';
            }
        },
        website: {
            type: 'string',
            default() {
                return '';
            }
        }
    }
});