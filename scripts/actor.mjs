import ActorAiInput from './actor-ai-input.mjs';
import ChatAiOpenAiApi from './api/chat-ai-open-ai-api.mjs';

export class Constants {
    static ID = 'aactors';
    static imageFolderLocation = 'imageFolderLocation'

    static TEMPLATES = {
        INPUT: `modules/${this.ID}/templates/actor-ai-inputs.hbs`,
        ACTOR: `modules/${this.ID}/templates/actor-ai.hbs`
    }

    static initialize() {
        this.mainInput = new ActorAiInput();

        game.settings.register(Constants.ID, Constants.imageFolderLocation, {
            name: `AActors.Settings.${Constants.imageFolderLocation}.Name`,
            default: "ai-images",
            type: String,
            scope: "world",
            config: true,
            restricted: true,
            hint: `AActors.Settings.${Constants.imageFolderLocation}.Hint`
          });
    }
}

// Initialize 
Hooks.once('init', () => {
    Constants.initialize();
});  
   

// Create AI Actor Button in Actor directory
Hooks.on('getActorDirectoryEntryContext', (html) => { 
    const directoryHeader = html.find(`[class="header-actions action-buttons flexrow"]`);

    const createActor = game.i18n.localize('AActors.General.Create');
    if(game.user.isGM) {
        directoryHeader.append(
            `<button type='button' class='create-actor-ai-actor' title='${createActor}'><i class="fa-solid fa-hat-wizard"></i> ${createActor}</button>`
        )

        html.on('click', '.create-actor-ai-actor', (event) => {
            Constants.mainInput.render(true, {userId: game.userId});
        });
    }
});

Hooks.on('chatMessage', (chatLog, message, chatData) => {
	const reWhisper = new RegExp(/^(\/w(?:hisper)?\s)(\[(?:[^\]]+)\]|(?:[^\s]+))\s*([^]*)/, "i");
	const match = message.match(reWhisper);
	if (match) {
		const gpt = 'ai';
		const userAliases = match[2].replace(/[[\]]/g, "").split(",").map(n => n.trim());
		const question = match[3].trim();
        const chatAi = new ChatAiOpenAiApi();
        const users = userAliases
        .filter(n => n.toLowerCase() !== gpt)
        .reduce((arr, n) => arr.concat(ChatMessage.getWhisperRecipients(n)), [game.user]);

		if (userAliases.some(u => u.toLowerCase() === gpt)) {

			// same error logic as in Foundry
			if (!users.length) throw new Error(game.i18n.localize("ERROR.NoTargetUsersForWhisper"));
			if (users.some(u => !u.isGM && u.id != game.user.id) && !game.user.can("MESSAGE_WHISPER")) {
				throw new Error(game.i18n.localize("ERROR.CantWhisper"));
			}

			chatData.type = CONST.CHAT_MESSAGE_TYPES.WHISPER;
			chatData.whisper = users.map(u => u.id);
			chatData.sound = CONFIG.sounds.notification;
            const toGptHtml = '<span>To: AI</span><br>';
            chatData.content = `${toGptHtml}${question.replace(/\n/g, "<br>")}`;
            ChatMessage.create(chatData);

            let postData = chatAi.prepareBasicPrompt();

			chatData.type = CONST.CHAT_MESSAGE_TYPES.WHISPER;
			chatData.whisper = users.map(u => u.id);
            ChatMessage.create({ content: "...", type: CONST.CHAT_MESSAGE_TYPES.WHISPER, whisper: users.map(u => u.id) })
                .then(responseMessage => chatAi.generateChatResponse(postData, question, responseMessage));
			return false;
		}
        if (userAliases.some(u => u.toLowerCase() === 'gpt-reset')) {
            chatAi.resetChatMessagesHistory();
			return false;
        }
        if (userAliases.some(u => u.toLowerCase() === 'img')) {
            ChatMessage.create({ content: ChatAiOpenAiApi.spinnerHtml, type: CONST.CHAT_MESSAGE_TYPES.WHISPER, whisper: users.map(u => u.id)})
                .then(responseMessage => chatAi.generateChatImage(question, responseMessage));
            return false;
        }
	}
	return true;
});

Hooks.on('renderChatLog', (log, html, data) => {
    ChatAiOpenAiApi.chatListeners(html)
  });