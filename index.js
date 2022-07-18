const { Client, IntentsBitField } = require("discord.js");

const UNARCHIVE_REASON = "Unarchived by Thread Unarchiver bot";
const UNARCHIVE_MESSAGE = "Thread has been unarchived. Remove me from this thread to stop unarchiving it.";
const ADDED_MESSAGE = "I will now prevent this thread from being archived.";

const client = new Client({ intents: [IntentsBitField.Flags.Guilds] });


client.once("ready", c => {
	console.log("Logged in as", c.user.tag);
});

client.on("threadUpdate", (oldT, newT) => {
	if(oldT.archived || !newT.archived)
		return;
	if(!oldT.guildMembers.has(client.user.id))
		return;

	newT.setArchived(false, UNARCHIVE_REASON);
	newT.send(UNARCHIVE_MESSAGE);
	console.log("Unarchived thread with ID:", newT.id);
});

client.on("threadMembersUpdate", (added, removed, T) => {
	if(!added.has(client.user.id))
		return;

	T.send(ADDED_MESSAGE);
	console.log("Added to thread with ID:", T.id);
});

client.login("TOKEN HERE");
