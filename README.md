# AI Generated NPCs

AI Generated NPCs is a Foundry VTT Module that creates detailed NPCs using ChatGPT and Dall-E / MidJourney for their portraits. 

![image](https://raw.githubusercontent.com/silentmark/ai-actors/main/other/img1.png)


Currently suppoerted system:
- WFRP 4e

Currently supported languages:
- English
- Polish

### Generating your NPC characters

In the Actor tab, there is new button: Generate NPC

Generate NPC will open a new window where you can provide simple description about desired NPC. Type a description of your character and click on the Generate button. This takes a minute for ChatGPT to create, so please be patient. Once the character and an image have been generated, they will show in the window. From here you can save it as an actory or just use it ad-hoc. If the image generated does not fit your vision of this character, you can edit its description and regenerate the image using the button under the image. If you have a folder you would like this character to be placed in, you can choose from the drop down list of folders. Not selecting a specific folder will place the actor in the top-level folder. Clicking the "Save NPC" button will create an Actor based on ChatGPT's generation. 

![image](https://raw.githubusercontent.com/silentmark/ai-actors/main/other/img2.png)

### Settings

![image](https://raw.githubusercontent.com/silentmark/ai-actors/main/other/img3.png)

You will need API Key from Open-AI https://platform.openai.com/api-keys

to return correct format. Below is a sample System Prompt for WFRP in English and Polish:

```
You are a helpful and creative assistant to the Game Master in 4th Edition Warhammer Fantasy RPG. You help by providing descriptions and basic characteristics for NPCs, description of places, stories and adventures. Use the lore and history of Warhammer Fantasy World and be inspired by other fantasy literature or movies. Use an artistic style based on novels and stories. Do not use calculations and bullet points.
```

```
Jesteś pomocnym i kreatywnym asystentem Mistrza Gry w 4. edycji Warhammer Fantasy RPG. Pomagasz, podając opisy i podstawowe cechy dla Bohaterów Niezależnych, opisy miejsc, wydarzeń oraz przygód. Korzystaj z opisu świata i historii Warhammer Fantasy, korzystaj z inspiracji innymi dziełami literatury fantasy. Używaj systemu metrycznego. Używaj stylu artystycznego, typowego dla powieści i opowiadań. Nie kopiuj zwrotów użytych w zapytaniu. Nie używaj wyliczeń i wypunktowań.
```

#### Image Generation

Portrait generation can be done using Dall-E or MidJourney. If you would like to use MidJourney, all you have to do is to provide necessary configuration entries. Lack of them will fall back to Dall-E. Since MidJourney doesn't provide native API, to mimic discord prompts, please follow this [Guide](https://medium.com/@useapi.net/interact-with-midjourney-using-discord-api-5a2e150f5e97) to get necessary values. 

#### Chat Prompts

There are two promts that can be used on chat: ```/whisper ai <<promt>>``` will generate any content from chat GPT using as context (suystem prompt) default configuration, i.e.:

**IMPORTANT NOTE:** this prompt will preserve the context of messages during session (until page reload). that means, from one hand, you can have a conversation with chat bot preserving the context of all messages, but it will increase signifcantly cost, as all messages will be send back and forth during conversation. To reset this behavior, either configure message history length to 0 or use command ```/whisper gpt-reset``` to clear message history

![image](https://raw.githubusercontent.com/silentmark/ai-actors/main/other/img4.png)

Second prompt is ```/whisper img <<prompt>>``` will generate an image based on provided description, there is no additional context included. It will allow you to either save the image or copy to clipboard (may not work if you don't have https) i.e. 

![image](https://raw.githubusercontent.com/silentmark/ai-actors/main/other/img5.png)
![image](https://raw.githubusercontent.com/silentmark/ai-actors/main/other/img6.png)

#### Final Remarks

This is initial version of the module and it still has a lot to do. If you would like to help me with supporting other systems, found bug or would like to suggest a feature, feel free to open a PR or Issue. 

#### Special thanks to [Rachel Schutz](https://github.com/rachsg7) whoms original module was an inspiration to create this one. 

#### TODO: 

- Save NPCs and their prompts as Journal Pages
- Configuration for Chat GPT parameters and Image save location
- Dedicated Settings App
