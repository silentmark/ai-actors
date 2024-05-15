import { Constants } from "../wfrp.mjs";

export default class WfrpMJApi {
  
  static initialize() {  
      game.settings.register(Constants.ID, WfrpMJApi.authorizationHeaderKey, {
        name: `AActors.Settings.MJ.${WfrpMJApi.authorizationHeaderKey}.Name`,
        default: "",
        type: String,
        scope: "world",
        config: true,
        restricted: true,
        hint: `AActors.Settings.MJ.${WfrpMJApi.authorizationHeaderKey}.Hint`
      });

      game.settings.register(Constants.ID, WfrpMJApi.channelIdKey, {
        name: `AActors.Settings.MJ.${WfrpMJApi.channelIdKey}.Name`,
        default: "",
        type: String,
        scope: "world",
        config: true,
        restricted: true,
        hint: `AActors.Settings.MJ.${WfrpMJApi.channelIdKey}.Hint`
      });

      game.settings.register(Constants.ID, WfrpMJApi.appIdKey, {
        name: `AActors.Settings.MJ.${WfrpMJApi.appIdKey}.Name`,
        default: "",
        type: String,
        scope: "world",
        config: true,
        restricted: true,
        hint: `AActors.Settings.MJ.${WfrpMJApi.appIdKey}.Hint`
      });

      game.settings.register(Constants.ID, WfrpMJApi.guildIdKey, {
        name: `AActors.Settings.MJ.${WfrpMJApi.guildIdKey}.Name`,
        default: "",
        type: String,
        scope: "world",
        config: true,
        restricted: true,
        hint: `AActors.Settings.MJ.${WfrpMJApi.guildIdKey}.Hint`
      });

      game.settings.register(Constants.ID, WfrpMJApi.sessionIdKey, {
        name: `AActors.Settings.MJ.${WfrpMJApi.sessionIdKey}.Name`,
        default: "",
        type: String,
        scope: "world",
        config: true,
        restricted: true,
        hint: `AActors.Settings.MJ.${WfrpMJApi.sessionIdKey}.Hint`
      });

      game.settings.register(Constants.ID, WfrpMJApi.imagineCommandVersionId, {
        name: `AActors.Settings.MJ.${WfrpMJApi.imagineCommandVersionId}.Name`,
        default: "",
        type: String,
        scope: "world",
        config: true,
        restricted: true,
        hint: `AActors.Settings.MJ.${WfrpMJApi.imagineCommandVersionId}.Hint`
      });

      game.settings.register(Constants.ID, WfrpMJApi.imagineCommandId, {
        name: `AActors.Settings.MJ.${WfrpMJApi.imagineCommandId}.Name`,
        default: "",
        type: String,
        scope: "world",
        config: true,
        restricted: true,
        hint: `AActors.Settings.MJ.${WfrpMJApi.imagineCommandId}.Hint`
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

    async generateImage(prompt) {

      const authorizationHeader = game.settings.get(Constants.ID, WfrpMJApi.authorizationHeaderKey); // Replace with your actual API key
      const appId = game.settings.get(Constants.ID, WfrpMJApi.appIdKey);
      const guildId = game.settings.get(Constants.ID, WfrpMJApi.guildIdKey);
      const channelId = game.settings.get(Constants.ID, WfrpMJApi.channelIdKey);
      const sessionId = game.settings.get(Constants.ID, WfrpMJApi.sessionIdKey);
      const imagineCommandVersionId = game.settings.get(Constants.ID, WfrpMJApi.imagineCommandVersionId);
      const imagineCommandId = game.settings.get(Constants.ID, WfrpMJApi.imagineCommandId);
      const uniqueId = Math.floor(Math.random() * 10000000).toString();

      const url = 'https://discord.com/api/v9/interactions';
      let p = foundry.utils.deepClone(WfrpMJApi.midJourneyPayload);
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
      do {
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
              responseData = { 
                base64: base64,
                url: attachment.url
              }
              return responseData;
            }
          }
        }
      } while (responseData == null);
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
}

// Initialize 
Hooks.once('init', () => {
  WfrpMJApi.initialize();
});