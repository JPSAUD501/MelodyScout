import { GoogleGenerativeAI, HarmCategory, HarmBlockThreshold, type GenerateContentResult } from '@google/generative-ai'

export async function getLyricsEmojisGenerator (googleAiApiKey: string, lyrics: string): Promise<GenerateContentResult> {
  const genAI = new GoogleGenerativeAI(googleAiApiKey)
  const model = genAI.getGenerativeModel({ model: 'gemini-1.0-pro' })
  const contentResult = model.generateContent({
    generationConfig: {
      temperature: 0.7,
      topK: 1,
      topP: 1,
      maxOutputTokens: 200,
      stopSequences: ['---']
    },
    safetySettings: [
      {
        category: HarmCategory.HARM_CATEGORY_HARASSMENT,
        threshold: HarmBlockThreshold.BLOCK_NONE
      },
      {
        category: HarmCategory.HARM_CATEGORY_HATE_SPEECH,
        threshold: HarmBlockThreshold.BLOCK_NONE
      },
      {
        category: HarmCategory.HARM_CATEGORY_SEXUALLY_EXPLICIT,
        threshold: HarmBlockThreshold.BLOCK_NONE
      },
      {
        category: HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT,
        threshold: HarmBlockThreshold.BLOCK_NONE
      }
    ],
    contents: [{
      role: 'user',
      parts: [
        {
          text:
`Using the lyrics received, create a selection of emojis that best represent the song. The answer must only contain emojis. The answer must have up to 30 emojis.
---
Lyrics: I'm at a payphone trying to call homeAll of my change I spent on youWhere have the times gone, baby it's all wrongWhere are the plans we made for twoYeah, I, I know it's hard to rememberThe people we used to beIt's even harder to pictureThat you're not here next to meYou say it's too late to make itBut is it too late to tryAnd in our time that you wastedAll of our bridges burned downI've wasted my nightsYou turned out the lightsNow I'm paralyzedStill stuck in that timeWhen we called it loveBut even the sun sets in paradiseI'm at a payphone trying to call homeAll of my change I spent on youWhere have the times gone, baby it's all wrongWhere are the plans we made for twoIf Happy Ever Afters did existI would still be holding you like thisAll those fairy tales are full of shitOne more fucking love song, I'll be sickOh, you turned your back on tomorrow'Cause you forgot yesterdayI gave you my love to borrowBut you just gave it awayYou can't expect me to be fineI don't expect you to careI know I've said it beforeBut all of our bridges burned downI've wasted my nightsYou turned out the lightsNow I'm paralyzedStill stuck in that timeWhen we called it loveBut even the sun sets in paradiseI'm at a payphone trying to call homeAll of my change I spent on youWhere have the times gone, baby it's all wrongWhere are the plans we made for two?If Happy Ever Afters did existI would still be holding you like thisAll those fairy tales are full of shitOne more fucking love song, I'll be sickNow I'm at a payphoneMan, fuck that shitI'll be out spending all this moneyWhile you're sitting round wonderingWhy it wasn't you who came up from nothingMade it from the bottomNow when you see me I'm stuntingAnd all of my cars start with a push of a buttonTelling me the chances I blew upOr whatever you call itSwitch the number to my phoneSo you never could call itDon't need my name on my showYou can tell it I'm ballin' Swish, what a shame could have got pickedHad a really good game but you missed your last shotSo you talk about who you see at the topOr what you could have saw but sad to say it's over forPhantom pulled up valet open doorsWished I'd go away, got what you was looking forNow it's me who they want, so you can go and takeThat little piece of shit with youI'm at a payphone trying to call homeAll of my change I spent on youWhere have the times gone, baby it's all wrongWhere are the plans we made for twoIf Happy Ever Afters did existI would still be holding you like thisAll those fairy tales are full of shitOne more fucking love song, I'll be sickNow I'm at a payphone
Emojis: 📞🏡💸💔🕰️❓️🔥🌉😴💡⌛🏞️💰🚫💔🌉😴💡💔💰🚫❓️🏡💸💔🕰️❓️🦄💔❤️💔🖼️🖕🤞🏀🚫❌
---
Lyrics: Hey, girl Open the walls Play with your dolls We'll be a perfect family When you walk away Is when we really play You don't hear me when I say Mom, please, wake up Dad's with a slut And your son is smoking cannabis No one ever listens This wallpaper glistens Don't let them see what goes down in the kitchen Places, places, get in your places Throw on your dress and put on your doll faces Everyone thinks that we're perfect Please, don't let them look through the curtains Picture, picture, smile for the picture Pose with your brother, won't you be a good sister? Everyone thinks that we're perfect Please, don't let them look through the curtains D-O-L-L-H-O-U-S-E I see things that nobody else sees (D-O-L-L-H-O-U-S-E) (I see things that nobody else sees) Hey, girl Look at my mom She's got it going on, hah You're blinded by her jewelry When you turn your back She pulls out a flask And forgets his infidelity Oh-oh, she's coming to the attic, plastic Go back to being plastic No one ever listens This wallpaper glistens One day they'll see what goes down in the kitchen Places, places, get in your places Throw on your dress and put on your doll faces Everyone thinks that we're perfect Please, don't let them look through the curtains Picture, picture, smile for the picture Pose with your brother, won't you be a good sister? Everyone thinks that we're perfect Please, don't let them look through the curtains D-O-L-L-H-O-U-S-E I see things that nobody else sees (D-O-L-L-H-O-U-S-E) (I see things that nobody else sees) Hey, girl (hey, girl) Hey, girl Open your walls Play with your dolls We'll be a perfect family Places, places, get in your places Throw on your dress and put on your doll faces Everyone thinks that we're perfect Please, don't let them look through the curtains Picture, picture, smile for the picture Pose with your brother, won't you be a good sister? Everyone thinks that we're perfect Please, don't let them look through the curtains D-O-L-L-H-O-U-S-E I see things that nobody else sees (D-O-L-L-H-O-U-S-E) (I see things that nobody else sees)
Emojis: 👧🏠💔🔪🚬👂🙅‍♀️🖼️✨🚫🎭🖼️👫🤷‍♀️👀🏠💔🥃🚫🎭🖼️👫🤷‍♀️👀🏠💔🔪🚬👂🙅‍♀️🖼️✨🚫🎭🖼️👫🤷‍♀️👀
---
Lyrics: Melody (Isso é Paula Guilherme) oh-ohm Nóis é made in roça Meu bonde usa chapéu, fivela e bota, bota, bota (bota) O rodeio para quando eu faço O movimento de galopa, galopa, galopa (galopa) Não é qualquer peão Que laça meu coração Fica ligado, pega a visão Vai pirar, vai 'xonar Vai sair pedindo mais Baba, baby, vem correndo atrás Barbie de chapéu, princesa da galopada O seu coração, eu prendo na laçada Pode admirar, mas não se apaixona Sou uma boneca muito malvadona Barbie de chapéu, princesa da galopada O seu coração, eu prendo na laçada Pode admirar, mas não se apaixona Sou uma boneca muito malvadona Barbie de chapéu Hi, Melody (hi, Melody, hi, Melody) Barbie in roça (Barbie in roça, Barbie in roça) Nóis é made in roça Meu bonde usa chapéu, fivela e bota, bota, bota (bota) O rodeio para quando eu faço O movimento de galopa, galopa, galopa (galopa) Não é qualquer peão Que laça meu coração Fica ligado, pega a visão Vai pirar, vai 'xonar Vai sair pedindo mais Baba, baby, vem correndo atrás Barbie de chapéu, princesa da galopada O seu coração, eu prendo na laçada Pode admirar, mas não se apaixona Sou uma boneca muito malvadona Barbie de chapéu, princesa da galopada O seu coração, eu prendo na laçada Pode admirar, mas não se apaixona Sou uma boneca muito malvadona Barbie de chapéu
Emojis: 🤠👢🥾🎠🐎 🎩❤️🚫🙅‍♀️🏃‍♀️👧👒👸🐎❤️🚫🙅‍♀️🏃‍♀️👧👒🤠👢🥾🎠🐎 🎩
---
Lyrics: Cold enough to chill my bones It feels like I don't know you anymore I don't understand why you're so cold to me With every breath you breathe I see there's something going on I don't understand why you're so cold Are we taking time or a time out? I can't take the in between Asking me for space here in my house You know how to fuck with me Acting like we're not together After everything that we've been through Sleeping up under the covers How am I so far away from you? Distant when we're kissing Feels so different Baby tell me how did you get so Cold enough to chill my bones It feels like I don't know you anymore I don't understand why you're so cold to me With every breath you breathe I see there's something going on I don't understand why you're so cold, yeah Woah yeah Woah yeah I don't understand why you're so cold What you holdin' on, holdin' on for? If you wanna leave just leave Why you wanna bite your tongue for? The silence is killing me Acting like we're not together If you don't want this, then what's the use? Sleeping up under the covers How am I so far away from you? Distant (oh) when we're kissing (yeah) Feel so different (yeah) Baby tell me how did you get so Cold enough to chill my bones It feels like I don't know you anymore I don't understand why you're so cold to me With every breath you breathe I see there's something going on I don't understand why you're so cold, yeah Woah yeah Woah yeah I don't understand why you're so cold, yeah (So tough it's a cold world) Woah yeah (So tough it's a cold world) Woah yeah (So tough it's a cold world) I don't understand why you're so cold Never thought that you were like this I took the tag off of and made you priceless I just spent a half a mil on a chandelier Now you tryna cut me off like a light switch, yeah Try 'n stay in our league Saying that you need some time to breath Thinking that I'm sleeping on the four letter word But the four letter word don't sleep We goin' two separate ways You ain't been actin' the same You gotta go girl where ya heart used to be You gold dig every day I switched the four door to the two door 'Cause I can't let my driver hear what you say Girl I tried to give you space Baby tell me How did you get so cold enough to chill my bones It feels like I don't know you anymore I don't understand why you're so cold to me With every breath you breathe I see there's something going on I don't understand why you're so cold (So tough it's a cold world) Woah yeah (So tough it's a cold world) Woah yeah (So tough it's a cold world) I don't understand why you're so cold, yeah (So tough it's a cold world) Woah yeah (So tough it's a cold world) Woah yeah (So tough it's a cold world) I don't understand why you're so cold
Emojis: 🧊🦴❓❤❌🌬⚰️❓🧊🦴❓💑❓💔🏠🚫🛏️💑❓💔🧊🦴❓❤❌🌬⚰️❓👫🚫💔🏠🚫🛏️💏❓💔🧊🦴❓
---
Lyrics: Sorry I ain't got no money I'm not trying to be funny But I left it all at home today You can call me what you wanna I ain't giving you a dollar This time I ain't gonna run away You might knock me down, you might knock me down But I will get back up again You can call it how you wanna I ain't giving you a dollar This time I ain't gonna run away (run away, run away) This time This time This time This time I ain't gonna run, run, run, run... Not this time Not this time Not this time Not this time Sorry I ain't got no money I'm not trying to be funny But I left it all at home today You can call me what you wanna I ain't giving you a dollar This time I ain't gonna run away You might knock me down, you might knock me down But I will get back up again You can call it how you wanna I ain't giving you a dollar This time I ain't gonna run away (run away, run away) This time This time This time This time I ain't gonna run, run, run, run, run... Not this time (Run, run, run, run, run...) Not this time This time I ain't gonna run, run, run, run Not this time Not this time Not this time Not this time Not this time
Emojis: 📞💸💔⌛🏞️💰🚫💔🌉😴💡💔💰🚫❓️🏡💸💔🕰️❓️🦄💔❤️💔🖼️🖕🤞🏀🚫❌
---
Lyrics: ${lyrics}
Emojis: `
        }
      ]
    }]
  })
  return await contentResult
}
