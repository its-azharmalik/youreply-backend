const mongoose = require('mongoose');
const colors = require('colors');

const username = 'azhar258';
const password = 'Azhar.258';
const cluster = 'azhardev.budd25y';
const dbname = 'youtube_ai';

// mongodb+srv://Bizer44:<password>@cluster0.rzwrw.mongodb.net/?retryWrites=true&w=majority
// mongodb+srv://azhar258:<password>@azhardev.budd25y.mongodb.net/?retryWrites=true&w=majority

mongoose.connect(
	`mongodb+srv://${username}:${password}@${cluster}.mongodb.net/${dbname}?retryWrites=true&w=majority`,
	{
		useNewUrlParser: true,
		useUnifiedTopology: true,
	}
);

const db = mongoose.connection;
db.on('error', console.error.bind(console, 'connection error: '));
db.once('open', function () {
	console.log(`Database Connected successfully`.bold.blue);
});

module.exports = db;
