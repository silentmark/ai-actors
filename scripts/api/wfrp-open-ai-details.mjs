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

  async updateStageInputModel(stage, inputModel) {
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
      inputModel.JsonFormat.npc.characteristics.weaponSkill = { value: 0 };
      inputModel.JsonFormat.npc.characteristics.ballisticSkill = { value: 0 };
      inputModel.JsonFormat.npc.characteristics.strength = { value: 0 };
      inputModel.JsonFormat.npc.characteristics.toughness = { value: 0 };
      inputModel.JsonFormat.npc.characteristics.initiative = { value: 0 };
      inputModel.JsonFormat.npc.characteristics.agility = { value: 0 };
      inputModel.JsonFormat.npc.characteristics.dexterity = { value: 0 };
      inputModel.JsonFormat.npc.characteristics.intelligence = { value: 0 };
      inputModel.JsonFormat.npc.characteristics.willPower = { value: 0 };
      inputModel.JsonFormat.npc.characteristics.fellowship = { value: 0 };
      inputModel.JsonFormat.npc.name = "";
      inputModel.JsonFormat.npc.details = inputModel.JsonFormat.npc.details || {};
      inputModel.JsonFormat.npc.details.species = { value: "" };
      inputModel.JsonFormat.npc.details.gender = { value: "" };
      inputModel.JsonFormat.npc.details.age = { value: "" };
      inputModel.JsonFormat.npc.details.height = { value: "" };
      inputModel.JsonFormat.npc.details.weight = { value: "" };
      inputModel.JsonFormat.npc.details.hair = { value: "" };
      inputModel.JsonFormat.npc.details.eyes = { value: "" };
    } else if (stage.stage === "careers") {
      //const careersMessage = game.i18n.format("AActors.WFRP.StageCareersPrompt", { careers: WfrpOpenAiDetailsApi.careers.map(career => career.name).join(", ")})
      const careersMessage = game.i18n.localize("AActors.WFRP.StageCareersPrompt");
      inputModel.TextPrompt += "\n" + careersMessage;
      inputModel.JsonFormat.npc = inputModel.JsonFormat.npc || {};
      inputModel.JsonFormat.npc.careers = [];
    } else if (stage.stage === "talents") {
      //const talentsMessage = game.i18n.format("AActors.WFRP.StageTalentsPrompt", { talents: WfrpOpenAiDetailsApi.talents.map(talent => talent.name).join(", ") });
      const talentsMessage = game.i18n.localize("AActors.WFRP.StageTalentsPrompt");
      inputModel.TextPrompt += "\n" + talentsMessage;
      inputModel.JsonFormat.npc = inputModel.JsonFormat.npc || {};
      inputModel.JsonFormat.npc.talents = [];
    }
  }

  async normalizeResponse(actorInput) {
    let npc = actorInput.npc;
    let originalCareers = foundry.utils.deepClone(npc.careers);
    npc.careers = [];

    npc.characteristics.weaponSkill.value = (Math.random() * 20 - 10) + Number(npc.characteristics.weaponSkill.value);
    npc.characteristics.ballisticSkill.value = (Math.random() * 20 - 10) + Number(npc.characteristics.ballisticSkill.value);
    npc.characteristics.strength.value = (Math.random() * 20 - 10) + Number(npc.characteristics.strength.value);
    npc.characteristics.toughness.value = (Math.random() * 20 - 10) + Number(npc.characteristics.toughness.value);
    npc.characteristics.initiative.value = (Math.random() * 20 - 10) + Number(npc.characteristics.initiative.value);
    npc.characteristics.agility.value = (Math.random() * 20 - 10) + Number(npc.characteristics.agility.value);
    npc.characteristics.dexterity.value = (Math.random() * 20 - 10) + Number(npc.characteristics.dexterity.value);
    npc.characteristics.intelligence.value = (Math.random() * 20 - 10) + Number(npc.characteristics.intelligence.value);
    npc.characteristics.willPower.value = (Math.random() * 20 - 10) + Number(npc.characteristics.willPower.value);
    npc.characteristics.fellowship.value = (Math.random() * 20 - 10) + Number(npc.characteristics.fellowship.value);

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

    let originalTalents = foundry.utils.deepClone(npc.talents);
    npc.talents = [];

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
                    <td style="height:17px;width:60px;text-align:center">${npc.characteristics?.weaponSkill.value}</td>
                    <td style="height:17px;width:60px;text-align:center">${npc.characteristics?.ballisticSkill.value}</td>
                    <td style="height:17px;width:61px;text-align:center">${npc.characteristics?.strength.value}</td>
                    <td style="height:17px;width:61px;text-align:center">${npc.characteristics?.toughness.value}</td>
                    <td style="height:17px;width:61px;text-align:center">${npc.characteristics?.initiative.value}</td>
                    <td style="height:17px;width:61px;text-align:center">${npc.characteristics?.agility.value}</td>
                    <td style="height:17px;width:61px;text-align:center">${npc.characteristics?.dexterity.value}</td>
                    <td style="height:17px;width:61px;text-align:center">${npc.characteristics?.intelligence.value}</td>
                    <td style="height:17px;width:61px;text-align:center">${npc.characteristics?.willPower.value}</td>
                    <td style="height:17px;width:60px;text-align:center">${npc.characteristics?.fellowship.value}</td>
                </tr>
            </tbody>
        </table>
    </div>
    <hr>
    `;

    html += `<p><strong>${game.i18n.localize("AActors.WFRP.Species")}:</strong> ${npc.details?.species?.value}, <strong>${game.i18n.localize("AActors.WFRP.Gender")}:</strong> ${npc.details?.gender?.value}</strong>, <strong>${game.i18n.localize("AActors.WFRP.Age")}:</strong> ${npc.details.age?.value}</p>`;
    html += `<p><strong>${game.i18n.localize("AActors.WFRP.Height")}:</strong> ${npc.details?.height?.value}, <strong>${game.i18n.localize("AActors.WFRP.Weight")}:</strong> ${npc.details?.weight?.value} <strong>${game.i18n.localize("AActors.WFRP.Eyes")}:</strong> ${npc.details?.eyes?.value}, <strong>${game.i18n.localize("AActors.WFRP.Hair")}:</strong> ${npc.details?.hair?.value} </p>`;
    html += `<p><strong>${game.i18n.localize("AActors.WFRP.Description")}:</strong> ${actorInput.description}<br></p>`;
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
    data.system.characteristics.ws = { initial: npc.characteristics.weaponSkill.value };
    data.system.characteristics.bs = { initial: npc.characteristics.ballisticSkill.value };
    data.system.characteristics.s = { initial: npc.characteristics.strength.value };
    data.system.characteristics.t = { initial: npc.characteristics.toughness.value };
    data.system.characteristics.i = { initial: npc.characteristics.initiative.value };
    data.system.characteristics.ag = { initial: npc.characteristics.agility.value };
    data.system.characteristics.dex = { initial: npc.characteristics.dexterity.value };
    data.system.characteristics.int = { initial: npc.characteristics.intelligence.value };
    data.system.characteristics.wp = { initial: npc.characteristics.willPower.value };
    data.system.characteristics.fel = { initial: npc.characteristics.fellowship.value };

    data.system.details = {};
    data.system.details.species = { value: npc.details.species.value };
    data.system.details.gender = { value: npc.details.gender.value };
    data.system.details.hair = { value: npc.details.hair.value };
    data.system.details.eyes = { value: npc.details.eyes.value };
    data.system.details.age = { value: npc.details.age.value };
    data.system.details.height = { value: npc.details.height.value };
    data.system.details.weight = { value: npc.details.weight.value };
    data.system.details.biography = { value: actorInput.description };
    
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