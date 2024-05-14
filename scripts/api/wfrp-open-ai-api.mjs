import { Constants } from "../wfrp.mjs";

export default class WfrpOpenAiApi {
  
  static initialize() {  
      game.settings.register(Constants.ID, WfrpOpenAiApi.apiKey, {
        name: `CHAT-BOT.settings.${WfrpOpenAiApi.apiKey}.Name`,
        default: "",
        type: String,
        scope: "world",
        config: true,
        restricted: true,
        hint: `CHAT-BOT.settings.${WfrpOpenAiApi.apiKey}.Hint`
      });

      game.settings.register(Constants.ID, WfrpOpenAiApi.systemPrompt, {
        name: `CHAT-BOT.settings.${WfrpOpenAiApi.systemPrompt}.Name`,
        default: "",
        type: String,
        scope: "world",
        config: true,
        restricted: true,
        hint: `CHAT-BOT.settings.${WfrpOpenAiApi.systemPrompt}.Hint`,
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
  initialMessage = "Generowanie opisu bohatera niezależnego..."
  
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

      //return { npc: {description: "jakis tam sobie ziomeczek"}, messages: this.messages, talents: WfrpOpenAiApi.talents, careers: WfrpOpenAiApi.careers };

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
}

// Initialize 
Hooks.once('init', () => {
    WfrpOpenAiApi.initialize();
});