import { Constants } from "../actor.mjs";

export default class ActorAiOpenAiApi {
  
  static initialize() {  
      game.settings.register(Constants.ID, ActorAiOpenAiApi.apiKey, {
        name: `AActors.Settings.OpenAI.${ActorAiOpenAiApi.apiKey}.Name`,
        default: "",
        type: String,
        scope: "world",
        config: true,
        restricted: true,
        hint: `AActors.Settings.OpenAI.${ActorAiOpenAiApi.apiKey}.Hint`
      });

      game.settings.register(Constants.ID, ActorAiOpenAiApi.systemPrompt, {
        name: `AActors.Settings.OpenAI.${ActorAiOpenAiApi.systemPrompt}.Name`,
        default: "",
        type: String,
        scope: "world",
        config: true,
        restricted: true,
        hint: `AActors.Settings.OpenAI.${ActorAiOpenAiApi.systemPrompt}.Hint`,
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

  messages = [];
  get initialMessage() { 
    game.i18n.localize("AActors.OpenAI.InitialMessage");
  }
  
    async generateDescription(description) {
      const OPENAI_API_KEY = game.settings.get(Constants.ID, ActorAiOpenAiApi.apiKey); // Replace with your actual API key
      const SYSTEM_PROMPT = game.settings.get(Constants.ID, ActorAiOpenAiApi.systemPrompt);
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
      return { npc: {description: npcDescription}, messages: this.messages };
    }

    async generateImagePrompt(request) {
      const dalleMessage =  game.i18n.localize("AActors.OpenAI.StageImagePrompt");
      this.messages.push({ "role": "user", "content": dalleMessage });

      const OPENAI_API_KEY = game.settings.get(Constants.ID, ActorAiOpenAiApi.apiKey); // Replace with your actual API key
      const url = 'https://api.openai.com/v1/chat/completions';

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
      let prompt = responseData.choices[0].message.content;
      prompt = JSON.parse(prompt);
      this.messages.push({ "role": "assistant", "content": responseData.choices[0].message.content });

      return prompt.dalle;
    }
}

// Initialize 
Hooks.once('init', () => {
    ActorAiOpenAiApi.initialize();
});