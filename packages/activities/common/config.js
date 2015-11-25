/**
 * Created by HungNguyen on 11/19/15.
 */


/**
 * Activity type format : xy
 *  x : type activities
 *  y : action
 *  x : [
 *
 *    1 : company
 *    2 : job
 *    3 : application
 *    4 : candidate
 *    5 : comment
 *    6 : email
 *    7 : qualified
 *    8 : stage
 *    9 : recruiter
 *  ]
 *  y : [
 *   0 : create
 *   1 : update
 *   2 : delete
 *   3 : optional
 *   4 : optional
 *  ]
 */

var CONFIG = {
    'COMPANY_CREATE': 10,
    'COMPANY_UPDATE': 11,
    'COMPANY_DELETE': 12,
    'JOB_CREATE': 20,
    'JOB_UPDATE': 21,
    'JOB_DELETE': 22,
    'JOB_SYNC_DONE': 23,
    'JOB_SYNC_FAILED': 24,
    'APPLICATION_CREATE': 30,
    'APPLICATION_UPDATE': 31,
    'APPLICATION_DELETE': 32,
    'APPLICATION_STAGE_UPDATE': 33,
    'CANDIDATE_CREATE': 40,
    'CANDIDATE_UPDATE': 41,
    'CANDIDATE_DELETE': 42,
    'RECRUITER_CREATE_COMMENT': 53,
    'RECRUITER_CREATE_EMAIL': 54,
    'RECRUITER_DISQUALIFIED': 55,
    'RECRUITER_REVERSE_QUALIFIED': 551,
    'RECRUITER_SCHEDULE': 56,
    'RECRUITER_SCORE_CANDIDATE': 57
};


Core.registerConfig(MODULE_NAME, CONFIG);
