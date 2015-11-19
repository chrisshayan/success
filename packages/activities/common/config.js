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
 *  ]
 */

var CONFIG = {
    'COMPANY_CREATE': 10,
    'COMPANY_UPDATE': 11,
    'COMPANY_DELETE': 12,
    'JOB_CREATE': 20,
    'JOB_UPDATE': 21,
    'JOB_DELETE': 22,
    'APPLICATION_CREATE': 30,
    'APPLICATION_UPDATE': 31,
    'APPLICATION_DELETE': 32,
    'CANDIDATE_CREATE': 40,
    'CANDIDATE_UPDATE': 41,
    'CANDIDATE_DELETE': 42,
    'COMMENT_CREATE': 50,
    'COMMENT_UPDATE': 51,
    'COMMENT_DELETE': 52
};


Core.registerConfig(MODULE_NAME, CONFIG);
