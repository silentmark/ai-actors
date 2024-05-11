
class aiActorMessageHistory extends FormApplication {
    static get defaultOptions() {
        const defaults = super.defaultOptions;
        const title = game.i18n.localize('AI-ACTOR.msg_hist');
      
        const overrides = {
            // height: 'auto',
            width: '442',
            id: 'ai-actor-msg-hist',
            template: aiActors.TEMPLATES.AIHIST,
            title: title,
            userId: game.userId,
            resizable: true,
            //closeOnSubmit: false, // do not close when submitted
            //submitOnChange: true, // submit when any input changes
        };
      
        const mergedOptions = foundry.utils.mergeObject(defaults, overrides);
        
        return mergedOptions;
    }

    async getData(options) {
        let myMessages = messageHistory.allMessages();
        return { messages: myMessages };
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
            case "unroll": {
                event.currentTarget.classList.toggle("active");
                const content = event.currentTarget.nextElementSibling;
                if(content.style.display === "block") {
                    content.style.display = "none";
                }
                else {
                    content.style.display = "block";
                }
                break;
            }

            case 'regenerate_img': {
                const characterId = (event.target.dataset.characterId).replace(" ", "");
                /* Get HTML elements*/
                // const imgDesc = aiActor.description;
                let imgHolder = document.getElementById(characterId + "-img");
                let loading = document.getElementById(characterId + '-ai-img-loading');
                let regenImg = document.getElementById('regenerate_img');
                let descriptionTextarea = document.getElementById(characterId + "-txt").value;

                // /* Set HTML Elements */
                regenImg.setAttribute("disabled", "disabled");
                imgHolder.style.display = 'none';
                loading.classList.add('loader');

                // /* Call Dall-E 3 */
                let imgGen = await llmLib.callDallE(descriptionTextarea);

                // /* Reset HTML Elements */
                loading.classList.remove('loader');
                imgHolder.style.display = 'block';
                imgHolder.src = "data:image/png;base64," + imgGen;
                regenImg.removeAttribute("disabled");
                // aiActor.setImg(imgGen);
                break;
            }

            case 'edit_description': {
                const characterId = (event.target.dataset.characterId).replace(" ", "");
                let descriptionTextarea = document.getElementById(characterId + "-txt");

                if(descriptionTextarea.style.display === "block") {
                    descriptionTextarea.style.display = "none";
                }
                else {
                    descriptionTextarea.style.display = "block";
                }
                break;
            }

            case 'make_ai_actor': {
                let myMessages = await messageHistory.allMessages();
                const characterId = (event.target.dataset.characterId);
                const characterIdNoWhitespace = characterId.replace(" ", "");
                let ai_object = myMessages.find((npc) => npc[0].name == characterId);
                let imgHolder = (document.getElementById(characterIdNoWhitespace + "-img").src).split(",");
                ai_object[4] = imgHolder[1];

                /* Grab the actor variables */
                let npcActor = ai_object[0];
                let npcBonuses = ai_object[1];
                // This should be the image thing instead
                let imgSrc = imgHolder[1];
                
                let spellList = [];
                let nameString = (npcActor.name).replace(/\s+/g, '');

                // npcActor.folder = folder;

                /* Save the image if it exists */
                if(imgSrc != null) {
                    let newImg = await aiActor.saveImageToFileSystem(imgSrc, nameString);
                    npcActor.img = newImg.path;
                }

                // /* Create an actor */
                let newActor = await Actor.create(npcActor);
                let actor = game.actors.get(newActor.id);

                console.log(newActor);
                console.log(npcBonuses.bonus);

                /* Get items and spells lists */
                const actionsList = await aiActor.getItemList(npcBonuses.bonus.actions);
                const armorItemsList = await aiActor.getItemList(npcBonuses.bonus.armor);
                const itemsList = await aiActor.getItemList(npcBonuses.bonus.items);
                spellList = await aiActor.getSpellList(npcBonuses.bonus.spells);
                spellList = aiActor.removeDuplicates(spellList);

                /* Create, add, equip item to actor */
                aiActor.createEquipItems(actionsList, actor);
                aiActor.createEquipItems(armorItemsList, actor);
                aiActor.createEquipItems(itemsList, actor);

                /* Spells equip works a little differently */
                spellList.forEach(async (element) => {
                    let spell = await fromUuid(element.uuid);
                    await actor.createEmbeddedDocuments("Item", [spell]);
                })

                break;
            }

            default: {
                console.log("button pressed in message history");
            }
        }
    }
}

class messageHistory {
    static allMessages() {
        let messages = game.messages.filter(x=>x.flags?.aiMessage);
        return messages;
    }

    static allPrompts() {
        let messages = this.allMessages();
        let prompts = messages.filter(x=>x.flags.aiMessage == 'prompt').map(x => x.content.replace("!gpt ", "")); 
        return prompts;
    }

    static allResponses() {
        let messages = this.allMessages();
        let responses = messages.filter(x=>x.flags.aiMessage == 'response').map(x => x.content);
        return responses;
    }
}
