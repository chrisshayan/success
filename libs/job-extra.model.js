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
            type: 'object',
            default() {
                return {
                    skills: {
                        order: 1,
                        name: 'Skills',
                        alias: 'skills',
                        criteria: []
                    },

                    personalityTraits: {
                        order: 2,
                        name: 'Personality Traits',
                        alias: 'personalityTraits',
                        criteria: []
                    },

                    qualifications: {
                        order: 3,
                        name: 'Qualifications',
                        alias: 'qualifications',
                        criteria: []
                    },

                    details: {
                        order: 4,
                        name: 'Details',
                        alias: 'details',
                        criteria: []
                    }
                };
            }
        },
        recruiters: {
            type: 'object',
            default() {
                return {
                    manager: [],
                    recruiter: []
                };
            }
        },
        syncState: {
            type: 'string',
            default: ()=> 'ready' //syncing, ready , synced, syncfailed
        },

        jobTitle: {
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
        numOfApplications: {
            type: 'number',
            default() {
                return 0;
            }
        }
    }
});