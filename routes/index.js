const express = require('express');
const authRoutes = require('./auth.routes');
const servicesRoutes = require('./services.routes');
const userRoutes = require('./user.routes');
const commentRoutes = require('./youtube.routes');

const router = express.Router();

const defaultRoutes = [
	{
		path: '/auth',
		route: authRoutes,
	},
	{
		path: '/services',
		route: servicesRoutes,
	},
	{
		path: '/users',
		route: userRoutes,
	},
	{
		path: '/youtube',
		route: commentRoutes,
	},
];

defaultRoutes.forEach((route) => {
	router.use(route.path, route.route);
});

module.exports = router;
