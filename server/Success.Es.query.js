SuccessESQuery = {
    jobListCounter(companyId) {
        return {
            "query": {
                "filtered": {
                    "filter": {
                        "and": [
                            {
                                "term": {
                                    "companyId": companyId
                                }
                            },
                            {
                                "term": {
                                    "isCompleted": 1
                                }
                            },
                            {
                                "term": {
                                    "isApproved": 1
                                }
                            },
                            {
                                "term": {
                                    "isDeleted": 0
                                }
                            },
                            {
                                "not": {
                                    "filter": {
                                        "term": {
                                            "isUnpaidDisable": 1
                                        }
                                    }
                                }
                            }
                        ]
                    }
                }
            },
            "size": 0,
            "aggs": {
                "online": {
                    "filter": {
                        "and": [
                            {
                                "range": {
                                    "expiredDate": {
                                        "gte": "now"
                                    }
                                }
                            },
                            {
                                "term": {
                                    "isActive": 1
                                }
                            }
                        ]
                    }
                },
                "expired": {
                    "filter": {
                        "and": [
                            {
                                "range": {
                                    "expiredDate": {
                                        "lt": "now"
                                    }
                                }
                            }
                        ]
                    }
                }
            }
        };
    },

    onlineJob (companyId, keyword = "*") {
        return {
            "_source": [
                "userId",
                "companyId",
                "skills.skillName",
                "jobId",
                "alias",
                "jobTitle",
                "cityList",
                "numOfViews",
                "approvedDate",
                "expiredDate"
            ],

            "query": {
                "filtered": {
                    "query": {
                        "bool": {
                            "should": [
                                {
                                    "query_string": {
                                        "query": keyword,
                                        "fields": ["jobTitle"],
                                        "default_operator": "OR"
                                    }
                                },
                                {
                                    "nested": {
                                        "path": "skills",
                                        "query": {
                                            "term": {
                                                "skills.skillName": {
                                                    "value": keyword,
                                                    "boost": 1
                                                }
                                            }
                                        }
                                    }
                                }
                            ]
                        }
                    },
                    "filter": {
                        "and": [
                            {
                                "term": {
                                    "isCompleted": 1
                                }
                            },
                            {
                                "term": {
                                    "isApproved": 1
                                }
                            },
                            {
                                "term": {
                                    "isActive": 1
                                }
                            },
                            {
                                "term": {
                                    "isDeleted": 0
                                }
                            },
                            {
                                "term": {
                                    "companyId": companyId
                                }
                            },
                            {
                                "not": {
                                    "filter": {
                                        "term": {
                                            "isUnpaidDisable": 1
                                        }
                                    }
                                }
                            },
                            {
                                "range": {
                                    "expiredDate": {
                                        "gte": "now"
                                    }
                                }
                            }
                        ]
                    }
                }
            },
            "sort": [
                {
                    "jobId": "desc"
                }
            ]
        };
    },

    expiredJob (companyId, keyword = "*") {
        return {
            "_source": [
                "userId",
                "companyId",
                "skills.skillName",
                "jobId",
                "alias",
                "jobTitle",
                "cityList",
                "numOfViews",
                "approvedDate",
                "expiredDate"
            ],

            "query": {
                "filtered": {
                    "query": {
                        "bool": {
                            "should": [
                                {
                                    "query_string": {
                                        "query": keyword,
                                        "fields": ["jobTitle"],
                                        "default_operator": "OR"
                                    }
                                },
                                {
                                    "nested": {
                                        "path": "skills",
                                        "query": {
                                            "term": {
                                                "skills.skillName": {
                                                    "value": keyword,
                                                    "boost": 1
                                                }
                                            }
                                        }
                                    }
                                }
                            ]
                        }
                    },
                    "filter": {
                        "and": [
                            {
                                "term": {
                                    "isCompleted": 1
                                }
                            },
                            {
                                "term": {
                                    "isApproved": 1
                                }
                            },
                            {
                                "term": {
                                    "isDeleted": 0
                                }
                            },
                            {
                                "term": {
                                    "companyId": companyId
                                }
                            },
                            {
                                "not": {
                                    "filter": {
                                        "term": {
                                            "isUnpaidDisable": 1
                                        }
                                    }
                                }
                            },
                            {
                                "range": {
                                    "expiredDate": {
                                        "lt": "now"
                                    }
                                }
                            }
                        ]
                    }
                }
            },
            "sort": [
                {
                    "jobId": "desc"
                }
            ]
        };
    },

    getJobInfo(jobId = 0) {
        return {
            "query": {
                "term": {
                    "jobId": {
                        "value": jobId
                    }
                }
            }
        };
    },

    getMultiJobsInfo(arrayJobId = []){
        return {
            "query": {
                "filtered": {
                    "filter": {
                        "terms": {
                            "jobId": arrayJobId
                        }
                    }
                }
            }
        }
    },

    // get company info by companyId
    getCompanyInfo(companyId = 0) {
        return {
            "query": {
                "term": {
                    "companyId": {
                        "value": companyId
                    }
                }
            }
        };
    }
};