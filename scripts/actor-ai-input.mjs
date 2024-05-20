
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
            height: '350',
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
        this.object.textInput = this.form.description.value;
        this.object.complexity = this.form.complexity.value;
        this.object.noOfTalents = new Number(this.form.noOfTalents.value);
        this.object.noOfCareers = new Number(this.form.noOfCareers.value);
        let newObject = foundry.utils.deepClone(this.object);
        new ActorAi(newObject).render(true);
    }
}