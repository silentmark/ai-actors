import ActorAiInput from './actor-ai-input.mjs';

export class Constants {
    static ID = 'aactors';

    static TEMPLATES = {
        INPUT: `modules/${this.ID}/templates/actor-ai-inputs.hbs`,
        ACTOR: `modules/${this.ID}/templates/actor-ai.hbs`
    }

    static initialize() {
        this.mainInput = new ActorAiInput();
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