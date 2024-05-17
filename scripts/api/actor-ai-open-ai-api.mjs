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

      game.settings.register(Constants.ID, ActorAiOpenAiApi.systemPromptKey, {
        name: `AActors.Settings.OpenAI.${ActorAiOpenAiApi.systemPromptKey}.Name`,
        default: "",
        type: String,
        scope: "world",
        config: true,
        restricted: true,
        hint: `AActors.Settings.OpenAI.${ActorAiOpenAiApi.systemPromptKey}.Hint`,
        default: `
          Jesteś pomocnym i kreatywnym asystentem Mistrza Gry w 4. edycji Warhammer Fantasy RPG. Pomagasz, podając opisy i podstawowe cechy dla Bohaterów Niezależnych. Wyjście będzie zawierać opis bohatera niezależnego, jego wygląd, charakter, motywacje, życiowe cele, biografię ze znaczącymi wydarzeniami w życiu. Korzystaj z opisu świata i historii Warhammer Fantasy, korzystaj z inspiracji innymi dziełami literatury fantasy. Używaj systemu metrycznego. Używaj stylu artystycznego, wzorowanego na powieściach i opowiadaniach. Nie używaj wyliczeń i wypunktowań. Opis zwróc w formacie html, bez css. Odpowiedź zwróć w języku polskim. Odpowiedź zwróć w formacie json.
          { 
            description: ""
          }
        `
      });

      game.settings.register(Constants.ID, ActorAiOpenAiApi.frequencyPenaltyKey, {
        name: `AActors.Settings.OpenAI.${ActorAiOpenAiApi.frequencyPenaltyKey}.Name`,
        default: "",
        type: Number,
        scope: "world",
        config: true,
        restricted: true,
        default: 0.5,
        hint: `AActors.Settings.OpenAI.${ActorAiOpenAiApi.frequencyPenaltyKey}.Hint`
      });

      game.settings.register(Constants.ID, ActorAiOpenAiApi.presencePenaltyKey, {
        name: `AActors.Settings.OpenAI.${ActorAiOpenAiApi.presencePenaltyKey}.Name`,
        default: "",
        type: Number,
        scope: "world",
        config: true,
        restricted: true,
        default: 0.5,
        hint: `AActors.Settings.OpenAI.${ActorAiOpenAiApi.presencePenaltyKey}.Hint`
      });

      game.settings.register(Constants.ID, ActorAiOpenAiApi.temperatureKey, {
        name: `AActors.Settings.OpenAI.${ActorAiOpenAiApi.temperatureKey}.Name`,
        default: "",
        type: Number,
        scope: "world",
        config: true,
        restricted: true,
        default: 1.5,
        hint: `AActors.Settings.OpenAI.${ActorAiOpenAiApi.temperatureKey}.Hint`
      });

      game.settings.register(Constants.ID, ActorAiOpenAiApi.topPKey, {
        name: `AActors.Settings.OpenAI.${ActorAiOpenAiApi.topPKey}.Name`,
        default: "",
        type: Number,
        scope: "world",
        config: true,
        restricted: true,
        default: 0.2,
        hint: `AActors.Settings.OpenAI.${ActorAiOpenAiApi.topPKey}.Hint`
      });

      game.settings.register(Constants.ID, ActorAiOpenAiApi.maxTokensKey, {
        name: `AActors.Settings.OpenAI.${ActorAiOpenAiApi.maxTokensKey}.Name`,
        default: "",
        type: Number,
        scope: "world",
        config: true,
        restricted: true,
        default: 1000,
        hint: `AActors.Settings.OpenAI.${ActorAiOpenAiApi.maxTokensKey}.Hint`
      });

  }

  static apiKey = 'openAiApiKey';
  static systemPromptKey = 'systemPrompt';
  static frequencyPenaltyKey = 'frequencyPenalty'
  static presencePenaltyKey = 'presencePenalty'
  static temperatureKey = 'temperature'
  static topPKey = 'topP'
  static maxTokensKey = 'maxTokens'

  messages = [];
  get initialMessage() { 
    game.i18n.localize("AActors.OpenAI.InitialMessage");
  }
  
    prepareBasicPrompt() {
      const SYSTEM_PROMPT = game.settings.get(Constants.ID, ActorAiOpenAiApi.systemPromptKey);
      const frequency_penalty = game.settings.get(Constants.ID, ActorAiOpenAiApi.frequencyPenaltyKey);
      const presence_penalty = game.settings.get(Constants.ID, ActorAiOpenAiApi.presencePenaltyKey);
      const temperature = game.settings.get(Constants.ID, ActorAiOpenAiApi.temperatureKey);
      const topP = game.settings.get(Constants.ID, ActorAiOpenAiApi.topPKey);
      const maxTokens = game.settings.get(Constants.ID, ActorAiOpenAiApi.maxTokensKey);
      this.messages = [
        { "role": "system", "content": SYSTEM_PROMPT },
      ];

      let data = {
        model: "gpt-4o",
        frequency_penalty: frequency_penalty,
        presence_penalty: presence_penalty,
        temperature: temperature,
        max_tokens: maxTokens,
        response_format: { type: "json_object" },
        top_p: topP,
        messages: this.messages
      };

      return data;
    }

    async updateInputModelWithImagePrompt(inputModel) {
      const dalleMessage =  game.i18n.localize("AActors.OpenAI.StageImagePrompt");
      inputModel.TextPrompt += "\n" + dalleMessage;
    }

    async generateDescription(postData, inputModel) {
      const url = 'https://api.openai.com/v1/chat/completions';
      const OPENAI_API_KEY = game.settings.get(Constants.ID, ActorAiOpenAiApi.apiKey); // Replace with your actual API key
  
      let jsonInput = JSON.stringify(inputModel.JsonFormat);
      let prompt = inputModel.TextPrompt + "\n" + jsonInput;
      let inputMessage =  { "role": "user", "content": prompt };
      postData.messages.push(inputMessage);

      const response = await fetch(url, {
        method: 'POST',
        headers: {
            'Authorization': `Bearer ${OPENAI_API_KEY}`,
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(postData)
      });
      const responseData = await response.json();
      let actorInput = responseData.choices[0].message.content;
      actorInput = JSON.parse(actorInput);
      actorInput.usage = responseData.usage;
      return actorInput;
    }
}

// Initialize 
Hooks.once('init', () => {
    ActorAiOpenAiApi.initialize();
});