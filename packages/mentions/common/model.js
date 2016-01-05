MentionCollection = new Mongo.Collection('mentions');

Mention = Astro.Class({
	name:       'Mention',
	collection: MentionCollection,
	fields:     {
		ref:         {
			type: 'object',
			default() {
				return {};
			}
		},
		mentionType: {
			type: 'number'
		},

		type: {
			type: 'number'
		},

		typeId: {
			type: 'string'
		},

		text: {
			type: 'string',
		},

		embed: {
			type: 'string',
			default() {
				return '';
			}
		},

		createdAt: {
			type: 'date',
			default() {
				return new Date();
			}
		},
		createdBy: {
			type: 'string',
			default() {
				return '';
			}
		}
	},

	methods: {
		hasRef(type) {
			type = type.toString().toLowerCase();
			type += 'Id';
			return this.ref.hasOwnProperty(type);
		},

		getRef(type) {
			type = type.toString().toLowerCase();
			const typeField = type + 'Id';
			if(!this.ref.hasOwnProperty(typeField)) return null;

			switch (type) {
				case 'job':
					return JobExtra.findOne({jobId: this.ref[typeField]});
					break;
				case 'app':
					return Application.findOne({appId: this.ref[typeField]});
					break;
			}
		},

		creator() {
			return Meteor.users.findOne({_id: this.createdBy});
		},

		time() {
			return moment(this.createdAt).format('llll');
		}
	}
});