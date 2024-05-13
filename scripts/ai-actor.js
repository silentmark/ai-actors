
class aiActor {
    async createAiActor(aiActor) {
        let newActor = await Actor.create({
            name: "New Test Actor",
            type: "npc",
            img: "icons/svg/mystery-man.svg"
        });

        return newActor;
    }

    static getLastUpdate() {
        return this.lastUpdate;
    }

    static setLastUpdate(lastUpdate) {
        this.lastUpdate = lastUpdate;
    }

    static setNPC(object) {
        this.npc = object;
        this.errors = {};
    }

    static setDescription(object) {
        this.description = object;
    }

    static setImg(src) {
        this.imgSrc = src;
    }

    static callLlmLib(message) {
        return llmLib.callLlm(message);
    }

    static makePretty(ai_object) {
        if(ai_object.npc.name == undefined) {
            return this.errorMessage("Error: JSON file not valid. Please try again.");
        }
        let multiplayer = 10;

        ai_object.npc.system.characteristics.weaponSkill.value = Number.parseInt(ai_object.npc.system.characteristics.weaponSkill.value) + Math.floor(Math.random() * multiplayer);
        ai_object.npc.system.characteristics.ballisticSkill.value = Number.parseInt(ai_object.npc.system.characteristics.ballisticSkill.value) + Math.floor(Math.random() * multiplayer);
        ai_object.npc.system.characteristics.strength.value = Number.parseInt(ai_object.npc.system.characteristics.strength.value) + Math.floor(Math.random() * multiplayer);
        ai_object.npc.system.characteristics.toughness.value = Number.parseInt(ai_object.npc.system.characteristics.toughness.value) + Math.floor(Math.random() * multiplayer);
        ai_object.npc.system.characteristics.initiative.value = Number.parseInt(ai_object.npc.system.characteristics.initiative.value) + Math.floor(Math.random() * multiplayer);
        ai_object.npc.system.characteristics.agility.value = Number.parseInt(ai_object.npc.system.characteristics.agility.value) + Math.floor(Math.random() * multiplayer);
        ai_object.npc.system.characteristics.dexterity.value = Number.parseInt(ai_object.npc.system.characteristics.dexterity.value) + Math.floor(Math.random() * multiplayer);
        ai_object.npc.system.characteristics.intelligence.value = Number.parseInt(ai_object.npc.system.characteristics.intelligence.value) + Math.floor(Math.random() * multiplayer);
        ai_object.npc.system.characteristics.willPower.value = Number.parseInt(ai_object.npc.system.characteristics.willPower.value) + Math.floor(Math.random() * multiplayer);
        ai_object.npc.system.characteristics.fellowship.value = Number.parseInt(ai_object.npc.system.characteristics.fellowship.value) + Math.floor(Math.random() * multiplayer);

        let html = ``;
        html += `<h1>${ ai_object.npc.name }</h1>`;
        html += `<hr>`;
        html += `
        <div class="ability-block">
            <table style="height:34px" border="1">
                <tbody>
                    <tr style="height:17px">
                        <td style="height:17px;width:60px;text-align:center">WW</td>
                        <td style="height:17px;width:60px;text-align:center">US</td>
                        <td style="height:17px;width:60px;text-align:center">S</td>
                        <td style="height:17px;width:61px;text-align:center">Wt</td>
                        <td style="height:17px;width:61px;text-align:center">I</td>
                        <td style="height:17px;width:61px;text-align:center">Zw</td>
                        <td style="height:17px;width:61px;text-align:center">Zr</td>
                        <td style="height:17px;width:61px;text-align:center">Int</td>
                        <td style="height:17px;width:61px;text-align:center">SW</td>
                        <td style="height:17px;width:61px;text-align:center">Ogd</td>
                    </tr>
                        <tr style="height:17px">                        
                        <td style="height:17px;width:60px;text-align:center">${ai_object.npc.system.characteristics.weaponSkill.value}</td>
                        <td style="height:17px;width:60px;text-align:center">${ai_object.npc.system.characteristics.ballisticSkill.value}</td>
                        <td style="height:17px;width:61px;text-align:center">${ai_object.npc.system.characteristics.strength.value}</td>
                        <td style="height:17px;width:61px;text-align:center">${ai_object.npc.system.characteristics.toughness.value}</td>
                        <td style="height:17px;width:61px;text-align:center">${ai_object.npc.system.characteristics.initiative.value}</td>
                        <td style="height:17px;width:61px;text-align:center">${ai_object.npc.system.characteristics.agility.value}</td>
                        <td style="height:17px;width:61px;text-align:center">${ai_object.npc.system.characteristics.dexterity.value}</td>
                        <td style="height:17px;width:61px;text-align:center">${ai_object.npc.system.characteristics.intelligence.value}</td>
                        <td style="height:17px;width:61px;text-align:center">${ai_object.npc.system.characteristics.willPower.value}</td>
                        <td style="height:17px;width:60px;text-align:center">${ai_object.npc.system.characteristics.fellowship.value}</td>
                    </tr>
                </tbody>
            </table>
        </div>
        <hr>
        `;

        html += `<p><strong>Rasa:</strong> ${ai_object.npc.system.details?.species?.value}, <strong>Płeć:</strong> ${ai_object.npc.system.details?.gender?.value}</strong>, <strong>Wiek:</strong> ${ai_object.npc.system.details.age?.value}</p>`;
        html += `<p><strong>Wzrost:</strong> ${ai_object.npc.system.details?.height?.value}, <strong>Waga:</strong> ${ai_object.npc.system.details?.weight?.value} <strong>Oczy:</strong> ${ai_object.npc.system.details?.eyes?.value}, <strong>Włosy:</strong> ${ai_object.npc.system.details?.hair?.value} </p>`;
        html += `<p><strong>Biografia:</strong> ${ai_object.npc.system.details?.biography?.value}\n<br></p>`;
        html += `<p><strong>Opis:</strong> ${ai_object.npc.system.details?.description?.value} </p>`;
        html += `<p><strong>Profesje:</strong><ul>`;
        for (let i of ai_object.npc.careers) {
            html += `<li><a class="content-link" draggable="true" data-id="null" data-uuid="${i.uuid}" data-tooltip=""><i class="fas fa-unlink"></i>${i.name}</a></li>`;
        }
        html += `</ul></p>`;
        html += `<p><strong>Talenty:</strong><ul>`;
        for (let i of ai_object.npc.talents) {
            html += `<li><a class="content-link" draggable="true" data-id="null" data-uuid="${i.uuid}" data-tooltip=""><i class="fas fa-unlink"></i>${i.name}</a></li>`;
        }
        html += `</ul></p>`;
        return html;
    }

