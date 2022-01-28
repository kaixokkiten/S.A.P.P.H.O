const discord = require('discord.js');
var auth = require('./auth.json');

const client = new discord.Client({ intents: [discord.Intents.FLAGS.GUILDS, discord.Intents.FLAGS.GUILD_MESSAGES, discord.Intents.FLAGS.GUILD_VOICE_STATES], partials: ["GUILD_MEMBER"] });

// Initialize Discord Bot
client.on('message', message => {
	console.log(message.content);
	if (message.content === "[ping]") {
		message.channel.send("pong");
		console.log("pong");
	}
	if (message.content === "[pong]") {
		message.channel.send("ping");
		console.log("ping");
	}
});

let guild;
let vctc_channel;

const sanreg = /(~|!|@|#|\$|%|\^|&|\*|\(|\)|\_|\+|\`|-|=|\[|\]|;|'|,|\.|\/|\{|\}|\||:|"|<|>|\?)/g;
let sanitize = e => e.replace(sanreg, '\\$1');

client.on("ready", async() => {
	guild = await client.guilds.resolve("379387726044332033");
	vctc_channel = await guild.channels.resolve("380176940059066378");
});

// voice state thingie (kui's code)
client.on('voiceStateUpdate', async (oldVS, newVS) => {
	// console.log("we are getting events")
	if (oldVS.guild.id != guild.id) return;
	if (!vctc_channel) return;
	
	if (oldVS.channel === null && newVS.channel !== null) {
		await vctc_channel.send(sanitize(newVS.member.displayName) + " joined " + newVS.channel.name);
	} else if (oldVS.channel !== null && newVS.channel === null) {
		await vctc_channel.send(sanitize(oldVS.member.displayName) + " left " + oldVS.channel.name);
	} else if (oldVS.channel === null && newVS.channel === null) {
		return;
	} else {
		if (oldVS.channel != newVS.channel) {
			await vctc_channel.send(sanitize(oldVS.member.displayName) + " moved from " + oldVS.channel.name + " to " + newVS.channel.name);
		}
		// lots of state bits
		let states = [
			["selfDeaf", ["undeafened", "deafened"]],
			// ["selfMute", ["unmuted", "muted"]],
			["selfVideo", ["turned off video", "turned on video"]],
			["serverDeaf", ["server undeafened", "server deafened"]],
			["serverMute", ["server unmuted", "server muted"]],
			["streaming", ["stopped streaming", "started streaming"]]
		];
		if (Math.random() < 0.01) {
			states.filter(e=>e[0].includes("Deaf")).forEach(e=>e[1] = e[1].map(e=>e.split("deafen").join("defeat")));
			states.filter(e=>e[0] === "streaming").forEach(e=>e[1] = e[1].map(e=>e.split("stream").join("scream")));
		}
		for (let state of states) {
			if (oldVS[state[0]] != newVS[state[0]]) {
				await vctc_channel.send(sanitize(oldVS.member.displayName) + " " + state[1][+!oldVS[state[0]]]);
			}
		}
	}
});

client.login(auth.token);