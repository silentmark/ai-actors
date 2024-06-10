import { Constants } from "../actor.mjs";
import ActorAiOpenAiApi from "./actor-ai-open-ai-api.mjs";

export default class ImageOpenAiApi {

    get imageHtml() { return `<div contenteditable class="ai-image" style="text-align: center;"><img class="actor-ai-img-gen" src=<<img>> style="border: none;"></div><div><button class='ai-image-copy'>${game.i18n.localize("AActors.General.CopyToClipboard")}</button></div><div><button class='ai-image-save'>${game.i18n.localize("AActors.General.SaveImage")}</button></div>`;
    }
    
    async generateImage(prompt, actorInput) {
      const OPENAI_API_KEY = game.settings.get(Constants.ID, ActorAiOpenAiApi.apiKey); // Replace with your actual API key

      const dalleUrl = 'https://api.openai.com/v1/images/generations';
      const data = {
          model: "dall-e-3",
          prompt: prompt,
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
      
      actorInput.imageSrc = 'data:image/png;base64,' + responseDalleData.data[0].b64_json;
      actorInput.imageBase64 = responseDalleData.data[0].b64_json;
    }
}