    static async getItemList(array) {
        let actionsItemsList = [];
        let allPacks = game.packs;
        let releventPacks = [];

        allPacks.forEach((i) => {
            let id = i.metadata.id;
            if(id.includes("items") || id.includes("features")) {
                releventPacks.push(i);
            }
        });

        releventPacks.push(game.items);

        if(Array.isArray(array)) {
            // Get items that are close to what the AI gives you
            for(let i in array) {
                if(!!array[i]?.name) {
                    let words = (array[i]?.name).split(" ");
                    let foundItems = [];

                    // Split the words to look at individually
                    words.forEach((word) => {
                        releventPacks.forEach((pack) => {
                            let wordItems = pack.search({query: word});

                            let exactMatch = wordItems.find(wi => wi.name == word);

                            if(!!exactMatch) {
                                wordItems = [exactMatch];
                            }

                            foundItems = foundItems.concat(wordItems);
                        })
                    })
    
                    releventPacks.forEach((pack) => {
                        foundItems = foundItems.concat(pack.search({query: array[i].name}));
                    })
    
                    // Find exact match for both/all words?
                    let exactMatch = foundItems.find(i => i.name == array[i]?.name);
                    if(!!exactMatch) {
                        foundItems = exactMatch;
                    }
                    // If there is more than one item in the list, run through the levenschtein algorithm to find the best match
                    if(foundItems.length > 1) {
                        let min = 5;
                        let bestMatch = null;
    
                        foundItems.forEach((item) => {
                            if(item.type == array[i].type) {
                                let distance = this.levenshtein(item.name, array[i].name);
                                if(distance < min) {
                                    min = distance;
                                    bestMatch = item;
                                    console.log(min + " " + bestMatch.name);
                                }
                            }
                        })
                        if(bestMatch != null) {
                            foundItems = [bestMatch];
                        }
                        else {
                            foundItems = [];
                        }
                    }
    
                    // If there is something in foundItems, put it in actionsItemsList
                    if(foundItems.length != 0) {
                        actionsItemsList.push(foundItems);
                    }
                    // If there is nothing, run the Levenschtein algorithm on entire compendium to find close match
                    else {
                        // TODO: Do Levenschtein on entire compendium when we have no matches
                        let item = array[i];
                        let newItem = await this.createItem(item);
                        actionsItemsList.push([newItem]);
                    }
    
                }
            }
        }
        else {
            if(!!array?.name) {
                let words = (array?.name).split(" ");
                let foundItems = [];

                // Split the words to look at individually
                words.forEach((word) => {
                    releventPacks.forEach((pack) => {
                        let wordItems = pack.search({query: word});
                        let exactMatch = wordItems.find(wi => wi.name == word);

                        if(!!exactMatch) {
                            wordItems = [exactMatch];
                        }
                        foundItems = foundItems.concat(wordItems);
                    })
                })

                releventPacks.forEach((pack) => {
                    foundItems = foundItems.concat(pack.search({ query: array.name }));
                })

                // Find exact match for both/all words?
                let exactMatch = foundItems.find(i => i.name == array?.name);
                if(!!exactMatch) {
                    foundItems = [exactMatch];
                }
                // If there is more than one item in the list, run through the levenschtein algorithm to find the best match
                if(foundItems.length > 1) {
                    let min = 10000;
                    let bestMatch = null;

                    foundItems.forEach((item) => {
                        if(item.type == i.type) {
                            let distance = this.levenshtein(item.name, array.name);
                            if(distance < min) {
                                min = distance;
                                bestMatch = item;
                                console.log(min + " " + bestMatch.name);
                            }
                        }
                    })
                    if(bestMatch != null) {
                        foundItems = [bestMatch];
                    }
                    else {
                        foundItems = [];
                    }
                }

                // If there is something in foundItems, put it in actionsItemsList
                if(foundItems.length != 0) {
                    actionsItemsList.push(foundItems);
                }
                // If there is nothing, run the Levenschtein algorithm on entire compendium to find close match
                else {
                    // TODO: Do Levenschtein on entire compendium when we have no matches
                    let item = array;
                    let newItem = await this.createItem(item);
                    actionsItemsList.push([newItem]);
                }

            }
        }
        return actionsItemsList;
    }

