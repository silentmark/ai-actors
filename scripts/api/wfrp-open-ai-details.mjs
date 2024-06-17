import { Constants } from "../actor.mjs";
import InputModel from "../model/input-model.mjs";
import ActorAiOpenAiApi from "./actor-ai-open-ai-api.mjs"
import ImageMidJourneyApi from "./image-mj-api.mjs";

export default class WfrpOpenAiDetailsApi {
  
  static careers = null;
  static talents = null;

  get stages() {
    return [
      {stage: "characteristics", message: game.i18n.localize("AActors.WFRP.StageCharacteristics")},
      {stage: "careers", message: game.i18n.localize("AActors.WFRP.StageCareers")},
      {stage: "talents", message: game.i18n.localize("AActors.WFRP.StageTalents")}
    ];
  }

  async updateStageInputModel(stage, inputModel, actorInput) {
    if (WfrpOpenAiDetailsApi.careers === null) {
      WfrpOpenAiDetailsApi.careers = await game.wfrp4e.utility.findAll("career");
    }
    if (WfrpOpenAiDetailsApi.talents === null) {
      WfrpOpenAiDetailsApi.talents = await game.wfrp4e.utility.findAll("talent");
    }

    if (stage.stage === "characteristics") { 
      const statisticsQuery = game.i18n.localize("AActors.WFRP.StageCharacteristicsPrompt");
      inputModel.TextPrompt += "\n" + statisticsQuery;
      inputModel.JsonFormat.npc = inputModel.JsonFormat.npc || {};
      inputModel.JsonFormat.npc.characteristics = inputModel.JsonFormat.npc.characteristics || {};
      inputModel.JsonFormat.npc.characteristics.weaponSkill = 0;
      inputModel.JsonFormat.npc.characteristics.ballisticSkill = 0;
      inputModel.JsonFormat.npc.characteristics.strength = 0;
      inputModel.JsonFormat.npc.characteristics.toughness = 0;
      inputModel.JsonFormat.npc.characteristics.initiative = 0;
      inputModel.JsonFormat.npc.characteristics.agility = 0;
      inputModel.JsonFormat.npc.characteristics.dexterity = 0;
      inputModel.JsonFormat.npc.characteristics.intelligence = 0;
      inputModel.JsonFormat.npc.characteristics.willPower = 0;
      inputModel.JsonFormat.npc.characteristics.fellowship = 0;
      inputModel.JsonFormat.npc.name = "";
      inputModel.JsonFormat.npc.details = inputModel.JsonFormat.npc.details || {};
      inputModel.JsonFormat.npc.details.species = "";
      inputModel.JsonFormat.npc.details.gender = "";
      inputModel.JsonFormat.npc.details.age = "";
      inputModel.JsonFormat.npc.details.height = "";
      inputModel.JsonFormat.npc.details.weight = "";
      inputModel.JsonFormat.npc.details.hair = "";
      inputModel.JsonFormat.npc.details.eyes = "";
    } else if (stage.stage === "careers") {
      const careersMessage = game.i18n.localize("AActors.WFRP.StageCareersPrompt").replaceAll('<<noOfCareers>>', actorInput.noOfCareers);
      inputModel.TextPrompt += "\n" + careersMessage;
      inputModel.JsonFormat.npc = inputModel.JsonFormat.npc || {};
      inputModel.JsonFormat.npc.careers = ["career name"];
    } else if (stage.stage === "talents") {
      const talentsMessage = game.i18n.localize("AActors.WFRP.StageTalentsPrompt").replaceAll('<<noOfTalents>>', actorInput.noOfTalents);
      inputModel.TextPrompt += "\n" + talentsMessage;
      inputModel.JsonFormat.npc = inputModel.JsonFormat.npc || {};
      inputModel.JsonFormat.npc.talents = ["talent name"];
    }
  }

