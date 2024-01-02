const express = require('express');
const passport = require('passport');
const { signup, login, logout } = require('../controllers/auth.controller');
const { authentication, tokenVerification, e } = require('../config');
require('../config/passport');

const router = express.Router();

router.post('/signup', signup);
router.post('/login', authentication, login);
router.get('/logout', tokenVerification, logout);

//Google OAuth
router.get(
	'/google',
	passport.authenticate('google', {
		scope: [
			'email',
			'profile',
			'https://www.googleapis.com/auth/youtube.force-ssl',
			'https://www.googleapis.com/auth/youtube.force-ssl',
		],
	})
);
router.get(
	'/google/redirect',
	passport.authenticate('google', {
		failureRedirect:
			process.env.NODE_ENV == 'development'
				? process.env.SITE_URL + '/login/failure'
				: 'http://localhost:3000/login/failure',
	}),
	(req, res) => {
		const authToken = req.headers['authorization'].split(' ')[1];
		const token = req.headers['youtubeToken'].split(' ')[1];
		// const refresh_token = req.headers['refreshToken'].split(' ')[1];
		console.log('Youtube Token : ', token);
		let cookies = [];
		cookies.push(
			`token=${authToken}`,
			`YoutubeToken=${token}`
			// `RefreshToken=${refresh_token}`
		);

		res.cookie(cookies, {
			maxAge: 60 * 60 * 10,
			httpOnly: true,
			// secure: process.env.NODE_ENV == 'production' ? true : false,
		});

		res.redirect(
			process.env.NODE_ENV == 'development'
				? process.env.SITE_URL + '/login/success'
				: 'http://localhost:3000/login/success'
		);
	}
);

module.exports = router;
