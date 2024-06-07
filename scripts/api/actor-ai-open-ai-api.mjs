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
        default: `You are a helpful and creative assistant to the Game Master in 4th Edition Warhammer Fantasy RPG. You help by providing descriptions and basic characteristics for NPCs, places and stories. Use the lore and history of Warhammer Fantasy World and be inspired by other fantasy literature or movies. Use an artistic style based on novels and stories. Do not use calculations and bullet points.`
      });

      game.settings.register(Constants.ID, 'modelVersion', {
        name: `AActors.Settings.OpenAI.${ActorAiOpenAiApi.modelVersion}.Name`,
        default: 'gpt-4o',
        type: String,
        scope: 'world',
        config: true,
        restricted: true,
        hint: `AActors.Settings.OpenAI.${ActorAiOpenAiApi.modelVersion}.Hint`,
        choices: {
          'gpt-4o': 'GPT-4o',         // https://platform.openai.com/docs/models/gpt-4o
          'gpt-4': 'GPT-4',           // https://platform.openai.com/docs/models/gpt-4
          'gpt-3.5-turbo': 'GPT-3.5', // https://platform.openai.com/docs/models/gpt-3-5
        },
      });    

      game.settings.register(Constants.ID, ActorAiOpenAiApi.frequencyPenaltyKey, {
        name: `AActors.Settings.OpenAI.${ActorAiOpenAiApi.frequencyPenaltyKey}.Name`,
        default: "",
        type: Number,
        scope: "world",
        config: true,
        restricted: true,
        default: 0.33,
        hint: `AActors.Settings.OpenAI.${ActorAiOpenAiApi.frequencyPenaltyKey}.Hint`
      });

      game.settings.register(Constants.ID, ActorAiOpenAiApi.presencePenaltyKey, {
        name: `AActors.Settings.OpenAI.${ActorAiOpenAiApi.presencePenaltyKey}.Name`,
        default: "",
        type: Number,
        scope: "world",
        config: true,
        restricted: true,
        default: 0.33,
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
        default: 0.3,
        hint: `AActors.Settings.OpenAI.${ActorAiOpenAiApi.topPKey}.Hint`
      });

      game.settings.register(Constants.ID, ActorAiOpenAiApi.maxTokensKey, {
        name: `AActors.Settings.OpenAI.${ActorAiOpenAiApi.maxTokensKey}.Name`,
        default: "",
        type: Number,
        scope: "world",
        config: true,
        restricted: true,
        default: 3000,
        hint: `AActors.Settings.OpenAI.${ActorAiOpenAiApi.maxTokensKey}.Hint`
      });

      game.settings.register(Constants.ID, ActorAiOpenAiApi.imageAdditionalQualitiesKey, {
        name: `AActors.Settings.OpenAI.${ActorAiOpenAiApi.imageAdditionalQualitiesKey}.Name`,
        default: "",
        type: String,
        scope: "world",
        config: true,
        restricted: true,
        default: "Photographic, realistic, subtle, fantasy setting.",
        hint: `AActors.Settings.OpenAI.${ActorAiOpenAiApi.imageAdditionalQualitiesKey}.Hint`
      });

      game.settings.register(Constants.ID, ActorAiOpenAiApi.historyLength, {
        name: `AActors.Settings.OpenAI.${ActorAiOpenAiApi.historyLength}.Name`,
        default: 2,
        type: Number,
        scope: "world",
        config: true,
        restricted: true,
        hint: `AActors.Settings.OpenAI.${ActorAiOpenAiApi.historyLength}.Hint`
    });
  }

  static apiKey = 'openAiApiKey';
  static systemPromptKey = 'systemPrompt';
  static frequencyPenaltyKey = 'frequencyPenalty'
  static presencePenaltyKey = 'presencePenalty'
  static temperatureKey = 'temperature'
  static topPKey = 'topP'
  static maxTokensKey = 'maxTokens'
  static imageAdditionalQualitiesKey = 'imageAdditionalQualities'
  static modelVersion = 'modelVersion'
  static historyLength = 'historyLength'

  get initialMessage() { 
    return game.i18n.localize("AActors.OpenAI.InitialMessage");
  }
  
    prepareBasicPrompt() {
      const frequency_penalty = game.settings.get(Constants.ID, ActorAiOpenAiApi.frequencyPenaltyKey);
      const presence_penalty = game.settings.get(Constants.ID, ActorAiOpenAiApi.presencePenaltyKey);
      const temperature = game.settings.get(Constants.ID, ActorAiOpenAiApi.temperatureKey);
      const topP = game.settings.get(Constants.ID, ActorAiOpenAiApi.topPKey);
      const maxTokens = game.settings.get(Constants.ID, ActorAiOpenAiApi.maxTokensKey);

      let data = {
        model: game.settings.get(Constants.ID, ActorAiOpenAiApi.modelVersion),
        frequency_penalty: frequency_penalty,
        presence_penalty: presence_penalty,
        temperature: temperature,
        max_tokens: maxTokens,
        response_format: { type: "json_object" },
        top_p: topP
      };

      return data;
    }

    async updateInputModelWithImagePrompt(inputModel) {
      const additionalQualities = game.settings.get(Constants.ID, ActorAiOpenAiApi.imageAdditionalQualitiesKey);
      const dalleMessage =  game.i18n.localize("AActors.OpenAI.StageImagePrompt").replaceAll('<<additionalImageQualities>>', additionalQualities);
      inputModel.TextPrompt += "\n" + dalleMessage;
    }

    async generateDescription(postData, inputModel) {
      const url = 'https://api.openai.com/v1/chat/completions';
      const OPENAI_API_KEY = game.settings.get(Constants.ID, ActorAiOpenAiApi.apiKey); // Replace with your actual API key
  
      let prompt = inputModel.TextPrompt;
      let inputMessage =  { "role": "user", "content": 'NPC: ' + prompt };
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