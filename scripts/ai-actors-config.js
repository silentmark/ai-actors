

/* FormApplication for ai actors */
class aiActorConfig extends FormApplication {
    static get defaultOptions() {
        const defaults = super.defaultOptions;
        const title = game.i18n.localize('AI-ACTOR.generate_actor');
      
        const overrides = {
            // height: 'auto',
            width: '700',
            height: '700',
            id: 'ai-actors',
            template: aiActors.TEMPLATES.AIACTORS,
            title: title,
            userId: game.userId,
            resizable: true,
            classes: defaults.classes.concat(["aiactor"])
            //closeOnSubmit: false, // do not close when submitted
            //submitOnChange: true, // submit when any input changes
        };
      
        const mergedOptions = foundry.utils.mergeObject(defaults, overrides);
        
        return mergedOptions;
    }

    async _updateObject(event, formData) {
        // aiActors.log(formData);
    }

    activateListeners(html) {
        super.activateListeners(html);
  
        html.on('click', "[data-action]", this._handleButtonClick.bind(this));
    }

    async _handleButtonClick(event) {
        const clickedElement = $(event.currentTarget);
        const action = clickedElement.data().action;

        // Which button was clicked
        switch (action) {

            /* SEND MESSAGE */ 
            case 'send_message': {
                aiActor.clear();
                /* Set HTML Elements */
                const IMG_GEN_SETTING = game.settings.get(`${aiActorSettings.ID}`, `${aiActorSettings.SETTINGS.IMAGE_GEN}`);
                let ai_response = document.getElementById('ai-inner-response');
                let loaderElement = document.getElementById('ai-loader');
                let imgHolder = document.getElementById('ai-img-gen');
                let send_message_btn = document.getElementById('send_message_btn');
                let make_actor_btn = document.getElementById('make_ai_actor_btn');
                let regenerate_img = document.getElementById('regenerate_img');
                let textarea = document.getElementById('image-textarea');
                let editDescription = document.getElementById('editDescription');
                let imgDesc = "";
                let html = "";

                /* Localization variables */
                const generating_character = game.i18n.localize('AI-ACTOR.generating_character');
                const generating_image = game.i18n.localize('AI-ACTOR.generating_image');

                /* Get User Input */
                let userMessage = document.getElementById('user-input').value;
                send_message_btn.setAttribute("disabled", "disabled");
                make_actor_btn.setAttribute("disabled", "disabled");

                /* Set HTML Elements*/
                ai_response.innerHTML = "<p>" + generating_character + "</p>";
                loaderElement.style.removeProperty('display');

                /* If userMessage is empty */
                if(userMessage.length == 0) {
                    userMessage = 'An interesting character';
                }

                /* Call Language Model */
                let ai_object = await llmLib.callLlm(userMessage);
                // let ai_message = llmLib.callPredetermined();

                /* Set HTML elements */
                ai_response.innerHTML = "<p>" + generating_image + "</p>";

                console.log(ai_object);

                /* Create html to display */
                try {
                    html = aiActor.makePretty(ai_object);
                }
                catch(err) {
                    aiActor.errorMessage(err);
                }
                
                // ai_object contains two JSON objects, one with the format for creating an actor, and one for holding information on actions & items
                aiActor.setLastUpdate(ai_object);
                aiActor.setNPC(ai_object.npc);

                // Foundry uses showdown to convert markdown to html
                /* Doing my own HTML conversion right now
                let converter = new showdown.Converter();
                let newHTML = converter.makeHtml(ai_message);
                */

                /* Get and Set the description to create an image */
                if(!!ai_object.dalle) {
                    aiActor.setDescription(ai_object.dalle);
                    imgDesc = ai_object.dalle
                    textarea.value = ai_object.dalle;
                }
                else {
                    aiActor.setDescription(ai_object.npc.system.details?.description?.value);
                    imgDesc = a_iobject.npc.system.details?.description?.value;
                    textarea.value = a_iobject.npc.system.details?.description?.value;
                }

                aiActor.setDescription(imgDesc);

                let imgGen;

                /* Call Dall-E 3 */
                if(IMG_GEN_SETTING) {
                    try {
                        imgGen = await llmLib.callDallE(imgDesc);
                    } catch(err) {
                        console.log(err);
                    }
                    // let imgGen = llmLib.callPredeterminedImg();
    
                    /* Set the image based on the description */
                    imgHolder.src = "data:image/png;base64," + imgGen;
                    aiActor.setImg(imgGen);
                }

                /* If the image doesn't generate, set it to default */
                if(imgGen == null) {
                    if(!IMG_GEN_SETTING) {
                        imgHolder.value = "Error creating image";
                        regenerate_img.style.display = "none";
                        imgHolder.style.display = "none";
                    }
                    else {
                        imgHolder.src = "icons/svg/mystery-man.svg";
                    }
                }

                ai_object.image = imgGen;
               
                /* Update HTML elements */
                imgHolder.style.display = 'block';
                loaderElement.style.display = 'none';
                regenerate_img.style.display = 'block';
                ai_response.innerHTML = html;
                send_message_btn.removeAttribute("disabled");
                make_actor_btn.removeAttribute("disabled");
                editDescription.style.display = 'block';
               
                break;
          }
          
            /* MAKE ACTOR */
            case 'make_ai_actor': {
            if(aiActor.getLastUpdate() === undefined) {
                // Don't do anything if no messages have been sent or created
                break;
            }
            else {
                /* Grab the folder to put in */
                let userSetFolder = document.getElementById('folders').value;
                let folder = game.folders.get(userSetFolder);
                /* Grab the actor variables */
                let npcActor = aiActor.npc;
                let imgSrc = aiActor.imgSrc;
                
                let nameString = (npcActor.name).replace(/\s+/g, '');
                npcActor.folder = folder;

                /* Save the image if it exists */
                if(imgSrc != null) {
                    let newImg = await aiActor.saveImageToFileSystem(imgSrc, nameString);
                    npcActor.img = newImg.path;
                }

                /* Create an actor */

                let char = npcActor.system.characteristics;
                char.ws = {initial: char.weaponSkill.value};
                char.bs = {initial: char.ballisticSkill.value};
                char.s = {initial: char.strength.value};
                char.t = {initial: char.toughness.value};
                char.i = {initial: char.initiative.value};
                char.ag = {initial: char.agility.value};
                char.dex = {initial: char.dexterity.value};
                char.int = {initial: char.intelligence.value};
                char.wp = {initial: char.willPower.value};
                char.fel = {initial: char.fellowship.value};

                npcActor.system.details.gmnotes = {value: "<p>" + npcActor.system.details.biography.value + "</p>"};
                npcActor.system.details.biography.value = "<p>" + npcActor.system.details.description.value + "</p>";

                let newActor = await Actor.create(npcActor);
                let actor = game.actors.get(newActor.id);

                console.log(newActor);

                for (let c of npcActor.careers) {
                    let career = await fromUuid(c.uuid);
                    await actor.createEmbeddedDocuments("Item", [career]);
                }

                for (let c of npcActor.talents) {
                    let career = await fromUuid(c.uuid);
                    await actor.createEmbeddedDocuments("Item", [career]);
                }
                
                break;
            }
            
            }

            case 'regenerate_img': {
                /* Get HTML elements*/
                const imgDesc = document.getElementById('image-textarea').value;
                let imgHolder = document.getElementById('ai-img-gen');
                let loading = document.getElementById('ai-img-loading');
                let regenImg = document.getElementById('regenerate_img');

                /* Set HTML Elements */
                regenImg.setAttribute("disabled", "disabled");
                imgHolder.style.display = 'none';
                loading.classList.add('loader');

                /* Call Dall-E 3 */
                let imgGen = await llmLib.callDallE(imgDesc);

                /* Reset HTML Elements */
                loading.classList.remove('loader');
                imgHolder.style.display = 'block';
                imgHolder.src = "data:image/png;base64," + imgGen;
                regenImg.removeAttribute("disabled");
                aiActor.setImg(imgGen);
                break;
            }

            case 'edit_description': {
                let descriptionTextarea = document.getElementById("image-textarea");

                if(descriptionTextarea.style.display === "block") {
                    descriptionTextarea.style.display = "none";
                }
                else {
                    descriptionTextarea.style.display = "block";
                }
                break;
            }
    
          default:
            aiActors.log(false, 'Invalid action detected', action);
        }
        
        aiActors.log(false, 'Button Clicked!', action);
    }
}