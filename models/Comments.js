const { default: mongoose } = require('mongoose');

// const commentedUser = new mongoose.Schema({
//     authorChannelId: {
//         type: String
//     }
// })

const commentSchema = new mongoose.Schema({
	commentText: {
		type: String,
		required: true,
	},
	commentedUser: {
		// type: mongoose.Schema.Type.ObjectId,
		// ref: 'commentedUser'
		type: Object,
		required: true,
	},
	updatedAt: {
		type: String,
		required: true,
	},
	videoId: {
		type: String,
		required: true,
	},
	likeCount: {
		type: Number,
		required: true,
		default: 0,
	},
	replyCount: {
		type: Number,
		required: true,
		default: 0,
	},
	publishedAt: {
		type: String,
		required: true,
	},
	actualCommentId: {
		type: String,
		required: true,
	},
	analysedByAI: {
		type: Boolean,
		required: true,
		default: false,
	},
	replyByAI: {
		type: String,
	},
	userUpload: {
		type: mongoose.Schema.Types.ObjectId,
		ref: 'User',
	},
});

const Comment = mongoose.model('Comment', commentSchema);

module.exports = Comment;
