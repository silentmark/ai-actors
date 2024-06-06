import { Constants } from "../actor.mjs";
import ActorAiOpenAiApi from "./actor-ai-open-ai-api.mjs";

export default class ChatAiOpenAiApi {

  static chatMessagesHistory = [];
  
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
      top_p: topP,
      stream: true
    };

    return data;
  }

  resetChatMessagesHistory() {
    ChatAiOpenAiApi.chatMessagesHistory = [];
  }

  async generateChatResponse(postData, prompt, chatMessage) {
    let textMessage = "";
    const url = 'https://api.openai.com/v1/chat/completions';
    const OPENAI_API_KEY = game.settings.get(Constants.ID, ActorAiOpenAiApi.apiKey); // Replace with your actual API key

    const SYSTEM_PROMPT = game.settings.get(Constants.ID, ActorAiOpenAiApi.systemPromptKey); 
    postData.messages = [
      { "role": "system", "content": SYSTEM_PROMPT }, 
    ];

    for (let m of ChatAiOpenAiApi.chatMessagesHistory) {
      postData.messages.push(m);
    }
    let inputMessage =  { "role": "user", "content": prompt };
    postData.messages.push(inputMessage);
    ChatAiOpenAiApi.chatMessagesHistory.push(inputMessage);

    const response = await fetch(url, {
      method: 'POST',
      headers: {
          'Authorization': `Bearer ${OPENAI_API_KEY}`,
          'Content-Type': 'application/json'
      },
      body: JSON.stringify(postData)
    });
    if (!response.body[Symbol.asyncIterator]) {
      response.body[Symbol.asyncIterator] = () => {
        const reader = response.body.getReader();
        return {
          next: () => reader.read(),
        };
      };
    }
    const textDecoderStream = new TextDecoderStream();
    const stream = response.body.pipeThrough(textDecoderStream);

    if (!stream[Symbol.asyncIterator]) {
      stream[Symbol.asyncIterator] = () => {
        const reader = stream.getReader();
        return {
          next: () => reader.read(),
        };
      };
    }
    for await (const brokenChunk of stream) {
      const chunk = brokenChunk.toString().replaceAll('data: ', '').replace('[DONE]', '').trim()
      try {
        // Directly attempt to parse the chunk as a valid JSON object.
        const parsed = JSON.parse(chunk);
        const content = parsed.choices?.[0]?.delta?.content;
        textMessage += content;
        await chatMessage.update({content: textMessage});
      } catch (e) {
        // If parsing fails, attempt to handle concatenated JSON objects.
        try {
          // Separate concatenated JSON objects and parse them as an array.
          const modifiedChunk = '[' + chunk.replaceAll(/}\s*{/g, '},{') + ']';
          const parsedArray = JSON.parse(modifiedChunk);
          for (let i = 0; i < parsedArray.length; i++) {
            const content = parsedArray[i].choices?.[0]?.delta?.content;
            if (content) {
              textMessage += content;
            }
          }
          await chatMessage.update({content: textMessage});
        } catch (error) {
          console.warn(chunk);
          ui.notifications.error('Error parsing modified JSON:', error);
          console.error('Error parsing modified JSON:', error);
        }
      }
    }
    let outputMessage =  { "role": "assistant", "content": textMessage };
    ChatAiOpenAiApi.chatMessagesHistory.push(outputMessage);
    return textMessage;
  }
}