    static async getSpellList(array) {
        let spellList = [];
        let spellsPack = game.packs.get("dnd5e.spells");
        let allPacks = game.packs;
        let releventPacks = [];

        allPacks.forEach((i) => {
            let id = i.metadata.id;
            if(id.includes("spells")) {
                releventPacks.push(i);
            }
        });

        for(let element in array) {
            array[element].forEach(async (i) => {
                let words = (i).split(" ");
                let foundItems = [];
                // Split the words to look at individually
                words.forEach((word) => {
                    releventPacks.forEach((spellPack) => {
                        let wordItems = spellPack.search({query: word});
                        let exactMatch = wordItems.find(wi => wi.name == word);
                        // If it finds an exact match, add it to our items 
                        if(!!exactMatch) {
                            wordItems = [exactMatch];
                        }
                        // Add what we've got to foundItems
                        foundItems = foundItems.concat(wordItems);
                    })
                })

                releventPacks.forEach((spellPack) => {
                    foundItems = foundItems.concat(spellPack.search({ query: i }));
                })

                // Find exact match for both/all words?
                let exactMatch = foundItems.find(j => (j.name).toLowerCase() == i.toLowerCase());
                if(!!exactMatch) {
                    foundItems = exactMatch;
                }
                // If there is more than one item in the list, run through the levenschtein algorithm to find the best match
                if(foundItems.length > 1) {
                    let min = 10000;
                    let bestMatch = null;
    
                    foundItems.forEach((item) => {
                        if(item.type == i.type) {
                            let distance = this.levenshtein(item, i);
                            if(distance < min) {
                                min = distance;
                                bestMatch = item;
                                console.log(min + " " + bestMatch.name);
                            }
                        }
                    })
                    foundItems = bestMatch;
                }
    
                // If there is something in foundItems, put it in actionsItemsList
                if(foundItems.length != 0) {
                    spellList.push(foundItems);
                }
                // If there is nothing, run the Levenschtein algorithm on entire compendium to find close match
                else {
                    // TODO: Do Levenschtein on entire compendium when we have no matches
                    let item = i;
                    let newItem = await this.createItem(item);
                    spellList.push([newItem]);
                }
            })
        }
        return spellList;
    }

