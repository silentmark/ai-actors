class aiActors {
    static ID = 'ai-actors';

    static TEMPLATES = {
        AIACTORS: `modules/${this.ID}/templates/ai-actors.hbs`,
        AIHIST: `modules/${this.ID}/templates/ai-msg-hist.hbs`
    }

    /**
     * A small helper function which leverages developer mode flags to gate debug logs.
     * 
     * @param {boolean} force - forces the log even if the debug flag is not on
     * @param  {...any} args - what to log
     */
    static log(force, ...args) {  
        const shouldLog = force || game.modules.get('_dev-mode')?.api?.getPackageDebugValue(this.ID);
    
        if (shouldLog) {
            console.log(this.ID, '|', ...args);
        }
    }
    
    static initialize() {
        this.aiActorsConfig = new aiActorConfig();
        this.viewMsgHist = new aiActorMessageHistory();
    }
}

// Initialize 
Hooks.once('init', () => {
    aiActors.initialize();
    aiActorSettings.initialize();
});

Hooks.on('renderaiActorConfig', (html) => {
    const folders = html.form.folders;
    const selectFolder = game.i18n.localize('AI-ACTOR.select_folder');
    folders.options.add( new Option(`-- ${selectFolder} --`, "", true, true));
    let foldersArray = [...game.folders.values()];

    let options = aiActor.getFolderOptions(foldersArray);
    let optionsFlat = options.flat(Infinity);
    let uniqueOptions = Array.from(new Map(optionsFlat.map(option => [option.value, option])).values());

    uniqueOptions.forEach(option => {
        folders.options.add(option);
    })

});

// Create AI Actor Button in Actor directory
Hooks.on('getActorDirectoryEntryContext', (html) => { 
    const directoryHeader = html.find(`[class="header-actions action-buttons flexrow"]`);

    const create_actor = game.i18n.localize('AI-ACTOR.create_actor');
    const msg_hist = game.i18n.localize('AI-ACTOR.msg_hist');
    if(game.user.isGM) {
        directoryHeader.append(
            `<button type='button' class='create-ai-actor-button' title='${create_actor}'><i class="fa-solid fa-hat-wizard"></i> ${create_actor}</button>`
        )
    
        directoryHeader.append(
            `<button type='button' class='ai-actor-message-history' title='${msg_hist}'><i class="fa-solid fa-message"></i> ${msg_hist}</button>`
        )
    
        html.on('click', '.create-ai-actor-button', (event) => {
            /*const userId = $(event.currentTarget).parents('[data-user-id]')?.data()?.userId;
            ToDoList.toDoListConfig.render(true, {userId});*/
            userId = game.userId;
            aiActors.aiActorsConfig.render(true, {userId});
        });
    
        html.on('click', '.ai-actor-message-history', (event) => {
            userId = game.userId;
            aiActors.viewMsgHist.render(true, {userId});
        })
    }
});

// Chat with ChatGPT for campaign help and ideas
Hooks.on("chatMessage", async (_, messageText, chatData) => {
    // Only the GM can use ChatGPT
    let user = game.users.get(chatData.user);
    
    const parts = messageText.trim().split(" ");
    const command = parts.shift();
    const argsString = parts.join(" ");
    
    if (command === "!gpt") {
        if(user.role === CONST.USER_ROLES.GAMEMASTER) {
            // Prevent the default chat message behavior
            chatData.type = CONST.CHAT_MESSAGE_TYPES.WHISPER;
            chatData.whisper = ChatMessage.getWhisperRecipients("GM");

            // Create Message History
            let userMessage = {"role": "user", "content": `${argsString}` };
            chatData.flags = chatData.flags || {};
            chatData.flags.aiMessage = 'prompt';

            let messages = messageHistory.allPrompts().map(x => ({"role" : "user", "content" : x}));
            let historyLength = game.settings.get(aiActorSettings.ID, aiActorSettings.SETTINGS.MESSAGE_HIST);
            messages = messages.slice(-historyLength);
            messages.push(userMessage);
            messages = messages.reverse()
            // Call ChatGPT
            const message = await llmLib.callChat(messages);
            console.log("ChatGPT Message:", message);
            const formattedMessage = message.replace(/\n/g, '<br>');    
            // Send a response back to chat
            const responseMessage = await ChatMessage.create({
                content: formattedMessage,
                whisper: ChatMessage.getWhisperRecipients("GM"),
                flags: {
                    aiMessage: 'response'
                }
            });
    
            // Return false to prevent the original message from being processed further
            return false;
        }
    }

    // Return true for the Foundry VTT to process the message normally
    return true;
});