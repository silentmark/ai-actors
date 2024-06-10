
import { Constants } from "./actor.mjs";

/* FormApplication for ai actors */
export default class ActorAiImagePopup extends FormApplication {
    static get defaultOptions() {
        const defaults = super.defaultOptions;
        const title = game.i18n.localize('AActors.General.ImagePopup');
      
        const overrides = {
            // height: 'auto',
            width: '600',
            height: '400',
            template: Constants.TEMPLATES.IMAGEPOPUP,
            title: title,
            userId: game.userId,
            resizable: true,
            classes: defaults.classes.concat(["actor-ai"]),
            closeOnSubmit: false, // do not close when submitted
        };
      
        const mergedOptions = foundry.utils.mergeObject(defaults, overrides);
        return mergedOptions;
    }
    async getData() { 
        const data = await super.getData();
        data.image = this.image;
        return data;
    }

    constructor(...args) {
        super(...args);
        this.image = args[0].image;
    }
}