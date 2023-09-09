const OpenAI = require('openai');

const openai = new OpenAI({
	apiKey: process.env.AI_API_KEY, // This is also the default, can be omitted
});

module.exports = openai;

// const main = async () => {
// 	const completion = await openai.completions.create({
// 		model: 'text-davinci-003',
// 		prompt: 'This story begins',
// 		max_tokens: 30,
// 	});
// 	console.log(completion.choices[0].text);
// };
// main();
