/**
 * Type of mention
 * @type {{USER: number, HASHTAG: number}}
 */
Mention.MENTION_TYPE = {
	USER   : 1,
	HASHTAG: 2,
};

/**
 * Type of content
 * @type {{ACTIVITY_COMMENT: number}}
 */
Mention.TYPE = {
	ACTIVITY_COMMENT: 1,
	ACTIVITY_SCORECARD: 2,
};
