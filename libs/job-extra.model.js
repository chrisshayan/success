JobExtra = Astro.Class({
    name: 'JobExtra',
    collection: new Mongo.Collection('job_extra'),
    fields: {
        companyId: {
            type: 'number',
            default: 0
        },
        jobId: {
            type: 'number',
            default: 0
        },
        stage: {
            type: 'object',
            default() {
                return {
                    'sourced': 0,
                    'applied': 0,
                    'phone': 0,
                    'interview': 0,
                    'offer': 0,
                    'hired': 0
                };
            }
        },
        hiringCriteria: {
            type: 'array',
            default() {
                return [];
            }
        },
        recruiters: {
            type: 'array',
            default() {
                return [];
            }
        }
    }
});