
import { Constants } from "./actor.mjs";
import ActorAi from "./actor-ai.mjs";

/* FormApplication for ai actors */
export default class ActorAiInput extends FormApplication {
    static get defaultOptions() {
        const defaults = super.defaultOptions;
        const title = game.i18n.localize('AActors.General.PrepareInputForm');
      
        const overrides = {
            // height: 'auto',
            width: '500',
            height: '200',
            template: Constants.TEMPLATES.INPUT,
            title: title,
            userId: game.userId,
            resizable: true,
            classes: defaults.classes.concat(["actor-ai"]),
            closeOnSubmit: false, // do not close when submitted
        };
      
        const mergedOptions = foundry.utils.mergeObject(defaults, overrides);
        return mergedOptions;
    }


    constructor(...args) {
        super(...args);
    }

    async getData() {
        let data = await super.getData();
        return data;
    }

    activateListeners(html) {
        super.activateListeners(html);  
        html.on('click', "[data-action='send']", this._handleSendClick.bind(this));
    }

    async _handleSendClick(event) {
        this.object.input = this.form.description.value;
        new ActorAi(this.object).render(true);
    }
}