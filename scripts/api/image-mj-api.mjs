import { Constants } from "../actor.mjs";

export default class ImageMidJourneyApi {
  
  static initialize() {  
      game.settings.register(Constants.ID, ImageMidJourneyApi.authorizationHeaderKey, {
        name: `AActors.Settings.MJ.${ImageMidJourneyApi.authorizationHeaderKey}.Name`,
        default: "",
        type: String,
        scope: "world",
        config: true,
        restricted: true,
        hint: `AActors.Settings.MJ.${ImageMidJourneyApi.authorizationHeaderKey}.Hint`
      });

      game.settings.register(Constants.ID, ImageMidJourneyApi.channelIdKey, {
        name: `AActors.Settings.MJ.${ImageMidJourneyApi.channelIdKey}.Name`,
        default: "",
        type: String,
        scope: "world",
        config: true,
        restricted: true,
        hint: `AActors.Settings.MJ.${ImageMidJourneyApi.channelIdKey}.Hint`
      });

      game.settings.register(Constants.ID, ImageMidJourneyApi.appIdKey, {
        name: `AActors.Settings.MJ.${ImageMidJourneyApi.appIdKey}.Name`,
        default: "",
        type: String,
        scope: "world",
        config: true,
        restricted: true,
        hint: `AActors.Settings.MJ.${ImageMidJourneyApi.appIdKey}.Hint`
      });

      game.settings.register(Constants.ID, ImageMidJourneyApi.guildIdKey, {
        name: `AActors.Settings.MJ.${ImageMidJourneyApi.guildIdKey}.Name`,
        default: "",
        type: String,
        scope: "world",
        config: true,
        restricted: true,
        hint: `AActors.Settings.MJ.${ImageMidJourneyApi.guildIdKey}.Hint`
      });

      game.settings.register(Constants.ID, ImageMidJourneyApi.sessionIdKey, {
        name: `AActors.Settings.MJ.${ImageMidJourneyApi.sessionIdKey}.Name`,
        default: "",
        type: String,
        scope: "world",
        config: true,
        restricted: true,
        hint: `AActors.Settings.MJ.${ImageMidJourneyApi.sessionIdKey}.Hint`
      });

      game.settings.register(Constants.ID, ImageMidJourneyApi.imagineCommandVersionId, {
        name: `AActors.Settings.MJ.${ImageMidJourneyApi.imagineCommandVersionId}.Name`,
        default: "",
        type: String,
        scope: "world",
        config: true,
        restricted: true,
        hint: `AActors.Settings.MJ.${ImageMidJourneyApi.imagineCommandVersionId}.Hint`
      });

      game.settings.register(Constants.ID, ImageMidJourneyApi.imagineCommandId, {
        name: `AActors.Settings.MJ.${ImageMidJourneyApi.imagineCommandId}.Name`,
        default: "",
        type: String,
        scope: "world",
        config: true,
        restricted: true,
        hint: `AActors.Settings.MJ.${ImageMidJourneyApi.imagineCommandId}.Hint`
      });
  }

  static authorizationHeaderKey = 'authorizationHeader';
  static channelIdKey = 'channelId';
  static appIdKey = 'appId'
  static guildIdKey = 'guildId';
  static sessionIdKey = 'sessionId';
  static imagineCommandVersionId = 'imagineCommandVersionId';
  static imagineCommandId = 'imagineCommandId';

  static midJourneyPayload = {
    "type":2,
    "application_id":"{appId}",
    "guild_id":"{guildId}",
    "channel_id":"{channelId}",
    "session_id":"{sessionId}",
    "data":{
      "version":"{imagineCommandVersionId}",
      "id":"{imagineCommandId}",
      "name":"imagine",
      "type":1,
      "options":[{"type":3,
        "name":
        "prompt",
        "value":"{prompt} --no {uniqueId}",
      }],
      "application_command":{
          "id":"{imagineCommandId}",
          "type":1,
          "application_id":"{appId}",
          "version":"{imagineCommandVersionId}",
          "name":"imagine",
          "description":"Create images with Midjourney",
          "options":[{
            "type":3,
            "name":"prompt",
            "description":"The prompt to imagine",
            "required":true}],
          "dm_permission":true,
          "contexts":[0,1,2]
        },
        "attachments":[]
      }
    }

    static mkidJourneyUpscalePayload = {
      "type":3,
      "guild_id":"{guildId}",
      "channel_id":"{channelId}",
      "message_flags":0,
      "message_id":"{messageId}",
      "application_id":"{appId}",
      "session_id":"{sessionId}",
      "data":{
          "component_type":2,
          "custom_id":"{upscalerId}"
      }
  }

