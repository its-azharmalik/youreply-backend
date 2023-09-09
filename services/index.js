const emailService = require('./email.services');
const {
	imageUploaderMulti,
	imageUploaderSingle,
} = require('./imageUploader.services');
const youtubeService = require('./youtube.services');

module.exports = {
	emailService,
	imageUploaderMulti,
	imageUploaderSingle,
	youtubeService,
};
