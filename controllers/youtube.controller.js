// const colors = require('colors');
// const jwt = require('jsonwebtoken');
// const bcrypt = require('bcrypt');

const { google } = require('googleapis');
const e = require('../config/errorList');
const {
	youtubeService,
	commentRefactoring,
	updateCommentsGPT,
	generateReplyGPT,
	replyToComment,
	fetchAllMyVideos,
} = require('../services/youtube.services');
const Comment = require('../models/Comments');
const { User } = require('../models');

// const { User } = require('../models');
// const { emailService, imageUploaderSingle } = require('../services');

const fetchCommentsRequest = async (req, res) => {
	try {
		const accessToken = req.headers.cookie.split(',')[1].split('=')[1];
		// const refresh_token = req.headers.cookie.split(',')[2].split('=')[1];
		// console.log(refresh_token);
		const response = await youtubeService(
			req.body.videoID.videoID,
			accessToken
		);

		if (response.err != 'NULL') {
			res.status(500).json({
				error: response.err,
			});
		} else {
			const refactoredComments = commentRefactoring(
				response.data.items,
				req.body.videoID.userId
			);
			if (refactoredComments.length > 2) {
				await Comment.deleteMany({});
				await Comment.insertMany(refactoredComments);
			} else {
				throw new Error('No Comments Found or Very Few Comments');
			}
			const comments = await Comment.find();
			// updateCommentsGPT(prompt, comments);
			res.status(200).json({
				message: e.states.success,
				body: {
					data: comments,
					response: response,
					// user: req,
				},
			});
		}
	} catch (error) {
		console.log('catch :', error);
		res.status(500).json({
			error: error.message,
		});
	}
};

const replySingleComment = async (req, res) => {
	try {
		const comment = await Comment.findById(req.body.comment);
		const prompt = req.body.prompt;
		const user = await User.findById(req.body.userId);
		const words = req.body.words;
		const reply = await generateReplyGPT(comment, prompt, user, words);
		if (reply != '' && reply != ' ') {
			res.status(200).json({
				message: e.states.success,
				body: {
					data: comment,
					reply: reply,
				},
			});
		}
	} catch (error) {
		console.log('catch :', error);
		res.status(500).json({
			error: error.message,
		});
	}
};

const publishReplyToYoutube = async (req, res) => {
	try {
		const accessToken = req.headers.cookie.split(',')[1].split('=')[1];
		const commentId = req.body.commentId;
		const commentText = req.body.commentText;
		let comment = await Comment.findById(req.body.comment);
		const result = await replyToComment(commentId, commentText, accessToken);

		if (result.err == 'NULL' && result?.data) {
			comment.analysedByAI = true;
			comment.replyByAI = 'result.data.data.snippet.textOriginal';
			comment.save();

			res.status(200).json({
				message: e.states.success,
				body: {
					data: comment,
					reply: result,
				},
			});
		} else if (result.err == 'ERROR IN REPLYING TO COMMENT') {
			res.status(500).json({
				message: e.states.failure,
				body: {
					data: comment,
					reply: result,
				},
			});
		}
	} catch (error) {
		console.log('catch :', error);
		res.status(500).json({
			error: error.message,
		});
	}
};

const fetchMyVideos = async (req, res) => {
	try {
		const accessToken = req.headers.cookie.split(',')[1].split('=')[1];
		// call the video fetching service from youtube services
		const response = await fetchAllMyVideos(accessToken);
		let videos = [];
		response.data.data.items.forEach((video) => {
			videos.push(video);
		});
		res.status(200).json({
			message: e.states.success,
			body: {
				videos: videos,
				response: response,
			},
		});
	} catch (error) {
		console.log('catch :', error);
		res.status(500).json({
			error: error.message,
		});
	}
};

module.exports = {
	fetchCommentsRequest,
	replySingleComment,
	publishReplyToYoutube,
	fetchMyVideos,
};
