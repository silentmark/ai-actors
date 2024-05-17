
import ActorAiOpenAiApi from './api/actor-ai-open-ai-api.mjs';
import WfrpOpenAiDetailsApi from './api/wfrp-open-ai-details.mjs';
import GenericOpenAiDetailsApi from './api/generic-open-ai-details.mjs';
import { Constants } from "./actor.mjs";
import ImageMidJourneyApi from './api/image-mj-api.mjs';
import ImageOpenAiApi from './api/image-open-ai-api.mjs';
import InputModel from './model/input-model.mjs';

/* FormApplication for ai actors */
export default class ActorAi extends FormApplication {
    static get defaultOptions() {
        const defaults = super.defaultOptions;
        const title = game.i18n.localize('AActors.General.SaveActorForm');
      
        const overrides = {
            // height: 'auto',
            width: '700',
            height: '700',
            template: Constants.TEMPLATES.ACTOR,
            title: title,
            userId: game.userId,
            resizable: true,
            classes: defaults.classes.concat(["actor-ai"])
        };
        const mergedOptions = foundry.utils.mergeObject(defaults, overrides);
        return mergedOptions;
    }

    static getFolderOptions(folders, parentId = null) {
        let options = [];
        folders.forEach(folder => {
            let depthString = "";
            if (folder.type == 'Actor') {
                for(let i = 1; i < folder.depth; i++) {
                    depthString += "-- ";
                }
                if(folder.children.length > 0 && parentId == null) {
                    options.push( {name: depthString + folder.name, value: folder.id });
                    let childrenArray = folder.children.map(child => child.folder);
                    options.push(this.getFolderOptions(childrenArray, folder.id));
                }
                else if(parentId != null) {
                    options.push({ name: depthString + folder.name, value: folder.id });
                }
            }
        })
        return options;
    }

    static async saveImageToFileSystem(imageBase64, path) {

        if (!path.includes('.png')) {
            path = path + '.png';
        }
        // Convert to Blob
        const byteCharacters = atob(imageBase64);
        const byteArrays = [];

        for (let i = 0; i < byteCharacters.length; i++) {
            byteArrays.push(byteCharacters.charCodeAt(i));
        }

        const byteArray = new Uint8Array(byteArrays);
        const myBlob = new Blob([byteArray], { type: "image/png" });

        const imageFile = new File([myBlob], path, {type: myBlob.type});
        const uploadResult = await FilePicker.upload("data", "", imageFile, {}, {notify: true});
        return uploadResult;
    }

    constructor(...args) {  
        super(...args);

        this.actor = null;
        this.actorInput = args[0];
        this.api = new ActorAiOpenAiApi();
        if (game.system.id == 'wfrp4e') {
            this.apiDetails = new WfrpOpenAiDetailsApi();
        } else {
            this.apiDetails = new GenericOpenAiDetailsApi();
        }
        if (game.settings.get(Constants.ID, ImageMidJourneyApi.authorizationHeaderKey)) {
            this.apiImage = new ImageMidJourneyApi();
        } else {
            this.apiImage = new ImageOpenAiApi();
        }

        this.context = {
            init: true,
            stage: 'init',
            stageDescription: this.api.initialMessage
        }
    }

    async getData() { 
        const data = await super.getData();

        let foldersArray = ActorAi.getFolderOptions(game.folders);
        let foldersFlat = foldersArray.flat(Infinity);
        let uniqueOptions = Array.from(new Map(foldersFlat.map(option => [option.value, option])).values());
        
        data.context = this.context;
        data.folders = uniqueOptions;
        data.actorInput = this.actorInput;
        if (!this.apiInput) {
            this.apiInput = new InputModel(this.object.input);
        }

        if (this.context.init) {
            this.context.init = false;
            this.refresh({stage: "initial", message: game.i18n.localize("AActors.OpenAI.InitialMessage")}).then(async () => {
                let postData = this.api.prepareBasicPrompt();
                let stages = this.apiDetails.stages;
                for (let stage of stages) {
                    await this.apiDetails.updateStageInputModel(stage, this.apiInput);
                }
                await this.api.updateInputModelWithImagePrompt(this.apiInput);
    
                let actorInput = await this.api.generateDescription(postData, this.apiInput);                
                await this.apiDetails.normalizeResponse(actorInput);
                this.actorInput = foundry.utils.mergeObject(this.actorInput, actorInput);
                this.actorInput.html = this.apiDetails.prettyPrintNpc(this.actorInput);

                
                await this.refresh({stage: "image", message: game.i18n.localize("AActors.OpenAI.StageImage")});
                await this.apiImage.generateImage(this.actorInput.imagePrompt, this.actorInput);
                
                await this.refresh({stage: "final", message: ""});
            });
        }
        return data;
    }
    
    async _render(...args) {
        await super._render(args);
    }

    activateListeners(html) {
        super.activateListeners(html);
  
        html.on('click', "[data-action='save']", this._handleSaveButtonClick.bind(this));
        html.on('click', "[data-action='generate']", this._handleGenerateImageButtonClick.bind(this));
        html.on('click', "[data-action='upscale']", this._handleUpscaleButtonClick.bind(this));
    }

    async refresh(stage) {
        this.context.stage = stage.stage;
        this.context.stageDescription = stage.message;
        this.render(true);
    }

    async _handleGenerateImageButtonClick(event, data) {
        let prompt = this.form['actorInput.imagePrompt'].value;
        
        let actorInput = foundry.utils.deepClone(this.actorInput);
        actorInput.imagePrompt = prompt;

        await this.refresh({stage: "image", message: game.i18n.localize("AActors.OpenAI.StageImage")});
        await this.apiImage.generateImage(prompt, this.actorInput);
        await this.refresh({stage: "final", message: ""});
    }

    async _handleUpscaleButtonClick(event, data) {
        let messageId = event.currentTarget.parentElement.dataset['messageId']
        let upscaleCustomId = event.currentTarget.dataset['customId']

        await this.refresh({stage: "image", message: game.i18n.localize("AActors.OpenAI.StageImage")});

        let response = await this.apiImage.upscale(messageId, upscaleCustomId);
        delete this.actorInput.upscale;
        delete this.actorInput.messageId;
        delete this.actorInput.upsacelers
        this.actorInput = foundry.utils.mergeObject(this.actorInput, response.actorInput);

        await this.refresh({stage: "final", message: ""});
    }

    async _handleSaveButtonClick(event, data) {
        let folderUuid = this.form.folder.value;
        
        let folder = game.folders.get(folderUuid);
        let actorData = await this.apiDetails.prepareActorData(this.actorInput)
        actorData.folder = folder;

        if (this.actorInput.imageBase64 != null) {
            let nameString = (actorData.name).replace(/\s+/g, '');
            let newImg = await ActorAi.saveImageToFileSystem(this.actorInput.imageBase64, nameString);
            actorData.img = newImg.path;
        }

        let newActor = await Actor.create(actorData);
        let actor = game.actors.get(newActor.id);
        let items = await this.apiDetails.prepareActorItemsData(this.actorInput);
        for (let item of items) {
            await actor.createEmbeddedDocuments("Item", [item]);
        }
    }
}