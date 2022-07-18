const { Client, IntentsBitField, PermissionsBitField } = require("discord.js");

const UNARCHIVE_REASON = "Unarchived by Thread Unarchiver bot";
const UNARCHIVE_MESSAGE = "Thread has been unarchived. Remove me from this thread to stop unarchiving it.";
const ADDED_MESSAGE = "I will now prevent this thread from being archived.";
const NEED_SMIT_MESSAGE = "I require the permission `Send Messages in Threads` to work in";
const NEED_MT_MESSAGE = "I require the permission `Manage Threads` to unarchive";
const NEED_MT_ALT_MESSAGE = "Alternatively, you can enable `Anyone can unarchive` in the thread settings.";

const client = new Client({ intents: [IntentsBitField.Flags.Guilds] });
let ID = "";

// Start-up
client.once("ready", c => {
	console.log("Logged in as", c.user.tag);
	ID = c.user.id;
});

// When a thread is unarchived
client.on("threadUpdate", (oldT, T) => {
	if(oldT.archived || !T.archived)
		return;
	if(!T.guildMembers.has(ID))
		return;

	let GM = T.guildMembers.get(ID);
	// Check if bot can message in the thread. Required to unarchive
	if(T.permissionsFor(GM).has(PermissionsBitField.Flags.SendMessagesInThreads)) { // different from T.sendable when thread is archived
		if(T.unarchivable) {
			T.setArchived(false, UNARCHIVE_REASON);
			T.send(UNARCHIVE_MESSAGE);

			console.log("Unarchived thread with ID:", T.id);
		} else if(T.parent.permissionsFor(GM).has(PermissionsBitField.Flags.SendMessages)) {
			T.parent.send(`${NEED_MT_MESSAGE} ${T.toString()}. ${NEED_MT_ALT_MESSAGE}`);
			console.log("Ignored unarchive, since lacking permission in thread with ID:", T.id);
		} else console.log("Ignored unarchive... I'm missing quite a few permissions in thread with ID:", T.id);

	} else if(T.parent.permissionsFor(GM).has(PermissionsBitField.Flags.SendMessages)) {
		T.parent.send(`${NEED_SMIT_MESSAGE} ${T.toString()}`); // Tell the user the bot can't message there
		console.log("Ignored unarchive, since lacking permission SendMessagesInThreads in thread with ID:", T.id);
	} else console.log("Ignored unarchive, since lacking permission to inform user of required permissions in thread with ID:", T.id);
});

// When the bot is added to a thread
client.on("threadMembersUpdate", (added, removed, T) => {
	if(!added.has(client.user.id) || T.archived)
		return;

	let GM = added.get(ID).guildMember;
	// Check if bot can message in the thread
	if(T.sendable) {
		T.send(ADDED_MESSAGE);
		console.log("Added to thread with ID:", T.id);

	} else if(T.parent.permissionsFor(GM).has(PermissionsBitField.Flags.SendMessages)) {
		T.parent.send(`${NEED_SMIT_MESSAGE} ${T.toString()}`); // Tell the user the bot can't message there
		console.log("Added, but no permission to send message in thread with ID:", T.id);
	} else {
		// Leave if the bot can't let the user know
		T.leave();
		console.log("Added, but no permission to inform user of required permissions in thread with ID:", T.id);
	}
});

client.login("TOKEN HERE");
