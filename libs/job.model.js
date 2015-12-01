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

        cities: {
            type: 'array',
            default: () => []
        },

        jobTitle: {
            type: 'string',
            default: ''
        },

        jobDescription: {
            type: 'string',
            default: ''
        },

        skillExperience: {
            type: 'string',
            default: ''
        },

        salaryMin: {
            type: 'number',
            default: 0
        },

        salaryMax: {
            type: 'number',
            default: 0
        },

        emailAddress: {
            type: 'string',
            default: 0
        },

        approvedDate: {
            type: 'date',
            default: 0
        },

        expiredDate: {
            type: 'date',
            default: 0
        },

        skills: {
            type: 'array',
            default: () => []
        },

        industries: {
            type: 'array',
            default: () => []
        },

        jobLevel: {
            type: 'string',
            default: () => ''
        },

        type: {
            type: 'string',
            default: 'online'
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