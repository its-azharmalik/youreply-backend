const express = require('express');

const { tokenVerification, upload } = require('../config');
const {
	fetchCommentsRequest,
	googleController,
	replySingleComment,
	publishReplyToYoutube,
	fetchMyVideos,
} = require('../controllers/youtube.controller');

const router = express.Router();

// router.get('/verify', tokenVerification, verifyEmail);
// router.post('/verifywithjwt', upload.single('url'), verifyEmailWithJwtToken);

// //when user wants to change the password and he still remembers the old password and can log in
// router.get('/requestresetpassword', tokenVerification, resetPasswordRequest);
// router.put('/resetpassword', resetPassword);

// //when user wants to change the password cuz he forgot his old password
// router.get('/forgotpassword', forgotPassword);
// router.put('/changepassword', changePassword);

// when user gives a Video ID to fetch comments
router.post(
	'/comments',
	// write a function in controller to fetch comments using youtube data api and store it in database
	fetchCommentsRequest
);

router.post(
	'/generateReply',
	// Write the function to generste single Reply
	replySingleComment
);

router.post(
	'/publishReplyToYoutbe',
	// Write the function to generste single Reply
	publishReplyToYoutube
);

router.get(
	'/fetch-videos',
	// Write the function to fetch videos from the video DATA API
	fetchMyVideos
);

// router.get('/google', googleController);

module.exports = router;
