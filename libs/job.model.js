ESJob = Astro.Class({
    name: 'ESJob',
    fields: {
        companyId: {
            type: 'number',
            default() {
                return 0;
            }
        },
        companyName: {
            type: 'string',
            default() {
                return '';
            }
        },
        companyDesc: {
            type: 'string',
            default() {
                return '';
            }
        },

        jobId: {
            type: 'number',
            default() {
                return 0;
            }
        },

        cities: {
            type: 'array',
            default() {
                return [];
            }
        },

        jobTitle: {
            type: 'string',
            default() {
                return '';
            }
        },

        jobDescription: {
            type: 'string',
            default() {
                return '';
            }
        },

        skillExperience: {
            type: 'string',
            default() {
                return '';
            }
        },

        salaryMin: {
            type: 'number',
            default() {
                return 0;
            }
        },

        salaryMax: {
            type: 'number',
            default() {
                return 0;
            }
        },

        emailAddress: {
            type: 'string',
            default() {
                return '';
            }
        },

        approvedDate: {
            type: 'date',
            default() {
                return new Date();
            }
        },

        expiredDate: {
            type: 'date',
            default() {
                return new Date();
            }
        },

        skills: {
            type: 'array',
            default() {
                return [];
            }
        },

        industries: {
            type: 'array',
            default() {
                return [];
            }
        },

        jobLevel: {
            type: 'string',
            default() {
                return '';
            }
        },

        type: {
            type: 'string',
            default() {
                return 'online';
            }
        },

        numOfApplications: {
            type: 'number',
            default() {
                return 0;
            }
        },

        extra: {
            type: 'object'
        }
    },

    methods: {
        cityLabel() {
            const cities = _.pluck(this.cities, 'name');
            return cities.join(', ');
        },

        expiredAt() {
            const d = new moment(this.expiredDate);
            return d.isValid() ? d.format('DD/MM/YYYY') : '';
        },

        jobUrl() {
            const params = {
                jobId: this.jobId,
                stage: 'applied'
            };
            return Router.url('Job', params);
        }
    }
});