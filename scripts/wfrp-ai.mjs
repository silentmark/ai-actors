
import WfrpOpenAiApi from './api/wfrp-open-ai-api.mjs';
import WfrpOpenAiDetailsApi from './api/wfrp-open-ai-details.mjs';
import { Constants } from "./wfrp.mjs";

/* FormApplication for ai actors */
export default class WfrpAi extends FormApplication {
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
            classes: defaults.classes.concat(["wfrp-ai"])
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
        this.api = new WfrpOpenAiApi();
        this.apiDetails = new WfrpOpenAiDetailsApi();

        this.context = {
            init: true,
            stage: 'init',
            stageDescription: this.api.initialMessage
        }
    }

    async getData() { 
        const data = await super.getData();

        let foldersArray = WfrpAi.getFolderOptions(game.folders);
        let foldersFlat = foldersArray.flat(Infinity);
        let uniqueOptions = Array.from(new Map(foldersFlat.map(option => [option.value, option])).values());
        
        data.context = this.context;
        data.folders = uniqueOptions;
        data.npc = this.actorInput;

        if (this.context.init) {
            this.context.init = false;
            this.api.generateDescription(this.object.input).then(async (response) => {
                let stages = this.apiDetails.stages;
                let request = response;
                request.npc.html = request.npc.description;
                for (let stage of stages) {
                    await this.refresh(stage, request.npc);
                    request = await this.apiDetails.generateDetails(stage, request);
                }
                await this.refresh({stage: "final", message: ""}, request.npc);
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
    }

    async refresh(stage, npc) {
        this.context.stage = stage.stage;
        this.context.stageDescription = stage.message;
        this.actorInput = foundry.utils.mergeObject(this.actorInput, npc);
        this.render(true);
    }

    async _handleSaveButtonClick(event, data) {
        let folderUuid = this.form.folder.value;
        
        let folder = game.folders.get(folderUuid);
        let actorData = await this.api.prepareActorData(this.actorInput)
        actorData.folder = folder;

        if (this.actorInput.imageBase64 != null) {
            let nameString = (actorData.name).replace(/\s+/g, '');
            let newImg = await WfrpAi.saveImageToFileSystem(this.actorInput.imageBase64, nameString);
            actorData.img = newImg.path;
        }

        let newActor = await Actor.create(actorData);
        let actor = game.actors.get(newActor.id);
        let items = await this.api.prepareActorItemsData(this.actorInput);
        for (let item of items) {
            await actor.createEmbeddedDocuments("Item", [item]);
        }
    }
}