  async normalizeResponse(actorInput) {
    let npc = actorInput.npc;
    let originalCareers = foundry.utils.deepClone(npc.careers) ?? [];
    npc.careers = [];
    let originalTalents = foundry.utils.deepClone(npc.talents) ?? [];
    npc.talents = [];

    let modifier = 'Math.floor(Math.random() * 20)';
    
    npc.characteristics.weaponSkill = eval(modifier) + Number(npc.characteristics.weaponSkill);
    npc.characteristics.ballisticSkill = eval(modifier) + Number(npc.characteristics.ballisticSkill);
    npc.characteristics.strength = eval(modifier) + Number(npc.characteristics.strength);
    npc.characteristics.toughness = eval(modifier) + Number(npc.characteristics.toughness);
    npc.characteristics.initiative = eval(modifier) + Number(npc.characteristics.initiative);
    npc.characteristics.agility = eval(modifier) + Number(npc.characteristics.agility);
    npc.characteristics.dexterity = eval(modifier) + Number(npc.characteristics.dexterity);
    npc.characteristics.intelligence = eval(modifier) + Number(npc.characteristics.intelligence);
    npc.characteristics.willPower = eval(modifier) + Number(npc.characteristics.willPower);
    npc.characteristics.fellowship = eval(modifier) + Number(npc.characteristics.fellowship);

    if (parseInt(npc.details.height)) {
      npc.details.height = Math.floor(Math.random() * 20 - 10) + parseInt(npc.details.height) + " cm"
    }
    if (parseInt(npc.details.weight)) {
      npc.details.weight = Math.floor(Math.random() * 20 - 10) + parseInt(npc.details.weight) + " kg"
    }
    if (parseInt(npc.details.age)) {
      npc.details.age = Math.floor(Math.random() * 20 - 10) + parseInt(npc.details.age);
    }

    for (let career of originalCareers) {
      let co = WfrpOpenAiDetailsApi.careers.find(c => c.name === career || c.flags?.babele?.originalName === career);
      if (!co) {
        co = WfrpOpenAiDetailsApi.careers
          .map(c => { return { 
            name: c.name, 
            uuid: c.uuid, 
            index: c.flags?.babele?.originalName ? Math.min(WfrpOpenAiDetailsApi.levenshtein(c.name, career), WfrpOpenAiDetailsApi.levenshtein(c.flags.babele.originalName, career)) : WfrpOpenAiDetailsApi.levenshtein(c.name, career)
          }; })
          .filter(x => x.index < 10)
          .sort((a, b) => a.index - b.index)[0];
      }
      if (co) {
        npc.careers.push({name: co.name, uuid: co.uuid, originalName: career});
      } else {
        npc.careers.push({name: career, uuid: null});
      }
    }

    for (let talent of originalTalents) {
      let to = WfrpOpenAiDetailsApi.talents.find(t => t.name === talent || t.flags?.babele?.originalName === talent);
      if (!to) {
        to = WfrpOpenAiDetailsApi.talents
          .map(t => { return { 
            name: t.name, 
            uuid: t.uuid, 
            index: t.flags?.babele?.originalName ? Math.min(WfrpOpenAiDetailsApi.levenshtein(t.name, talent), WfrpOpenAiDetailsApi.levenshtein(t.flags.babele.originalName, talent)) : WfrpOpenAiDetailsApi.levenshtein(t.name, talent)
          }; })
          .filter(x => x.index < 10)
          .sort((a, b) => a.index - b.index)[0];
      }
      if (to) {
        npc.talents.push({name: to.name, uuid: to.uuid, originalName: talent});
      } else {
        npc.talents.push({name: talent, uuid: null});
      }
    }
  }

