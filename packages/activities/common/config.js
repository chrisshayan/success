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
    'CANDIDATE_CREATE': 40,
    'CANDIDATE_UPDATE': 41,
    'CANDIDATE_DELETE': 42,
    'COMMENT_CREATE': 50,
    'EMAiL_CREATE': 60
};


Core.registerConfig(MODULE_NAME, CONFIG);
