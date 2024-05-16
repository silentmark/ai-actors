# AI Actors

AI Generated NPCs is a Foundry VTT Module that creates detailed NPCs using ChatGPT and Dall-E / MidJourney for their portraits. 

Currently suppoerted system:
- WFRP 4e

Currently supported languages:
- English
- Polish

### Generating your NPC characters

In the Actor tab, there is new button: Generate NPC

Generate NPC will open a new window where you can provide simple description about desired NPC. Type a description of your character and click on the Generate button. This takes a minute for ChatGPT to create, so please be patient. Once the character and an image have been generated, they will show in the window. From here you can save it as an actory or just use it ad-hoc. If the image generated does not fit your vision of this character, you can edit its description and regenerate the image using the button under the image. If you have a folder you would like this character to be placed in, you can choose from the drop down list of folders. Not selecting a specific folder will place the actor in the top-level folder. Clicking the "Save NPC" button will create an Actor based on ChatGPT's generation. 

![image](https://github.com/silentmark/ai-actors/assets/7930626/85d03554-645a-4512-9980-9a7fa8f021eb)

### Settings

![image](https://github.com/silentmark/ai-actors/assets/7930626/c1112fa6-d2b6-4dc7-9c6d-355eb3b6f930)

You will need API Key from Open-AI https://platform.openai.com/api-keys

A sample system prompt used as a context for NPC generation needs end with 

```
{
   description: ""
}
```

to return correct format. Below is a sample System Prompt for WFRP in English and Polish:

```
You are a helpful and creative assistant to the Game Master in 4th Edition Warhammer Fantasy RPG. You help by providing descriptions and basic characteristics for NPCs. The output will include a description of the NPC, his appearance, character, motivations, life goals, and biography with significant events in his life. Use the lore and history of Warhammer Fantasy World and be inspired by other works of fantasy literature. Use the metric system. Use an artistic style based on novels and short stories. Do not use calculations and bullet points. Return the description in html format, without css. Return the response in json format. { description: "" }
```

```
Jesteś pomocnym i kreatywnym asystentem Mistrza Gry w 4. edycji Warhammer Fantasy RPG. Pomagasz, podając opisy i podstawowe cechy dla Bohaterów Niezależnych. Wyjście będzie zawierać opis bohatera niezależnego, jego wygląd, charakter, motywacje, życiowe cele, biografię ze znaczącymi wydarzeniami w życiu. Korzystaj z opisu świata i historii Warhammer Fantasy, korzystaj z inspiracji innymi dziełami literatury fantasy. Używaj systemu metrycznego. Używaj stylu artystycznego, wzorowanego na powieściach i opowiadaniach. Nie używaj wyliczeń i wypunktowań. Opis zwróc w formacie html, bez css. Odpowiedź zwróć w języku polskim. Odpowiedź zwróć w formacie json. { description: "" }
```

#### Image Generation

Portrait generation can be done using Dall-E or MidJourney. If you would like to use MidJourney, all you have to do is to provide necessary configuration entries. Lack of them will fall back to Dall-E. Since MidJourney doesn't provide native API, to mimic discord prompts, please follow this pGuide](https://medium.com/@useapi.net/interact-with-midjourney-using-discord-api-5a2e150f5e97) to get necessary values. 

#### Final Remarks

This is initial version of the module and it still has a lot to do. If you would like to help me with supporting other systems, found bug or would like to suggest a feature, feel free to open a PR or Issue. 

#### TODO: 

- Save NPCs and their prompts as Journal Pages
- Configuration for Chat GPT parameters and Image save location
- Dedicated Settings App
