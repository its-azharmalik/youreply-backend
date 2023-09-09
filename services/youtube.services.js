// Service for fetching the Video Comments from the Youtube API based on Frontend Input

const { google } = require('googleapis');
const openai = require('../config/ai');
const Comment = require('../models/Comments');

const youtubeService = async (videoID, accessToken, pageToken) => {
	var oauth2Client = new google.auth.OAuth2(
		process.env.GOOGLE_CREDENTIAL_CLIENT_ID,
		process.env.GOOGLE_CREDENTIAL_CLIENT_SECRET,
		process.env.GOOGLE_CREDENTIAL_CALLBACK_URL
	);

	oauth2Client.credentials = {
		access_token: accessToken,
	};

	const youtube = google.youtube({
		// build an Access Token version when making a separate API for fetching the Video Comments
		version: 'v3',
		auth: oauth2Client,
	});

	let response = {
		data: {},
		err: 'NULL',
	};

	try {
		const res = await youtube.commentThreads.list({
			part: ['snippet'],
			videoId: videoID ? videoID : 'az6NibAUf7Y',
			// pageToken: pageToken,
			maxResults: 100,
		});
		response.data = res.data;
		return response;
	} catch (error) {
		response.err = error;
		return error;
	}
};

const replyToComment = async (commentId, commentText, accessToken) => {
	var oauth2Client = new google.auth.OAuth2(
		process.env.GOOGLE_CREDENTIAL_CLIENT_ID,
		process.env.GOOGLE_CREDENTIAL_CLIENT_SECRET,
		process.env.GOOGLE_CREDENTIAL_CALLBACK_URL
	);

	oauth2Client.credentials = {
		access_token: accessToken,
	};

	const youtube = google.youtube({
		version: 'v3',
		auth: oauth2Client,
	});

	let response = {
		data: {},
		err: 'NULL',
	};

	try {
		const res = await youtube.comments.insert({
			part: ['id', 'snippet'],
			requestBody: {
				snippet: {
					textOriginal: commentText,
					parentId: commentId,
				},
			},
		});
		if (
			res.status != 400 ||
			res.status != 500 ||
			res.status != 404 ||
			res.status != 403
		) {
			response.data = res;
			return response;
		} else {
			response.err = 'ERROR IN REPLYING TO COMMENT';
			response.data = res;
			return response;
		}
	} catch (error) {
		response.err = error;
		return error;
	}
};

const commentRefactoring = (data, userUpload) => {
	const array = [];
	data.map((comment) => {
		const user = {
			authorChannelId:
				comment.snippet.topLevelComment.snippet.authorChannelId.value,
			// body.data.items[0].snippet.topLevelComment.snippet.authorChannelUrl
			authorChannelUrl:
				comment.snippet.topLevelComment.snippet.authorChannelUrl,
			// body.data.items[0].snippet.topLevelComment.snippet.authorDisplayName
			authorDisplayName:
				comment.snippet.topLevelComment.snippet.authorDisplayName,
			// body.data.items[0].snippet.topLevelComment.snippet.authorProfileImageUrl
			authorProfileImageUrl:
				comment.snippet.topLevelComment.snippet.authorProfileImageUrl,
		};

		const object = {
			// body.data.items[0].snippet.topLevelComment.snippet.textOriginal
			commentText: comment.snippet.topLevelComment.snippet.textOriginal
				? comment.snippet.topLevelComment.snippet.textOriginal
				: ' ',
			commentedUser: user,
			// body.data.items[0].snippet.topLevelComment.snippet.updatedAt
			updatedAt: comment.snippet.topLevelComment.snippet.updatedAt,
			// body.data.items[0].snippet.topLevelComment.snippet.videoId
			videoId: comment.snippet.topLevelComment.snippet.videoId,
			// body.data.items[0].snippet.topLevelComment.snippet.likeCount
			likeCount: comment.snippet.topLevelComment.snippet.likeCount,
			// body.data.items[0].snippet.topLevelComment.snippet.publishedAt
			replyCount: comment.snippet.totalReplyCount,
			publishedAt: comment.snippet.topLevelComment.snippet.publishedAt,
			actualCommentId: comment.id,
			userUpload: userUpload,
		};
		array.push(object);
	});
	return array;
};

const updateCommentsGPT = async (prompt, comments) => {
	// prompt -> User Behaviour, Example Reply 1, Example Reply 2, Example Reply 3, commentData

	comments.map(async (comment) => {
		// const completion = await openai.completions.create({
		// 	model: 'text-davinci-003',
		// 	prompt:
		// 		`The following AI tool helps youtubers identify if a comment can
		// 	should be replied to or not. Questions and or asking for advice are good examples of when a reply is needed. \n\n` +
		// 		// Context Example 1
		// 		`'User: John Smith \n` +
		// 		`Comment: Asalamualaykum to u both, but u should keep ur name that ur parent gave u. And please please take no notice on negative comments, its ur journey, some Muslims over push u to much, thats a big no no, u done the main shahader! So May ALLAH  bless u both, we born Muslims benifit from ur videos. Alumdullila ❤ \n` +
		// 		`Should Reply: Yes\n\n` +
		// 		// Context Example 2
		// 		`User: Sue Mary\n` +
		// 		`Comment: bro DONT MOVE TO MOROCCO , you will be disappointed if you're looking for a good Islamic society . I'm moroccan and i recommend living in Qatar or Saudi ...` +
		// 		`Should Reply: No \n\n` +
		// 		// Actual use case
		// 		`User: ${comment.authorDisplayName} \n` +
		// 		`Comment: ${comment.commentText}\n` +
		// 		+`Should Reply:`,
		// 	stop: ['\n', 'User:', 'Comment:', 'Should Reply:'],
		// 	max_tokens: 30,
		// });
		// if (completion.choices[0].text.trim() == 'Yes') {
		// 	await Comment.findByIdAndUpdate(comment._id, { analysedByAI: true });
		// }
	});
};

const generateReplyGPT = async (comment, prompt, user, words) => {
	const completion = await openai.chat.completions.create({
		model: 'gpt-3.5-turbo',
		messages: [
			{
				role: 'system',
				content: `Hello! I am ${user.username} and I want to represent myself as a Youtuber to comment on my video as a humble muslim guy. I want to reply to youtube comments on my Channel.\n\nfor example \n\nUser named ${prompt.replys[0].comment.name} Commented ${prompt.replys[0].comment.text} which was replied as ${prompt.replys[0].comment.text}. and another User named ${prompt.replys[1].comment.name} has Commented ${prompt.replys[1].comment.text} which was replied as ${prompt.replys[1].comment.text}. and another User named ${prompt.replys[2].comment.name} which was replied as ${prompt.replys[2].comment.text}`,
			},
			{
				role: 'user',
				content: `Generate a single suitable reply according to the given examples for several replies which I've done in the past. Reply in about ${words} words a little humbly not disrespecting anyone.`,
			},
		],
		temperature: 1,
		max_tokens: 256,
		top_p: 1,
		frequency_penalty: 0,
		presence_penalty: 0,
	});
	return completion;
};

module.exports = {
	youtubeService,
	commentRefactoring,
	updateCommentsGPT,
	generateReplyGPT,
	replyToComment,
};
