/**
 * Created by HungNguyen on 8/21/15.
 */
var mongoCollection = new Mongo.Collection(MODULE_NAME);
const {
    APPLICATION_CREATE,
    APPLICATION_STAGE_UPDATE,
    RECRUITER_CREATE_COMMENT,
    RECRUITER_CREATE_EMAIL,
    RECRUITER_DISQUALIFIED,
    RECRUITER_REVERSE_QUALIFIED,
    RECRUITER_SCHEDULE,
    RECRUITER_SCORE_CANDIDATE,
    RECRUITER_UPDATE_SCORE_CANDIDATE
    } = ACTIVITY_TYPE;

var model = Astro.Class({
    name: MODULE_NAME,
    collection: mongoCollection,
    fields: {
        type: {
            type: 'number'
        },
        createdBy: {
            type: 'string',
            default () {
                return 'vnw';
            }
        },
        ref: {
            type: 'object',
            default() {
                return {};
            }
        },
        content: {
            type: 'object',
            default () {
                return {};
            }
        },
        createdAt: {
            type: 'date',
            default() {
                return new Date();
            }
        }

    }, // schema
    methods: {
        creator() {
            return Meteor.users.findOne({_id: this.createdBy});
        },

        timeago() {
            return new moment(this.createdAt).fromNow();
        },

        /**
         * Activity title
         */
        title() {
            switch (this.type) {
                case APPLICATION_CREATE:
                    return 'Applied this position';

                case APPLICATION_STAGE_UPDATE:
                    return 'updated stage';

                case RECRUITER_CREATE_COMMENT:
                    return 'added a comment';

                case RECRUITER_CREATE_EMAIL:
                    return 'sent a message';

                case RECRUITER_SCHEDULE:
                    return 'scheduled an interview';

                case RECRUITER_DISQUALIFIED:
                    return 'disqualified this candidate';

                case RECRUITER_REVERSE_QUALIFIED:
                    return 'reverted qualify this candidate';

                case RECRUITER_SCORE_CANDIDATE:
                    return 'Submit score for this candidate';

                case RECRUITER_UPDATE_SCORE_CANDIDATE :
                    return 'Update score for this candidate';
                default:
                    return '';
            }
        },

        /**
         * Activity content
         */
        body() {
            switch (this.type) {
                case APPLICATION_CREATE:
                    return '';

                case APPLICATION_STAGE_UPDATE:
                    let icon = '';
                    let labelFrom = '';
                    let labelTo = '';
                    if (this.content['from'] && this.content['to']) {
                        labelFrom = this.content['from']['label'];
                        labelTo = this.content['to']['label'];
                        if (this.content['to']['id'] < this.content['from']['id']) {
                            icon = 'fa-long-arrow-left';
                            labelFrom = this.content['to']['label'];
                            labelTo = this.content['from']['label'];
                        } else {
                            icon = 'fa-long-arrow-right';
                            labelFrom = this.content['from']['label'];
                            labelTo = this.content['to']['label'];
                        }
                    }
                    return `
                        <h3 class="activity update-stage">
                            <span class="title">${labelFrom}</span>
                            <span class="icon"><i class="fa ${icon}"></i></span>
                            <span class="title">${labelTo}</span>
                        </h3>
                    `;

                case RECRUITER_CREATE_COMMENT:
                    return this.content['text'] || '';

                case RECRUITER_CREATE_EMAIL:
                    return this.content['body'] || '';

                case RECRUITER_SCHEDULE:
                    return 'Scheduled an interview';

                case RECRUITER_DISQUALIFIED:
                    return '';

                case RECRUITER_REVERSE_QUALIFIED:
                    return '';

                case RECRUITER_SCORE_CANDIDATE:
                    return 'Submit score for this candidate';

                case RECRUITER_UPDATE_SCORE_CANDIDATE :
                    return 'Update score for this candidate';
                default:
                    return '';
            }
        }
    }
});

Activities = model;
Activities.TYPE = ACTIVITY_TYPE;

Collection = model.getCollection();