    static async createEquipItems(list, actor) {
        list.forEach((element) => {
            element.forEach(async (i) => {
                let item = await fromUuid(i.uuid);
                // IMPORTANT this MUST be AWAITED
                await actor.createEmbeddedDocuments("Item", [item]);

                let addedItem = actor.items.find(e => e.name === i.name);
                let equipped = {
                    system: {
                        equipped: true
                    }
                }
                await addedItem.update(equipped);
            })
        })
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

    static removeDuplicates(data) {
        return [...new Set(data)];
    }

    static errorMessage(err) {
        const error_message = game.i18n.localize('AI-ACTOR.errors.generic');
        let ai_response = document.getElementById('ai-inner-response');
        let send_message_btn = document.getElementById('send_message_btn');
        let make_actor_btn = document.getElementById('make_ai_actor_btn');
        let loaderElement = document.getElementById('ai-loader');
        
        ai_response.innerHTML = err;
        ai_response.innerHTML += "<p>" + error_message + "</p>";
        send_message_btn.removeAttribute("disabled");
        make_actor_btn.removeAttribute("disabled");
        loaderElement.style.display = 'none';
    }

    static clear() {
        let ai_response = document.getElementById('ai-inner-response');
        let loaderElement = document.getElementById('ai-loader');
        loaderElement.style.removeProperty('display');
        let imgHolder = document.getElementById('ai-img-gen');
        let regenImg = document.getElementById('regenerate_img');
        let editDescription = document.getElementById('editDescription');
        
        ai_response.innerHTML = "";
        imgHolder.style.display = "none";
        regenImg.style.display = "none";
        editDescription.style.display = "none";
    }

    static async createItem(itemData) {
        let item = {
            "name": itemData?.name,
            "system": {
                "description": {
                    "value": itemData?.description
                }
            },
            "type": itemData?.type
        }

        return await Item.create(item);
    }

    /* https://stackoverflow.com/questions/18516942/fastest-general-purpose-levenshtein-javascript-implementation */
    static levenshtein(s, t) {
        if (s === t) {
            return 0;
        }
        var n = s.length, m = t.length;
        if (n === 0 || m === 0) {
            return n + m;
        }
        var x = 0, y, a, b, c, d, g, h, k;
        var p = new Array(n);
        for (y = 0; y < n;) {
            p[y] = ++y;
        }
    
        for (; (x + 3) < m; x += 4) {
            var e1 = t.charCodeAt(x);
            var e2 = t.charCodeAt(x + 1);
            var e3 = t.charCodeAt(x + 2);
            var e4 = t.charCodeAt(x + 3);
            c = x;
            b = x + 1;
            d = x + 2;
            g = x + 3;
            h = x + 4;
            for (y = 0; y < n; y++) {
                k = s.charCodeAt(y);
                a = p[y];
                if (a < c || b < c) {
                    c = (a > b ? b + 1 : a + 1);
                }
                else {
                    if (e1 !== k) {
                        c++;
                    }
                }
    
                if (c < b || d < b) {
                    b = (c > d ? d + 1 : c + 1);
                }
                else {
                    if (e2 !== k) {
                        b++;
                    }
                }
    
                if (b < d || g < d) {
                    d = (b > g ? g + 1 : b + 1);
                }
                else {
                    if (e3 !== k) {
                        d++;
                    }
                }
    
                if (d < g || h < g) {
                    g = (d > h ? h + 1 : d + 1);
                }
                else {
                    if (e4 !== k) {
                        g++;
                    }
                }
                p[y] = h = g;
                g = d;
                d = b;
                b = c;
                c = a;
            }
        }
    
        for (; x < m;) {
            var e = t.charCodeAt(x);
            c = x;
            d = ++x;
            for (y = 0; y < n; y++) {
                a = p[y];
                if (a < c || d < c) {
                    d = (a > d ? d + 1 : a + 1);
                }
                else {
                    if (e !== s.charCodeAt(y)) {
                        d = c + 1;
                    }
                    else {
                        d = c;
                    }
                }
                p[y] = d;
                c = a;
            }
            h = d;
        }
    
        return h;
    }

    static getFolderOptions(folders, parentId = null) {
        let options = [];
        folders.forEach(folder => {
            let depthString = "";
            if(folder.type == 'Actor') {
                for(let i=1; i < folder.depth; i++) {
                    depthString += "-- ";
                }
                if(folder.children.length > 0 && parentId == null) {
                    let option = new Option(depthString + folder.name, folder.id);
                    options.push(option);
                    let childrenArray = folder.children.map(child => child.folder);
                    options.push(this.getFolderOptions(childrenArray, folder.id));
                }
                else if(parentId != null) {
                    let option = new Option(depthString + folder.name, folder.id);
                    options.push(option);
                }
            }
        })
        return options;
    }

}