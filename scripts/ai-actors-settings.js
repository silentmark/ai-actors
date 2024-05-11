
class aiActorSettings {
    static ID = "ai-actors";
  
    static SETTINGS = {
      IMAGE_GEN: "img_gen",
      MESSAGE_HIST: "message_history",
      MESSAGE_HIST_IMG: "message_hist_img"
    };
  
    static TEMPLATES = {
      CHATBOT: `modules/${this.ID}/templates/${this.ID}.hbs`,
    };
  
  
    /**
     * A small helper function which leverages developer mode flags to gate debug logs.
     *
     * @param {boolean} force - forces the log even if the debug flag is not on
     * @param  {...any} args - what to log
     */
    static log(force, ...args) {
      const shouldLog =
        force ||
        game.modules.get("_dev-mode")?.api?.getPackageDebugValue(this.ID);
  
      if (shouldLog) {
        console.log(this.ID, "|", ...args);
      }
    }
  
    static initialize() {
      this.aiActorSettings = new aiActorSettings();
  
      game.settings.register(this.ID, this.SETTINGS.IMAGE_GEN, {
        name: `AI-ACTOR.settings.${this.SETTINGS.IMAGE_GEN}.Name`,
        default: true,
        type: Boolean,
        scope: "world", // or is it 'client'?
        config: true,
        hint: `AI-ACTOR.settings.${this.SETTINGS.IMAGE_GEN}.Hint`,
        onChange: () => {}, // Probably don't need this if I can just grab it from game.settings.get. Instead in future this could be a way to let me know something has changed?
        restricted: true,
      });

      game.settings.register(this.ID, this.SETTINGS.MESSAGE_HIST, {
        name: `AI-ACTOR.settings.${this.SETTINGS.MESSAGE_HIST}.Name`,
        default: 5,
        type: Number,
        scope: "world",
        config: true,
        hint: `AI-ACTOR.settings.${this.SETTINGS.MESSAGE_HIST}.Hint`,
        restricted: true,
      });

      game.settings.register(this.ID, this.SETTINGS.MESSAGE_HIST_IMG, {
        name: `AI-ACTOR.settings.${this.SETTINGS.MESSAGE_HIST_IMG}.Name`,
        type: Boolean,
        default: true,
        scope: "world",
        config: true,
        hint: `AI-ACTOR.settings.${this.SETTINGS.MESSAGE_HIST_IMG}.Hint`,
        restricted: true
      });

        Handlebars.registerHelper("printObject", function(message) {
            let html = aiActor.makePretty(message);
            return new Handlebars.SafeString(html);
        });
    
        Handlebars.registerHelper("printImg", function(img) {
            let name = img[0].name;
            name = name.replace(" ", "");
            if(!!img[4]) {
                let html = `<img id="${name}-img" class="ai-img-gen" src="data:image/png;base64,${img[4]}">`;
                return new Handlebars.SafeString(html);
            }
            else {
                let html = `<img id="${name}-img" class="ai-img-gen" src="icons/svg/mystery-man.svg">`;
                return new Handlebars.SafeString(html);
            }
        });

        Handlebars.registerHelper("printTextarea", function(message) {
            let name = (message[0].name).replace(" ", "");
            let html = `<textarea id="${name}-txt" class="textarea" style="display: none">${message[3]}</textarea>`;
            return new Handlebars.SafeString(html);
        });
    
        Handlebars.registerHelper("printLoader", function(message) {
            let name = (message[0].name).replace(" ", "");
            let html = `<div id="${name}-ai-img-loading"></div>`;
            return new Handlebars.SafeString(html);
        });
    }
}