  prettyPrintNpc(actorInput) {
    let npc = actorInput.npc;
    let html = ``;
    html += `<h1>${npc.name}</h1>`;
    html += `<hr>`;
    html += `
    <div class="ability-block">
        <table style="height:34px" border="1">
            <tbody>
                <tr style="height:17px">
                    <td style="height:17px;width:60px;text-align:center">${game.i18n.localize("AActors.WFRP.WS")}</td>
                    <td style="height:17px;width:60px;text-align:center">${game.i18n.localize("AActors.WFRP.BS")}</td>
                    <td style="height:17px;width:60px;text-align:center">${game.i18n.localize("AActors.WFRP.S")}</td>
                    <td style="height:17px;width:61px;text-align:center">${game.i18n.localize("AActors.WFRP.T")}</td>
                    <td style="height:17px;width:61px;text-align:center">${game.i18n.localize("AActors.WFRP.I")}</td>
                    <td style="height:17px;width:61px;text-align:center">${game.i18n.localize("AActors.WFRP.Ag")}</td>
                    <td style="height:17px;width:61px;text-align:center">${game.i18n.localize("AActors.WFRP.Dex")}</td>
                    <td style="height:17px;width:61px;text-align:center">${game.i18n.localize("AActors.WFRP.Int")}</td>
                    <td style="height:17px;width:61px;text-align:center">${game.i18n.localize("AActors.WFRP.WP")}</td>
                    <td style="height:17px;width:61px;text-align:center">${game.i18n.localize("AActors.WFRP.Fel")}</td>
                </tr>
                    <tr style="height:17px">                        
                    <td style="height:17px;width:60px;text-align:center">${npc.characteristics?.weaponSkill}</td>
                    <td style="height:17px;width:60px;text-align:center">${npc.characteristics?.ballisticSkill}</td>
                    <td style="height:17px;width:61px;text-align:center">${npc.characteristics?.strength}</td>
                    <td style="height:17px;width:61px;text-align:center">${npc.characteristics?.toughness}</td>
                    <td style="height:17px;width:61px;text-align:center">${npc.characteristics?.initiative}</td>
                    <td style="height:17px;width:61px;text-align:center">${npc.characteristics?.agility}</td>
                    <td style="height:17px;width:61px;text-align:center">${npc.characteristics?.dexterity}</td>
                    <td style="height:17px;width:61px;text-align:center">${npc.characteristics?.intelligence}</td>
                    <td style="height:17px;width:61px;text-align:center">${npc.characteristics?.willPower}</td>
                    <td style="height:17px;width:60px;text-align:center">${npc.characteristics?.fellowship}</td>
                </tr>
            </tbody>
        </table>
    </div>
    <hr>
    `;

    html += `<p><strong>${game.i18n.localize("AActors.WFRP.Species")}:</strong> ${npc.details.species}, <strong>${game.i18n.localize("AActors.WFRP.Gender")}:</strong> ${npc.details.gender}</strong>, <strong>${game.i18n.localize("AActors.WFRP.Age")}:</strong> ${npc.details.age}</p>`;
    html += `<p><strong>${game.i18n.localize("AActors.WFRP.Height")}:</strong> ${npc.details.height}, <strong>${game.i18n.localize("AActors.WFRP.Weight")}:</strong> ${npc.details.weight} <strong>${game.i18n.localize("AActors.WFRP.Eyes")}:</strong> ${npc.details.eyes}, <strong>${game.i18n.localize("AActors.WFRP.Hair")}:</strong> ${npc.details.hair} </p>`;
    html += `<p><strong>${game.i18n.localize("AActors.WFRP.Description")}:</strong></p>`
    html += `<p>${actorInput.description.appearance}</p><hr>`;
    html += `<p>${actorInput.description.personality}</p><hr>`;
    html += `<p>${actorInput.description.biography}</p><hr>`;
    html += `<p>${actorInput.description.motivations}</p><hr>`;
    html += `<p>${actorInput.description.specificTraits}</p><hr>`;
    html += `</p>`;

    html += `<p><strong>${game.i18n.localize("AActors.WFRP.Careers")}:</strong><ul>`;
    if (npc.careers) {
      for (let i of npc.careers) {
        if (i.uuid) {
          html += `<li><a class="content-link" draggable="true" data-id="null" data-uuid="${i.uuid}" data-tooltip=""><i class="fas fa-unlink"></i>${i.name}</a> [${i.originalName}]</li>`;
        } else {
          html += `<li>${i.name}</li>`;
        }
      }
    }
    html += `</ul></p>`;
    html += `<p><strong>${game.i18n.localize("AActors.WFRP.Talents")}:</strong><ul>`;
    if (npc.talents) {
        for (let i of npc.talents) {
          if (i.uuid) {
            html += `<li><a class="content-link" draggable="true" data-id="null" data-uuid="${i.uuid}" data-tooltip=""><i class="fas fa-unlink"></i>${i.name}</a>[${i.originalName}]</li>`;
          } else {
            html += `<li>${i.name}</li>`;
          }
      }
    }
    html += `</ul></p>`;
    return html;
  }
    
  async prepareActorData(actorInput) {
    let npc = actorInput.npc;
    let data = {}; 
    data.name = npc.name;
    data.type = "npc";
    data.system = {};
    data.system.characteristics = {};
    data.system.characteristics.ws = { initial: npc.characteristics.weaponSkill };
    data.system.characteristics.bs = { initial: npc.characteristics.ballisticSkill };
    data.system.characteristics.s = { initial: npc.characteristics.strength };
    data.system.characteristics.t = { initial: npc.characteristics.toughness };
    data.system.characteristics.i = { initial: npc.characteristics.initiative };
    data.system.characteristics.ag = { initial: npc.characteristics.agility };
    data.system.characteristics.dex = { initial: npc.characteristics.dexterity };
    data.system.characteristics.int = { initial: npc.characteristics.intelligence };
    data.system.characteristics.wp = { initial: npc.characteristics.willPower };
    data.system.characteristics.fel = { initial: npc.characteristics.fellowship };

    data.system.details = {};
    data.system.details.species = { value: npc.details.species };
    data.system.details.gender = { value: npc.details.gender };
    data.system.details.haircolour = { value: npc.details.hair };
    data.system.details.eyecolour = { value: npc.details.eyes };
    data.system.details.age = { value: npc.details.age };
    data.system.details.height = { value: npc.details.height };
    data.system.details.weight = { value: npc.details.weight };
    let biography = ""; 
    biography += `<p>${actorInput.description.appearance}</p><hr>`;
    biography += `<p>${actorInput.description.personality}</p><hr>`;
    biography += `<p>${actorInput.description.biography}</p><hr>`;
    biography += `<p>${actorInput.description.motivations}</p><hr>`;
    biography += `<p>${actorInput.description.specificTraits}</p><hr>`;
    data.system.details.biography = { value: biography };
    return data;
  }
  
  async prepareActorItemsData(actorInput) {
    let npc = actorInput.npc;
    let data = [];
    for (let t of npc.talents) {
      let talent = await fromUuid(t.uuid);
      if (talent) {
        data.push(talent);
      }
    }
    for (let c of npc.careers) {
      let career = await fromUuid(c.uuid);
      if (career) {
        data.push(career);
      }
    }
    return data;
  }
  
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
}