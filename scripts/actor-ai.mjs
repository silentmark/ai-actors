
import ActorAiOpenAiApi from './api/actor-ai-open-ai-api.mjs';
import ActorAiImagePopup from './actor-ai-image-popup.mjs';
import WfrpOpenAiDetailsApi from './api/wfrp-open-ai-details.mjs';
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

    static async saveImageToFileSystem(input, path) {

        if (!path.includes('.png')) {
            path = path + '.png';
        }
        let myBlob = input;
        if (input.constructor.name !== 'Blob') {

            // Convert to Blob
            const byteCharacters = atob(input);
            const byteArrays = [];

            for (let i = 0; i < byteCharacters.length; i++) {
                byteArrays.push(byteCharacters.charCodeAt(i));
            }

            const byteArray = new Uint8Array(byteArrays);
            myBlob = new Blob([byteArray], { type: "image/png" });
        }
        const imageFile = new File([myBlob], path, {type: myBlob.type});
        const folder = game.settings.get(Constants.ID, Constants.imageFolderLocation);
        try {
            await FilePicker.createDirectory("data", folder);
        }
        catch {}
        const uploadResult = await FilePicker.upload("data", folder, imageFile, {}, {notify: true});
        return uploadResult;
    }

    constructor(...args) {  
        super(...args);

        this.actor = null;
        this.actorInput = args[0];
        this.api = new ActorAiOpenAiApi();
        this.apiDetails = new WfrpOpenAiDetailsApi();
    
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

        let foldersArray = [];
        const stack = [...game.folders.filter(x=>x.type == 'Actor' && x.depth == 1)];
        
        while (stack.length > 0) {
            const folder = stack.pop();
            const depthString = "-- ".repeat(folder.depth - 1);
            foldersArray.push({ name: depthString + folder.name, value: folder.id });
            
            if (folder.children.length > 0) {
                stack.push(...folder.children.map(x => x.folder));
            }
        }
        
        let foldersFlat = foldersArray.flat(Infinity);
        let uniqueOptions = Array.from(new Map(foldersFlat.map(option => [option.value, option])).values());
        
        data.context = this.context;
        data.folders = uniqueOptions;
        data.actorInput = this.actorInput;
        if (!this.apiInput) {
            this.apiInput = new InputModel(this.object.textInput);
        }

        if (this.context.init) {
            this.context.init = false;
            this.refresh({stage: "initial", message: game.i18n.localize("AActors.OpenAI.InitialMessage")}).then(async () => {
                let postData = this.api.prepareBasicPrompt();
                let stages = this.apiDetails.stages;
                for (let stage of stages) {
                    await this.apiDetails.updateStageInputModel(stage, this.apiInput, this.actorInput);
                }
                await this.api.updateInputModelWithImagePrompt(this.apiInput, this.actorInput);
    
                const SYSTEM_PROMPT = game.settings.get(Constants.ID, ActorAiOpenAiApi.systemPromptKey); 
                let noOfSentences = 10;
                switch (this.actorInput.complexity) {
                    case 'simple':
                        noOfSentences = 5;
                        break;
                    case 'medium':
                        noOfSentences = 10;
                        break;
                    case 'complex':
                        noOfSentences = 20;
                        break;
                }

                let technicalPrompt = game.i18n.localize("AActors.OpenAI.TechnicalSystemPrompt")
                        .replaceAll('<<noOfSentences>>', noOfSentences.toString())
                        .replaceAll('<<noOfSentencesHalved>>', (Math.ceil(noOfSentences / 2)).toString());
                let jsonInput = JSON.stringify(this.apiInput.JsonFormat);
                postData.messages = [
                  { "role": "system", "content": SYSTEM_PROMPT + "\n" + technicalPrompt + "\n" + jsonInput}, 
                ];
                let actorInput = await this.api.generateDescription(postData, this.apiInput, this.actorInput);
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
        html.on('click', ".actor-ai-img-gen", this._handleImagePopup.bind(this));
    }

    async refresh(stage) {
        this.context.stage = stage.stage;
        this.context.stageDescription = stage.message;
        this.render(true);
    }

    async _handleImagePopup(event, data) {
        new ActorAiImagePopup({ image: this.actorInput.imageSrc}).render(true);
    }

    async _handleGenerateImageButtonClick(event, data) {
        let prompt = this.form['actorInput.imagePrompt'].value;        
        this.actorInput.imagePrompt = prompt;

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
        delete this.actorInput.upscalers
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
            nameString += "-" + (Math.random() + 1).toString(36).substring(3);
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