export default class GenericOpenAiDetailsApi {
  _messages = [];
  

  get stages() {
    return [];
  }

  async updateStageInputModel(stage, inputModel) {
    return;
  }
  
  prettyPrintNpc(actorInput) {
    let html = ``;
    html += `<h1>${actorInput.npc.name}</h1>`;
    html += `<hr>`;
    html += `<p><strong>${game.i18n.localize("AActors.WFRP.Description")}:</strong> ${actorInput.description}<br></p>`;
    return html;
  }
}