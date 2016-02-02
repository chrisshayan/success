JobExtra = Astro.Class({
    name: 'JobExtra',
    collection: new Mongo.Collection('job_extra'),
    fields: {
        companyId: {
            type: 'number',
            default() {
                return 0;
            }
        },
        jobId: {
            type: 'number',
            default() {
                return 0;
            }
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
            default() {
                return 'ready';
            } //syncing, ready , synced, syncfailed
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
        },
        isMigrated: {
            type: 'boolean',
            default(){
                return false;
            }
        }
    },

    methods: {
        link() {
            return Router.url('Job', {
                stage: 'applied',
                jobId: this.jobId
            })
        },

        totalApplicants() {
            let count = 0;
            _.each(_.toArray(this.stage), (n) => {
                if (n) count += n;
            });
            return count;
        }
    }
});

if (Meteor.isServer) {
    JobExtra.prototype.resetStages = function () {

        var appCollection = Application.getCollection();

        var pipeline = [
            {
                $match: {jobId: this.jobId}
            }
            , {
                $group: {
                    _id: '$stage',
                    count: {
                        $sum: 1
                    }
                }
            }, {
                $sort: {
                    _id: 1
                }
            }
        ];

        var updatedStages = new Array(6);

        appCollection.aggregate(pipeline).forEach(function (stage) {
            return updatedStages[stage._id] = stage.count;
        });

        var newStages = {
            sourced: updatedStages[0] || 0,
            applied: updatedStages[1] || 0,
            phone: updatedStages[2] || 0,
            interview: updatedStages[3] || 0,
            offer: updatedStages[4] || 0,
            hired: updatedStages[5] || 0

        };

        //var sum = _.sum(updatedStages);

        this.set('stage', newStages);
        //this.set('numOfApplications', sum);
        this.set('syncState', 'synced');
    };
}