    async generateImage(prompt) {

      const authorizationHeader = game.settings.get(Constants.ID, ImageMidJourneyApi.authorizationHeaderKey); // Replace with your actual API key
      const appId = game.settings.get(Constants.ID, ImageMidJourneyApi.appIdKey);
      const guildId = game.settings.get(Constants.ID, ImageMidJourneyApi.guildIdKey);
      const channelId = game.settings.get(Constants.ID, ImageMidJourneyApi.channelIdKey);
      const sessionId = game.settings.get(Constants.ID, ImageMidJourneyApi.sessionIdKey);
      const imagineCommandVersionId = game.settings.get(Constants.ID, ImageMidJourneyApi.imagineCommandVersionId);
      const imagineCommandId = game.settings.get(Constants.ID, ImageMidJourneyApi.imagineCommandId);
      const uniqueId = Math.floor(Math.random() * 10000000).toString();

      const url = 'https://discord.com/api/v9/interactions';
      let p = foundry.utils.deepClone(ImageMidJourneyApi.midJourneyPayload);
      p.application_id = appId;
      p.guild_id = guildId;
      p.channel_id = channelId;
      p.session_id = sessionId;
      p.data.version = imagineCommandVersionId;
      p.data.id = imagineCommandId;
      p.data.options[0].value = prompt + ' --no ' + uniqueId;
      p.data.application_command.id = imagineCommandId;
      p.data.application_command.version = imagineCommandVersionId;
      p.data.application_command.application_id = appId;

      const response = await fetch(url, {
        method: 'POST',
        headers: {
            'Authorization': `${authorizationHeader}`,
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(p)
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      let responseData = null;
      let counter = 0;
      do {
        counter++;
        const delay = ms => new Promise(res => setTimeout(res, ms));
        await delay(2000);
        const messagesUrl = 'https://discord.com/api/v9/channels/' + channelId +'/messages?limit=50';
        const messagesResponse = await fetch(messagesUrl, {
          method: 'GET',
          headers: {
              'Authorization': `${authorizationHeader}`,
              'Content-Type': 'application/json'
          }
        });
        let messages = await messagesResponse.json();

        let matchingMessage = messages.filter(message =>
          message.content.includes(uniqueId) &&
          message
            .components
            .some(component => component.components.some(c => c.label === "U1") ) // means that we can upscale results
        ) || [];
  
        if (!matchingMessage.length) {
          continue;
        }

        matchingMessage = matchingMessage[0];
        
        if (matchingMessage.attachments && matchingMessage.attachments.length > 0) {
          for (const attachment of matchingMessage.attachments) {
            if (attachment.filename.includes('png')) {
              let base64 =  await this.getBase64Image(attachment.url);

              responseData = {}
              responseData.npc = {};
              responseData.npc.imageSrc = 'data:image/png;base64,' + base64;
              responseData.npc.imageBase64 = base64;
              responseData.npc.upscale = true;
              responseData.npc.messageId = matchingMessage.id;
              responseData.npc.uniqueId = uniqueId;
              responseData.npc.upsacelers = [];

              for (let component of matchingMessage.components) {
                for (let c of component.components) {
                  if (c.label && c.label[0] === "U") {
                    responseData.npc.upsacelers.push(c.custom_id);
                  }
                }
              }
      
              return responseData;
            }
          }
        }
      } while (responseData == null || counter < 200);
    }

    async getBase64Image(url) {
      const response = await fetch(url);
      const blob = await response.blob();
      const reader = new FileReader();
      await new Promise((resolve, reject) => {
        reader.onload = resolve;
        reader.onerror = reject;
        reader.readAsDataURL(blob);
      });
      return reader.result.replace(/^data:.+;base64,/, '')
    }

    async upscale(messageId, customId) {

      const authorizationHeader = game.settings.get(Constants.ID, ImageMidJourneyApi.authorizationHeaderKey); // Replace with your actual API key
      const appId = game.settings.get(Constants.ID, ImageMidJourneyApi.appIdKey);
      const guildId = game.settings.get(Constants.ID, ImageMidJourneyApi.guildIdKey);
      const channelId = game.settings.get(Constants.ID, ImageMidJourneyApi.channelIdKey);
      const sessionId = game.settings.get(Constants.ID, ImageMidJourneyApi.sessionIdKey);

      const url = 'https://discord.com/api/v9/interactions';
      let p = foundry.utils.deepClone(ImageMidJourneyApi.mkidJourneyUpscalePayload);
      p.application_id = appId;
      p.guild_id = guildId;
      p.channel_id = channelId;
      p.session_id = sessionId;
      p.message_id = messageId;
      p.data.custom_id = customId;

      const response = await fetch(url, {
        method: 'POST',
        headers: {
            'Authorization': `${authorizationHeader}`,
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(p)
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      let responseData = null;
      let counter = 0;
      do {
        counter++;
        const delay = ms => new Promise(res => setTimeout(res, ms));
        await delay(2000);
        const messagesUrl = 'https://discord.com/api/v9/channels/' + channelId +'/messages?limit=50';
        const messagesResponse = await fetch(messagesUrl, {
          method: 'GET',
          headers: {
              'Authorization': `${authorizationHeader}`,
              'Content-Type': 'application/json'
          }
        });
        let messages = await messagesResponse.json();

        let matchingMessage = messages.filter(message => message.message_reference?.message_id == messageId) || [];
        if (!matchingMessage.length) {
          continue;
        }

        matchingMessage = matchingMessage[0];
        
        if (matchingMessage.attachments && matchingMessage.attachments.length > 0) {
          for (const attachment of matchingMessage.attachments) {
            if (attachment.filename.includes('png')) {
              let base64 =  await this.getBase64Image(attachment.url);

              responseData = {}
              responseData.npc = {};
              responseData.npc.imageSrc = 'data:image/png;base64,' + base64;
              responseData.npc.imageBase64 = base64;
              return responseData;
            }
          }
        }
      } while (responseData == null || counter < 200);
    }
}

// Initialize 
Hooks.once('init', () => {
  ImageMidJourneyApi.initialize();
});