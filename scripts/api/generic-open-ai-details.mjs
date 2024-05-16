export default class GenericOpenAiDetailsApi {
  _messages = [];
  

  get stages() {
    return [];
  }
  
  async generateDetails(stage, requests) {
      requests.npc.html = this.prettyPrintNpc(requests.npc);
      return requests;
    }

    prettyPrintNpc(npc) {
      let html = ``;
      html += `<h1>${npc.name}</h1>`;
      html += `<hr>`;
      html += `<p><strong>${game.i18n.localize("AActors.WFRP.Description")}:</strong> ${npc.description}<br></p>`;
      return html;
    }
}