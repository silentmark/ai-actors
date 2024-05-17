export default class InputModel {

    TextPrompt;
    JsonFormat;

    constructor(initialDescription) {
        this.TextPrompt = initialDescription;
        this.JsonFormat = { description: "",
                            imagePrompt: ""
        };
    }
}