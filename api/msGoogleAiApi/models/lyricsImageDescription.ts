import { GoogleGenerativeAI, HarmCategory, HarmBlockThreshold, type ChatSession } from '@google/generative-ai'

export function getLyricsImageDescriptionModel (googleAiApiKey: string): ChatSession {
  const genAI = new GoogleGenerativeAI(googleAiApiKey)
  const model = genAI.getGenerativeModel({ model: 'gemini-pro' })
  const chat = model.startChat({
    generationConfig: {
      temperature: 0.9,
      topK: 1,
      topP: 1,
      maxOutputTokens: 2048
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
    history: [
      {
        role: 'user',
        parts: [{ text: "Lyrics: All the things you'd sayAll the things you'd sayAll the things you'd sayI let it fall, my heartAnd as it fell, you rose to claim itIt was dark and I was overUntil you kissed my lips and you saved meMy hands, they're strongBut my knees were far too weakTo stand in your armsWithout falling to your feetBut there's a side to youThat I never knew, never knewAll the things you'd sayThey were never true, never trueAnd the games you playYou would always win, always winBut I set fire to the rainWatched it pour as I touched your faceWell, it burned while I cried'Cause I heard it screaming out your nameYour nameBut I set fire to the rainWatched it pour as I touched your faceWell, it burned while I cried'Cause I heard it screaming out your nameYour nameAll the things you'd sayBut I set fireAll the things you'd sayAll the things you'd say" }]
      },
      {
        role: 'model',
        parts: [{ text: 'A burning raindrop falling from a stormy sky and landing on a delicate rose petal. Darker background to contrasting with the burning raindrop.' }]
      },
      {
        role: 'user',
        parts: [{ text: "Lyrics: Hey girl, open the wallsPlay with your dollsWe'll be a perfect familyWhen you walk away is when we really playYou don't hear me when I say\"Mom, please wake upDad's with a slutAnd your son is smoking cannabis\"No one never listensThis wallpaper glistensDon't let them see what goes down in the kitchenPlaces, placesGet in your placesThrow on your dress and put on your doll facesEveryone thinks that we're perfectPlease don't let them look through the curtainsPicture, picture, smile for the picturePose with your brother, won't you be a good sister?Everyone thinks that we're perfectPlease don't let them look through the curtainsD-O-L-L-H-O-U-S-EI see things that nobody else seesD-O-L-L-H-O-U-S-EI see things that nobody else seesHey girl, look at my momShe's got it going onHa, you're blinded by her jewelryWhen you turn your backShe pulls out a flaskAnd forgets his infidelityUh-oh, she's coming to the attic, plasticGo back to being plasticNo one never listensThis wallpaper glistensOne day they'll see what goes down in the kitchenPlaces, placesGet in your placesThrow on your dress and put on your doll facesEveryone thinks that we're perfectPlease don't let them look through the curtainsPicture, picture, smile for the picturePose with your brother, won't you be a good sister?Everyone thinks that we're perfectPlease don't let them look through the curtainsD-O-L-L-H-O-U-S-EI see things that nobody else seesD-O-L-L-H-O-U-S-EI see things that nobody else seesHey girl (hey girl)Hey girl, open your wallsPlay with your dollsWe'll be a perfect familyPlaces, placesGet in your placesThrow on your dress and put on your doll facesEveryone thinks that we're perfectPlease don't let them look through the curtainsPicture, picture, smile for the picturePose with your brother, won't you be a good sister?Everyone thinks that we're perfectPlease don't let them look through the curtainsD-O-L-L-H-O-U-S-EI see things that nobody else seesD-O-L-L-H-O-U-S-EI see things that nobody else sees" }]
      },
      {
        role: 'model',
        parts: [{ text: 'An old dollhouse with a family of dolls with fake smiles on their faces. The dollhouse is broken in some parts and dusty.' }]
      },
      {
        role: 'user',
        parts: [{ text: "Lyrics: All the things you'd sayAll the things you'd sayAll the things you'd sayI let it fall, my heartAnd as it fell, you rose to claim itIt was dark and I was overUntil you kissed my lips and you saved meMy hands, they're strongBut my knees were far too weakTo stand in your armsWithout falling to your feetBut there's a side to youThat I never knew, never knewAll the things you'd sayThey were never true, never trueAnd the games you playYou would always win, always winBut I set fire to the rainWatched it pour as I touched your faceWell, it burned while I cried'Cause I heard it screaming out your nameYour nameBut I set fire to the rainWatched it pour as I touched your faceWell, it burned while I cried'Cause I heard it screaming out your nameYour nameAll the things you'd sayBut I set fireAll the things you'd sayAll the things you'd say" }]
      },
      {
        role: 'model',
        parts: [{ text: 'A burning raindrop falling from a dark sky, with a person reaching out to touch it. The raindrop is illuminated with flames.' }]
      },
      {
        role: 'user',
        parts: [{ text: "Lyrics: I'm at a payphone trying to call homeAll of my change I spent on youWhere have the times gone, baby it's all wrongWhere are the plans we made for twoYeah, I, I know it's hard to rememberThe people we used to beIt's even harder to pictureThat you're not here next to meYou say it's too late to make itBut is it too late to tryAnd in our time that you wastedAll of our bridges burned downI've wasted my nightsYou turned out the lightsNow I'm paralyzedStill stuck in that timeWhen we called it loveBut even the sun sets in paradiseI'm at a payphone trying to call homeAll of my change I spent on youWhere have the times gone, baby it's all wrongWhere are the plans we made for twoIf Happy Ever Afters did existI would still be holding you like thisAll those fairy tales are full of shitOne more fucking love song, I'll be sickOh, you turned your back on tomorrow'Cause you forgot yesterdayI gave you my love to borrowBut you just gave it awayYou can't expect me to be fineI don't expect you to careI know I've said it beforeBut all of our bridges burned downI've wasted my nightsYou turned out the lightsNow I'm paralyzedStill stuck in that timeWhen we called it loveBut even the sun sets in paradiseI'm at a payphone trying to call homeAll of my change I spent on youWhere have the times gone, baby it's all wrongWhere are the plans we made for two?If Happy Ever Afters did existI would still be holding you like thisAll those fairy tales are full of shitOne more fucking love song, I'll be sickNow I'm at a payphoneMan, fuck that shitI'll be out spending all this moneyWhile you're sitting round wonderingWhy it wasn't you who came up from nothingMade it from the bottomNow when you see me I'm stuntingAnd all of my cars start with a push of a buttonTelling me the chances I blew upOr whatever you call itSwitch the number to my phoneSo you never could call itDon't need my name on my showYou can tell it I'm ballin'Swish, what a shame could have got pickedHad a really good game but you missed your last shotSo you talk about who you see at the topOr what you could have saw but sad to say it's over forPhantom pulled up valet open doorsWished I'd go away, got what you was looking forNow it's me who they want, so you can go and takeThat little piece of shit with youI'm at a payphone trying to call homeAll of my change I spent on youWhere have the times gone, baby it's all wrongWhere are the plans we made for twoIf Happy Ever Afters did existI would still be holding you like thisAll those fairy tales are full of shitOne more fucking love song, I'll be sickNow I'm at a payphone" }]
      },
      {
        role: 'model',
        parts: [{ text: 'A black and white image of a man sitting at a payphone. He is looking down at the phone, and his face is expressionless. The payphone is located in a dark alleyway, and there are no other people around. The only light comes from the streetlamp above the payphone.' }]
      },
      {
        role: 'user',
        parts: [{ text: "Lyrics: Hey girl, open the wallsPlay with your dollsWe'll be a perfect familyWhen you walk away is when we really playYou don't hear me when I say\"Mom, please wake upDad's with a slutAnd your son is smoking cannabis\"No one never listensThis wallpaper glistensDon't let them see what goes down in the kitchenPlaces, placesGet in your placesThrow on your dress and put on your doll facesEveryone thinks that we're perfectPlease don't let them look through the curtainsPicture, picture, smile for the picturePose with your brother, won't you be a good sister?Everyone thinks that we're perfectPlease don't let them look through the curtainsD-O-L-L-H-O-U-S-EI see things that nobody else seesD-O-L-L-H-O-U-S-EI see things that nobody else seesHey girl, look at my momShe's got it going onHa, you're blinded by her jewelryWhen you turn your backShe pulls out a flaskAnd forgets his infidelityUh-oh, she's coming to the attic, plasticGo back to being plasticNo one never listensThis wallpaper glistensOne day they'll see what goes down in the kitchenPlaces, placesGet in your placesThrow on your dress and put on your doll facesEveryone thinks that we're perfectPlease don't let them look through the curtainsPicture, picture, smile for the picturePose with your brother, won't you be a good sister?Everyone thinks that we're perfectPlease don't let them look through the curtainsD-O-L-L-H-O-U-S-EI see things that nobody else seesD-O-L-L-H-O-U-S-EI see things that nobody else seesHey girl (hey girl)Hey girl, open your wallsPlay with your dollsWe'll be a perfect familyPlaces, placesGet in your placesThrow on your dress and put on your doll facesEveryone thinks that we're perfectPlease don't let them look through the curtainsPicture, picture, smile for the picturePose with your brother, won't you be a good sister?Everyone thinks that we're perfectPlease don't let them look through the curtainsD-O-L-L-H-O-U-S-EI see things that nobody else seesD-O-L-L-H-O-U-S-EI see things that nobody else sees" }]
      },
      {
        role: 'model',
        parts: [{ text: "A young girl sitting in a dollhouse, surrounded by her dolls. The girl looks sad and lonely, and the dolls look like they are staring at her. The dollhouse is in a dark room, and the only light comes from a single candle. The girl is holding a doll in her arms, and the doll's face is covered in tears. The girl looks like she is about to cry herself." }]
      },
      {
        role: 'user',
        parts: [{ text: 'Lyrics: De chocolate nosso amor é feitoEntão não tem jeito, gruda em mimIsso não é só confete, me abraça, enlouqueceMeu vício sem fimAlô Doçura, isso é mais que uma Serenata de AmorCom você tenho a SensaçãoQue o nosso Lance é para a vida inteiraSeu olhar é o meu Sonho de ValsaÉ o doce que eu sempre quisMeu Prestígio é estar com vocêE pedir sempre BisVocê é mais preciosaE bem mais brilhanteQue um Diamante NegroPenso em você todo tempoE nesse seu TalentoDe me fazer felizDe chocolate nosso amor é feitoEntão não tem jeito, gruda em mimIsso não é só confete, me abraça, enlouqueceMeu vício sem fimAlô Doçura, isso é mais que uma Serenata de AmorCom você tenho a SensaçãoQue o nosso Lance é para a vida inteiraSeu olhar é o meu Sonho de ValsaÉ o doce que eu sempre quisO meu Prestígio é estar com vocêE pedir sempre BisVocê é mais preciosaE bem mais brilhanteQue um Diamante NegroPenso em você todo tempoE nesse seu TalentoDe me fazer felizDe chocolate nosso amor é feitoEntão não tem jeito, gruda em mimIsso não é só confete, me abraça, enlouqueceMeu vício sem fimIsso não é só confete, me abraça, enlouqueceMeu vício sem fim' }]
      },
      {
        role: 'model',
        parts: [{ text: 'A box of chocolates, wrapped in a red ribbon. The chocolates are in the shape of hearts, and some have white chocolate drizzled on top. The background is a light pink, and there are small, white hearts floating around the chocolates.' }]
      },
      {
        role: 'user',
        parts: [{ text: "Lyrics: Cold enough to chill my bonesIt feels like I don't know you anymoreI don't understand why you're so cold to meWith every breath you breatheI see there's something going onI don't understand why you're so coldAre we taking time, or a time out?I can't take the in-betweenAsking me for space here in my houseYou know how to fuck with meActing like we're not togetherAfter everything that we've been throughSleeping up under the coversHow am I so far away from you?Distant, when we're kissingFeel so differentBaby, tell me how did you get soCold enough to chill my bonesIt feels like I don't know you anymoreI don't understand why you're so cold to meWith every breath you breatheI see there's something going onI don't understand why you're so cold, yeahWhoa, yeahWhoa, yeahI don't understand why you're so coldWhat you holdin' on, holdin' on for?If you wanna leave, just leaveWhy you wanna bite your tongue for?The silence is killing meActing like we're not togetherIf you don't want this, then what's the use?Sleeping up under the coversHow am I so far away from you?Distant, when we're kissingFeel so differentBaby tell me how did you get soCold enough to chill my bonesIt feels like I don't know you anymoreI don't understand why you're so cold to meWith every breath you breatheI see there's something going onI don't understand why you're so cold, yeahWhoa, yeahWhoa, yeahI don't understand why you're so cold, yeahSo cold, it's a cold worldWhoa, yeahSo cold, it's a cold worldWhoa, yeahSo cold, it's a cold worldI don't understand why you're so coldNever thought that you were like thisI took the tag off, and made you pricelessI just spent half a mill' on a chandelierNow you tryna' cut me off like a light switch, yeahTryna' stay, and I leaveSaying that you need some time to breatheThinking that I'm sleeping on the four letter wordBut the four letter word don't sleepWe goin' two separate waysYou ain't been actin' the sameYou gotta go, but where your heart used to beYou gold dig every dayI switched the four door to the two door'Cause I can't let my driver hear what you sayGirl, I tried to give you spaceBaby, tell me how did you get soCold enough to chill my bonesIt feels like I don't know you anymoreI don't understand why you're so cold to meWith every breath you breatheI see there's something going onI don't understand why you're so coldSo cold, it's a cold worldWhoa, yeahSo cold, it's a cold worldWhoa, yeahSo cold, it's a cold worldI don't understand why you're so cold, yeahSo cold, it's a cold worldWhoa, yeahSo cold, it's a cold worldWhoa, yeahSo cold, it's a cold worldI don't understand why you're so cold" }]
      },
      {
        role: 'model',
        parts: [{ text: 'A heart-shaped ice cube melting on a black background. The ice cube is slowly dripping water, and the water is freezing into small icicles. The background is dark and cold, and the only light comes from the ice cube.' }]
      },
      {
        role: 'user',
        parts: [{ text: "Lyrics: We'll never get freeLamb to the slaughterWhat you gon' do when there's blood in the water?The price of your greed is your son and your daughterWhat you gon' do when there's blood in the water?Look me in my eyesTell me everything's not fineOh, the people ain't happyAnd the river has run dryYou thought you could go freeBut the system is done forIf you listen real closelyThere's a knock at your front doorWe'll never get freeLamb to the slaughterWhat you gon' do when there's blood in the water?The price of your greed is your son and your daughterWhat you gon' do when there's blood in the water?When there's blood in the(Uh, uh)When there's blood in the(Uh, uh)Beg me for mercyAdmit you were toxicYou poisoned me just forAnother dollar in your pocketNow I am the violenceI am the sicknessWon't accept your silenceBeg me for forgivenessWe'll never get freeLamb to the slaughterWhat you gon' do when there's blood in the water?The price of your greed, your son and your daughterWhat you gon' do when there's blood in the water?When there's blood in the water(Uh, uh)When there's blood in the(Uh, uh)I am the peopleI am the stormI am the riotI am the swarmWhen the last tree's fallen the animal can't hideMoney won't solve itWhat's your alibi?What's your alibi?What's your alibi?What you gon' do when there's blood in the, blood in the water?When there's blood in the water(Uh, uh)When there's blood in the(Uh, uh)When there's blood in the water" }]
      },
      {
        role: 'model',
        parts: [{ text: 'A river of vibrant red blood flowing through a lush forest. The riverbanks are lined with trees. In the distance, a storm gathers.' }]
      }
    ]
  })
  return chat
}
