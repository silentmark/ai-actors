import WfrpAiInput from './wfrp-ai-input.mjs';

export class Constants {
    static ID = 'aactors';

    static TEMPLATES = {
        INPUT: `modules/${this.ID}/templates/wfrp-ai-inputs.hbs`,
        ACTOR: `modules/${this.ID}/templates/wfrp-ai.hbs`
    }

    static initialize() {
        this.mainInput = new WfrpAiInput();
    }
}

// Initialize 
Hooks.once('init', () => {
    Constants.initialize();
});

// Create AI Actor Button in Actor directory
Hooks.on('getActorDirectoryEntryContext', (html) => { 
    const directoryHeader = html.find(`[class="header-actions action-buttons flexrow"]`);

    const createWfrpAiActor = game.i18n.localize('AActors.General.Create');
    // const msg_hist = game.i18n.localize('AI-ACTOR.msg_hist');
    if(game.user.isGM) {
        directoryHeader.append(
            `<button type='button' class='create-wfrp-ai-actor' title='${createWfrpAiActor}'><i class="fa-solid fa-hat-wizard"></i> ${createWfrpAiActor}</button>`
        )

        html.on('click', '.create-wfrp-ai-actor', (event) => {
            Constants.mainInput.render(true, {userId: game.userId});
        });
    
        //html.on('click', '.ai-actor-message-history', (event) => {
        //   userId = game.userId;
        //    aiActors.viewMsgHist.render(true, {userId});
        //})
    }
});