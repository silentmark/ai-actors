import { Constants } from "../wfrp.mjs";

export default class WfrpOpenAiApi {
  
  static initialize() {  
      game.settings.register(Constants.ID, WfrpOpenAiApi.apiKey, {
        name: `AActors.Settings.OpenAI.${WfrpOpenAiApi.apiKey}.Name`,
        default: "",
        type: String,
        scope: "world",
        config: true,
        restricted: true,
        hint: `AActors.Settings.OpenAI.${WfrpOpenAiApi.apiKey}.Hint`
      });

      game.settings.register(Constants.ID, WfrpOpenAiApi.systemPrompt, {
        name: `AActors.Settings.OpenAI.${WfrpOpenAiApi.systemPrompt}.Name`,
        default: "",
        type: String,
        scope: "world",
        config: true,
        restricted: true,
        hint: `AActors.Settings.OpenAI.${WfrpOpenAiApi.systemPrompt}.Hint`,
        default: `
          Jesteś pomocnym i kreatywnym asystentem Mistrza Gry w 4. edycji Warhammer Fantasy RPG. Pomagasz, podając opisy i podstawowe cechy dla Bohaterów Niezależnych. Wyjście będzie zawierać opis bohatera niezależnego, jego wygląd, charakter, motywacje, życiowe cele, biografię ze znaczącymi wydarzeniami w życiu. Korzystaj z opisu świata i historii Warhammer Fantasy, korzystaj z inspiracji innymi dziełami literatury fantasy. Używaj systemu metrycznego. Używaj stylu artystycznego, wzorowanego na powieściach i opowiadaniach. Nie używaj wyliczeń i wypunktowań. Opis zwróc w formacie html, bez css. Odpowiedź zwróć w języku polskim. Odpowiedź zwróć w formacie json.
          { 
            description: ""
          }
        `
      });

  }

  static apiKey = 'openAiApiKey';
  static systemPrompt = 'systemPrompt';
  static careers = null;
  static talents = null;

  messages = [];
  get initialMessage() { 
    game.i18n.localize("AActors.Generate.OpenAI.InitialMessage");
  }
  
    async generateDescription(description) {
      if (WfrpOpenAiApi.careers === null) {
        WfrpOpenAiApi.careers = await game.wfrp4e.utility.findAll("career");
      }
      if (WfrpOpenAiApi.talents === null) {
        WfrpOpenAiApi.talents = await game.wfrp4e.utility.findAll("talent");
      }
  
      const OPENAI_API_KEY = game.settings.get(Constants.ID, WfrpOpenAiApi.apiKey); // Replace with your actual API key
      const SYSTEM_PROMPT = game.settings.get(Constants.ID, WfrpOpenAiApi.systemPrompt);
      const url = 'https://api.openai.com/v1/chat/completions';
      this.messages = [
        { "role": "system", "content": SYSTEM_PROMPT },
        {"role": "user", "content": description }
      ];

      let data = {
        model: "gpt-4o",
        frequency_penalty: 0.5,
        presence_penalty: 0.5,
        temperature: 1.5,
        response_format: { type: "json_object" },
        top_p: 0.2,
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
      let npcDescription = responseData.choices[0].message.content;
      this.messages.push({ "role": "assistant", "content": responseData.choices[0].message.content });
      npcDescription = JSON.parse(npcDescription).description;
      return { npc: {description: npcDescription}, messages: this.messages, talents: WfrpOpenAiApi.talents, careers: WfrpOpenAiApi.careers };
    }

    async prepareActorData(npc) {
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
      data.system.details.biography = { value: npc.description };
      
      return data;
    }

    async prepareActorItemsData(npc) {
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
}

// Initialize 
Hooks.once('init', () => {
    WfrpOpenAiApi.initialize();
});