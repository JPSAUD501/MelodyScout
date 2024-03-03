import { GoogleGenerativeAI, HarmCategory, HarmBlockThreshold, type GenerateContentResult } from '@google/generative-ai'

export async function getLyricsExplanationGenerator (googleAiApiKey: string, lyrics: string, language: string): Promise<GenerateContentResult> {
  const genAI = new GoogleGenerativeAI(googleAiApiKey)
  const model = genAI.getGenerativeModel({ model: 'gemini-1.0-pro' })
  const contentResult = model.generateContent({
    generationConfig: {
      temperature: 0.9,
      topK: 1,
      topP: 1,
      maxOutputTokens: 150
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
          text: `
Help the user understand the lyrics of the song by providing a brief explanation of the song.

Lyrics: I'm at a payphone trying to call homeAll of my change I spent on you Where have the times gone, baby it's all wrong Where are the plans we made for two Yeah, I, I know it's hard to remember The people we used to beIt's even harder to picture That you're not here next to me You say it's too late to make it But is it too late to try And in our time that you wasted All of our bridges burned down I've wasted my nights You turned out the lights Now I'm paralyzed Still stuck in that time When we called it love But even the sun sets in paradise I'm at a payphone trying to call home All of my change I spent on you Where have the times gone, baby it's all wrong Where are the plans we made for twoIf Happy Ever Afters did existI would still be holding you like this All those fairy tales are full of shitOne more fucking love song, I'll be sick Oh, you turned your back on tomorrow'Cause you forgot yesterdayI gave you my love to borrowBut you just gave it away You can't expect me to be fineI don't expect you to careI know I've said it beforeBut all of our bridges burned downI've wasted my nightsYou turned out the lightsNow I'm paralyzedStill stuck in that timeWhen we called it loveBut even the sun sets in paradiseI'm at a payphone trying to call homeAll of my change I spent on youWhere have the times gone, baby it's all wrongWhere are the plans we made for two?If Happy Ever Afters did existI would still be holding you like thisAll those fairy tales are full of shitOne more fucking love song, I'll be sickNow I'm at a payphoneMan, fuck that shitI'll be out spending all this money While you're sitting round wondering Why it wasn't you who came up from nothing Made it from the bottomNow when you see me I'm stunting And all of my cars start with a push of a buttonTelling me the chances I blew upOr whatever you call itSwitch the number to my phoneSo you never could call itDon't need my name on my showYou can tell it I'm ballin' Swish, what a shame could have got pickedHad a really good game but you missed your last shotSo you talk about who you see at the topOr what you could have saw but sad to say it's over forPhantom pulled up valet open doorsWished I'd go away, got what you was looking forNow it's me who they want, so you can go and takeThat little piece of shit with youI'm at a payphone trying to call homeAll of my change I spent on youWhere have the times gone, baby it's all wrongWhere are the plans we made for twoIf Happy Ever Afters did existI would still be holding you like thisAll those fairy tales are full of shitOne more fucking love song, I'll be sickNow I'm at a payphone
Explanation Language: pt-BR
Explanation: A letra narra a trajetória de um relacionamento que chegou a um fim doloroso. O protagonista, em uma tentativa de contato, se vê sem recursos para ligar para casa, um reflexo da falta de conexão emocional que agora os separa. Enquanto relembra os momentos felizes compartilhados com sua parceira, é confrontado com a triste realidade da mudança que se abateu sobre eles. Ele se percebe imobilizado, aprisionado em lembranças de um tempo em que estavam unidos. Em meio a esse turbilhão de sentimentos, transparece a ira e frustração do narrador diante do desfecho do relacionamento. Ele acusa a parceira de ter renegado o passado e desperdiçado o tempo e amor que compartilharam. No desfecho da música, o protagonista declara sua independência emocional, afirmando que está melhor sem a presença dela e que está seguindo adiante com sua vida.

Lyrics: Cold enough to chill my bones It feels like I don't know you anymore I don't understand why you're so cold to me With every breath you breathe I see there's something going on I don't understand why you're so cold Are we taking time or a time out? I can't take the in between Asking me for space here in my house You know how to fuck with me Acting like we're not together After everything that we've been through Sleeping up under the covers How am I so far away from you? Distant when we're kissing Feel so different Baby, tell me how did you get so... Cold enough to chill my bones? It feels like I don't know you anymore I don't understand why you're so cold to me With every breath you breathe I see there's something going on I don't understand why you're so cold Why you're so Why you're so I don't understand why you're so Why you're so Why you're so I don't understand why you're so cold What you holdin' on, holdin' on for? If you wanna leave just leave Why you wanna bite your tongue for? The silence is killing me Acting like we're not together If you don't want this, then what's the use? Sleeping up under the covers How am I so far away from you? Distant, oh, when we're kissing, yeah Feel so different, yeah. Baby, tell me how did you get so... Cold enough to chill my bones? It feels like I don't know you anymore I don't understand why you're so cold to me With every breath you breathe I see there's something going on I don't understand why you're so cold Why you're so Why you're so I don't understand why you're so Why you're so Why you're so I don't understand why you're so cold Never thought that you were like this I took the tag off and made you priceless I just spent half a mill' on a chandelier Now you tryin'a cut me off like a light switch, yeah Tryna stay, and I leave Saying that you need some time to breathe Thinking that I'm sleeping on the four letter word But the four letter word don't sleep We goin' two separate ways You ain't been actin' the same You gotta go, but where your heart used to be You gold dig every day I switched the four door to the two door 'Cause I can't let my driver hear what you say Girl, I tried to give you space Baby, tell me how did you get so Cold enough to chill my bones? It feels like I don't know you anymore I don't understand why you're so cold to me With every breath you breathe I see there's something going on I don't understand why you're so cold
Explanation Language: en-US
Explanation: The song captures the raw emotions of heartache and confusion experienced by someone grappling with their partner's sudden emotional distance. The lyrics convey a deep sense of betrayal and loss as the singer struggles to comprehend the drastic shift in their relationship dynamics. Throughout the song, there's a poignant sense of longing for clarity and understanding, as the singer questions whether their relationship is salvageable or if it has reached its breaking point. The lack of communication exacerbates their pain, leaving them feeling isolated and disillusioned. The closing lines encapsulate the singer's anguish and frustration, as they come to terms with the harsh reality of their partner's transformation. Ultimately, the song serves as a poignant exploration of the complexities of love and loss, resonating with anyone who has grappled with the unraveling of a once-close bond.

Lyrics: Hey girl, open the walls Play with your dolls We'll be a perfect family When you walk away is when we really play You don't hear me when I say "Mom, please wake up" Dad's with a slut And your son is smoking cannabis No one never listens This wallpaper glistens Don't let them see what goes down in the kitchen Places, places Get in your places Throw on your dress and put on your doll faces Everyone thinks that we're perfect Please don't let them look through the curtains Picture, picture, smile for the picture Pose with your brother, won't you be a good sister? Everyone thinks that we're perfect Please don't let them look through the curtains D-O-L-L-H-O-U-S-E I see things that nobody else sees D-O-L-L-H-O-U-S-E I see things that nobody else sees Hey girl, look at my mom She's got it going on Ha, you're blinded by her jewelry When you turn your back She pulls out a flask And forgets his infidelity Uh-oh, she's coming to the attic, plastic Go back to being plastic No one never listens This wallpaper glistens One day they'll see what goes down in the kitchen Places, places Get in your places Throw on your dress and put on your doll faces Everyone thinks that we're perfect Please don't let them look through the curtains Picture, picture, smile for the picture Pose with your brother, won't you be a good sister? Everyone thinks that we're perfect Please don't let them look through the curtains D-O-L-L-H-O-U-S-E I see things that nobody else sees D-O-L-L-H-O-U-S-E I see things that nobody else sees Hey girl (hey girl) Hey girl, open your wallsPlay with your dolls We'll be a perfect family Places, places Get in your places Throw on your dress and put on your doll faces Everyone thinks that we're perfect Please don't let them look through the curtains Picture, picture, smile for the picture Pose with your brother, won't you be a good sister? Everyone thinks that we're perfect Please don't let them look through the curtains D-O-L-L-H-O-U-S-E I see things that nobody else sees D-O-L-L-H-O-U-S-E I see things that nobody else sees
Explanation Language: en-US
Explanation: The song critiques the idealized portrayal of family life, delving into hidden realities like secrets, infidelity, and substance abuse obscured beneath the veneer of perfection. It explores the facade people maintain, concealing their true struggles. Through the perspective of a young girl, forced to feign happiness despite knowing her family's flaws, it symbolizes the superficiality of the 'dollhouse' family—perfectly arranged yet lacking substance or genuine joy. Ultimately, the song implies the singer alone sees through the facade, bearing the burden of familial darkness.

Lyrics: ${lyrics}
Explanation Language: ${language}
Explanation: `
        }
      ]
    }]
  })
  return await contentResult
}
