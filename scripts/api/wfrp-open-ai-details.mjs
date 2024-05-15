import { Constants } from "../wfrp.mjs";
import WfrpOpenAiApi from "./wfrp-open-ai-api.mjs";
import WfrpMJApi from "./wfrp-mj-api-image.mjs";

export default class WfrpOpenAiDetailsApi {
  _messages = [];
  

  get stages() {
    return [
      {stage: "characteristics", message: "Generowanie Cech Bohatera Niezależnego..."},
      {stage: "careers", message: "Generowanie Profesji Bohatera Niezależnego..."},
      {stage: "talents", message: "Generowanie Talentów Bohatera Niezależnego..."},
      {stage: "image", message: "Generowanie obrazu Bohatera Niezależnego..."}
    ];
  }
  
  async generateDetails(stage, requests) {

      const OPENAI_API_KEY = game.settings.get(Constants.ID, WfrpOpenAiApi.apiKey); // Replace with your actual API key
      const url = 'https://api.openai.com/v1/chat/completions';
      this.messages = requests.messages;

      let data = {
        model: "gpt-4o",
        response_format: { type: "json_object" },
        messages: this.messages
      };

      if (stage.stage === "characteristics") { 
        const statisticsQuery = game.i18n.localize("AActors.Generate.OpenAI.StageCharacteristicsPrompt");

        this.messages.push({ "role": "user", "content": statisticsQuery });

        const response = await fetch(url, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${OPENAI_API_KEY}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(data)
        });
        const responseData = await response.json();
        let npc = responseData.choices[0].message.content;
        npc = JSON.parse(npc);
        requests.npc.characteristics = npc.npc.characteristics;
        requests.npc.details = npc.npc.details;
        requests.npc.name = npc.npc.name;

        this.messages.push({ "role": "assistant", "content": responseData.choices[0].message.content });
      }

      if (stage.stage === "careers") {
        const careersMessage = game.i18n.format("AActors.Generate.OpenAI.StageCareersPrompt", { careers: requests.careers.map(career => career.name).join(", ") }) + ` { "careers": [] }`;
        this.messages.push({ "role": "user", "content": careersMessage });

        const response = await fetch(url, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${OPENAI_API_KEY}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(data)
        });
        const responseData = await response.json();
        let careers = responseData.choices[0].message.content;
        careers = JSON.parse(careers);
        requests.npc.careers = []; 
        for (let career of careers.careers) {
          let co = requests.careers.find(c => c.name === career);
          if (!co) {
            co = requests.careers.map(c => { return { name: c.name, uuid: c.uuid, index: WfrpOpenAiDetailsApi.levenshtein(c.name, career)}; }).sort((a, b) => a.index - b.index)[0];
          }
          requests.npc.careers.push({name: co.name, uuid: co.uuid});
        }
        this.messages.push({ "role": "assistant", "content": responseData.choices[0].message.content });
      }

      if (stage.stage === "talents") {
        const talentsMessage = game.i18n.format("AActors.Generate.OpenAI.StageTalentsPrompt", { talents: requests.talents.map(talent => talent.name).join(", ") }) + ` { "talents": [] }`;
        this.messages.push({ "role": "user", "content": talentsMessage });

        const response = await fetch(url, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${OPENAI_API_KEY}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(data)
        });
        const responseData = await response.json();
        let talents = responseData.choices[0].message.content;
        talents = JSON.parse(talents);
        requests.npc.talents = []; 
        for (let talent of talents.talents) {
          let co = requests.talents.find(c => c.name === talent);
          if (!co) {
            co = requests.talents.map(c => { return { name: c.name, uuid: c.uuid, index: WfrpOpenAiDetailsApi.levenshtein(c.name, talent)}; }).sort((a, b) => a.index - b.index)[0];
          }
          requests.npc.talents.push({name: co.name, uuid: co.uuid});
        }
        this.messages.push({ "role": "assistant", "content": responseData.choices[0].message.content });
      }
      
      if (stage.stage === "image") {
        const dalleMessage =  game.i18n.localize("AActors.Generate.OpenAI.StageImagePrompt");
        this.messages.push({ "role": "user", "content": dalleMessage });

        let data = {
          model: "gpt-4o",
          response_format: { type: "json_object" },
          messages: this.messages
        };  
        const response = await fetch(url, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${OPENAI_API_KEY}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(data)
        });

        const responseData = await response.json();
        let dalle = responseData.choices[0].message.content;
        dalle = JSON.parse(dalle);
        requests.npc.dalle = dalle.dalle;
        this.messages.push({ "role": "assistant", "content": responseData.choices[0].message.content });

        let mjapi = new WfrpMJApi();
        let responseDalleData = await mjapi.generateImage(dalle.dalle);
        requests.npc.imageBase64 = responseDalleData.base64
        requests.npc.imageSrc = 'data:image/png;base64,' + responseDalleData.base64;
        requests.npc.imageUrl = responseDalleData.url;


        /*
        const dalleUrl = 'https://api.openai.com/v1/images/generations';
        data = {
            model: "dall-e-3",
            prompt: dalle.dalle,
            n: 1,
            size: "1024x1024",
            response_format: "b64_json"
        };

        const responseDalle = await fetch(dalleUrl, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${OPENAI_API_KEY}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(data)
        });

        const responseDalleData = await responseDalle.json();
        requests.npc.imageBase64 = responseDalleData.data[0].b64_json;
        requests.npc.imageSrc =  `data:image/png;base64,${responseDalleData.data[0].b64_json}`;
        */
      }

      requests.npc.html = this.prettyPrintNpc(requests.npc);
      return requests;
    }

    prettyPrintNpc(npc) {
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
      html += `<p><strong>${game.i18n.localize("AActors.WFRP.Description")}:</strong> ${npc.description}<br></p>`;
      html += `<p><strong>${game.i18n.localize("AActors.WFRP.Careers")}:</strong><ul>`;
      if (npc.careers) {
        for (let i of npc.careers) {
            html += `<li><a class="content-link" draggable="true" data-id="null" data-uuid="${i.uuid}" data-tooltip=""><i class="fas fa-unlink"></i>${i.name}</a></li>`;
        }
      }
      html += `</ul></p>`;
      html += `<p><strong>${game.i18n.localize("AActors.WFRP.Talents")}:</strong><ul>`;
      if (npc.talents) {
          for (let i of npc.talents) {
          html += `<li><a class="content-link" draggable="true" data-id="null" data-uuid="${i.uuid}" data-tooltip=""><i class="fas fa-unlink"></i>${i.name}</a></li>`;
        }
      }
      html += `</ul></p>`;
      return html;
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