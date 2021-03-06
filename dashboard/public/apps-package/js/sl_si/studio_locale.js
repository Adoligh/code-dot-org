var studio_locale = {lc:{"ar":function(n){
  if (n === 0) {
    return 'zero';
  }
  if (n == 1) {
    return 'one';
  }
  if (n == 2) {
    return 'two';
  }
  if ((n % 100) >= 3 && (n % 100) <= 10 && n == Math.floor(n)) {
    return 'few';
  }
  if ((n % 100) >= 11 && (n % 100) <= 99 && n == Math.floor(n)) {
    return 'many';
  }
  return 'other';
},"en":function(n){return n===1?"one":"other"},"bg":function(n){return n===1?"one":"other"},"bn":function(n){return n===1?"one":"other"},"ca":function(n){return n===1?"one":"other"},"cs":function(n){
  if (n == 1) {
    return 'one';
  }
  if (n == 2 || n == 3 || n == 4) {
    return 'few';
  }
  return 'other';
},"da":function(n){return n===1?"one":"other"},"de":function(n){return n===1?"one":"other"},"el":function(n){return n===1?"one":"other"},"es":function(n){return n===1?"one":"other"},"et":function(n){return n===1?"one":"other"},"eu":function(n){return n===1?"one":"other"},"fa":function(n){return "other"},"fi":function(n){return n===1?"one":"other"},"fil":function(n){return n===0||n==1?"one":"other"},"fr":function(n){return Math.floor(n)===0||Math.floor(n)==1?"one":"other"},"ga":function(n){return n==1?"one":(n==2?"two":"other")},"gl":function(n){return n===1?"one":"other"},"he":function(n){return n===1?"one":"other"},"hi":function(n){return n===0||n==1?"one":"other"},"hr":function(n){
  if ((n % 10) == 1 && (n % 100) != 11) {
    return 'one';
  }
  if ((n % 10) >= 2 && (n % 10) <= 4 &&
      ((n % 100) < 12 || (n % 100) > 14) && n == Math.floor(n)) {
    return 'few';
  }
  if ((n % 10) === 0 || ((n % 10) >= 5 && (n % 10) <= 9) ||
      ((n % 100) >= 11 && (n % 100) <= 14) && n == Math.floor(n)) {
    return 'many';
  }
  return 'other';
},"hu":function(n){return "other"},"id":function(n){return "other"},"is":function(n){
    return ((n%10) === 1 && (n%100) !== 11) ? 'one' : 'other';
  },"it":function(n){return n===1?"one":"other"},"ja":function(n){return "other"},"ko":function(n){return "other"},"lt":function(n){
  if ((n % 10) == 1 && ((n % 100) < 11 || (n % 100) > 19)) {
    return 'one';
  }
  if ((n % 10) >= 2 && (n % 10) <= 9 &&
      ((n % 100) < 11 || (n % 100) > 19) && n == Math.floor(n)) {
    return 'few';
  }
  return 'other';
},"lv":function(n){
  if (n === 0) {
    return 'zero';
  }
  if ((n % 10) == 1 && (n % 100) != 11) {
    return 'one';
  }
  return 'other';
},"mk":function(n){return (n%10)==1&&n!=11?"one":"other"},"mr":function(n){return n===1?"one":"other"},"ms":function(n){return "other"},"mt":function(n){
  if (n == 1) {
    return 'one';
  }
  if (n === 0 || ((n % 100) >= 2 && (n % 100) <= 4 && n == Math.floor(n))) {
    return 'few';
  }
  if ((n % 100) >= 11 && (n % 100) <= 19 && n == Math.floor(n)) {
    return 'many';
  }
  return 'other';
},"nl":function(n){return n===1?"one":"other"},"no":function(n){return n===1?"one":"other"},"pl":function(n){
  if (n == 1) {
    return 'one';
  }
  if ((n % 10) >= 2 && (n % 10) <= 4 &&
      ((n % 100) < 12 || (n % 100) > 14) && n == Math.floor(n)) {
    return 'few';
  }
  if ((n % 10) === 0 || n != 1 && (n % 10) == 1 ||
      ((n % 10) >= 5 && (n % 10) <= 9 || (n % 100) >= 12 && (n % 100) <= 14) &&
      n == Math.floor(n)) {
    return 'many';
  }
  return 'other';
},"pt":function(n){return n===1?"one":"other"},"ro":function(n){
  if (n == 1) {
    return 'one';
  }
  if (n === 0 || n != 1 && (n % 100) >= 1 &&
      (n % 100) <= 19 && n == Math.floor(n)) {
    return 'few';
  }
  return 'other';
},"ru":function(n){
  if ((n % 10) == 1 && (n % 100) != 11) {
    return 'one';
  }
  if ((n % 10) >= 2 && (n % 10) <= 4 &&
      ((n % 100) < 12 || (n % 100) > 14) && n == Math.floor(n)) {
    return 'few';
  }
  if ((n % 10) === 0 || ((n % 10) >= 5 && (n % 10) <= 9) ||
      ((n % 100) >= 11 && (n % 100) <= 14) && n == Math.floor(n)) {
    return 'many';
  }
  return 'other';
},"sk":function(n){
  if (n == 1) {
    return 'one';
  }
  if (n == 2 || n == 3 || n == 4) {
    return 'few';
  }
  return 'other';
},"sl":function(n){
  if ((n % 100) == 1) {
    return 'one';
  }
  if ((n % 100) == 2) {
    return 'two';
  }
  if ((n % 100) == 3 || (n % 100) == 4) {
    return 'few';
  }
  return 'other';
},"sq":function(n){return n===1?"one":"other"},"sr":function(n){
  if ((n % 10) == 1 && (n % 100) != 11) {
    return 'one';
  }
  if ((n % 10) >= 2 && (n % 10) <= 4 &&
      ((n % 100) < 12 || (n % 100) > 14) && n == Math.floor(n)) {
    return 'few';
  }
  if ((n % 10) === 0 || ((n % 10) >= 5 && (n % 10) <= 9) ||
      ((n % 100) >= 11 && (n % 100) <= 14) && n == Math.floor(n)) {
    return 'many';
  }
  return 'other';
},"sv":function(n){return n===1?"one":"other"},"ta":function(n){return n===1?"one":"other"},"th":function(n){return "other"},"tr":function(n){return n===1?"one":"other"},"uk":function(n){
  if ((n % 10) == 1 && (n % 100) != 11) {
    return 'one';
  }
  if ((n % 10) >= 2 && (n % 10) <= 4 &&
      ((n % 100) < 12 || (n % 100) > 14) && n == Math.floor(n)) {
    return 'few';
  }
  if ((n % 10) === 0 || ((n % 10) >= 5 && (n % 10) <= 9) ||
      ((n % 100) >= 11 && (n % 100) <= 14) && n == Math.floor(n)) {
    return 'many';
  }
  return 'other';
},"ur":function(n){return n===1?"one":"other"},"vi":function(n){return "other"},"zh":function(n){return "other"}},
c:function(d,k){if(!d)throw new Error("MessageFormat: Data required for '"+k+"'.")},
n:function(d,k,o){if(isNaN(d[k]))throw new Error("MessageFormat: '"+k+"' isn't a number.");return d[k]-(o||0)},
v:function(d,k){studio_locale.c(d,k);return d[k]},
p:function(d,k,o,l,p){studio_locale.c(d,k);return d[k] in p?p[d[k]]:(k=studio_locale.lc[l](d[k]-o),k in p?p[k]:p.other)},
s:function(d,k,p){studio_locale.c(d,k);return d[k] in p?p[d[k]]:p.other}};
(window.blockly = window.blockly || {}).studio_locale = {
"actor":function(d){return "igralec"},
"addItems1":function(d){return "add 1 item of type"},
"addItems2":function(d){return "add 2 items of type"},
"addItems3":function(d){return "add 3 items of type"},
"addItems5":function(d){return "add 5 items of type"},
"addItems10":function(d){return "add 10 items of type"},
"addItemsRandom":function(d){return "add random items of type"},
"addItemsTooltip":function(d){return "Add items to the scene."},
"alienInvasion":function(d){return "Nezemljani napadajo!"},
"backgroundBlack":function(d){return "črna"},
"backgroundCave":function(d){return "votlina"},
"backgroundCloudy":function(d){return "oblačno"},
"backgroundHardcourt":function(d){return "teniško igrišče"},
"backgroundNight":function(d){return "noč"},
"backgroundUnderwater":function(d){return "pod vodo"},
"backgroundCity":function(d){return "mesto"},
"backgroundDesert":function(d){return "puščava"},
"backgroundRainbow":function(d){return "mavrica"},
"backgroundSoccer":function(d){return "nogomet"},
"backgroundSpace":function(d){return "vesolje"},
"backgroundTennis":function(d){return "tenis"},
"backgroundWinter":function(d){return "zima"},
"catActions":function(d){return "Dejanja"},
"catControl":function(d){return "Zanke"},
"catEvents":function(d){return "Dogodki"},
"catLogic":function(d){return "Logika"},
"catMath":function(d){return "Matematika"},
"catProcedures":function(d){return "Funkcije"},
"catText":function(d){return "Besedilo"},
"catVariables":function(d){return "Spremenljivke"},
"changeScoreTooltip":function(d){return "Dodaj ali odstrani točko rezultatu."},
"changeScoreTooltipK1":function(d){return "Dodaj točko rezultatu."},
"continue":function(d){return "Nadaljuj"},
"decrementPlayerScore":function(d){return "odstrani točko"},
"defaultSayText":function(d){return "tipkaj tukaj"},
"dropletBlock_changeScore_description":function(d){return "Dodaj ali odstrani točko rezultatu."},
"dropletBlock_penColour_description":function(d){return "Sets the color of the line drawn behind the turtle as it moves"},
"dropletBlock_penColour_param0":function(d){return "color"},
"dropletBlock_setBackground_description":function(d){return "Nastavite sliko ozadja"},
"dropletBlock_setSpriteEmotion_description":function(d){return "Nastavi igralčeva čustva"},
"dropletBlock_setSpritePosition_description":function(d){return "Takoj prestavi igralca na določeno mesto."},
"dropletBlock_setSpriteSpeed_description":function(d){return "Določi hitrost igralca"},
"dropletBlock_setSprite_description":function(d){return "Nastavi sliko igralca"},
"dropletBlock_throw_description":function(d){return "Izstrelek poleti iz določenega igralca."},
"dropletBlock_vanish_description":function(d){return "Igralca naredi nevidnega."},
"emotion":function(d){return "razpoloženje"},
"finalLevel":function(d){return "Čestitke! Rešil/a si zadnjo uganko."},
"for":function(d){return "za"},
"hello":function(d){return "zdravo"},
"helloWorld":function(d){return "Pozdravljen svet!"},
"incrementPlayerScore":function(d){return "dosežena točka"},
"itemBlueFireball":function(d){return "modri izstrelek"},
"itemPurpleFireball":function(d){return "vijolični izstrelek"},
"itemRedFireball":function(d){return "rdeči izstrelek"},
"itemYellowHearts":function(d){return "rumeni srčki"},
"itemPurpleHearts":function(d){return "vijolični srčki"},
"itemRedHearts":function(d){return "rdeči srčki"},
"itemRandom":function(d){return "naključno"},
"itemAnna":function(d){return "hook"},
"itemElsa":function(d){return "iskrica"},
"itemHiro":function(d){return "mikroboti"},
"itemBaymax":function(d){return "raketa"},
"itemRapunzel":function(d){return "ponev"},
"itemCherry":function(d){return "češnja"},
"itemIce":function(d){return "led"},
"itemDuck":function(d){return "raca"},
"makeProjectileDisappear":function(d){return "izgini"},
"makeProjectileBounce":function(d){return "poskočiti"},
"makeProjectileBlueFireball":function(d){return "naredi modro gorečo kroglo"},
"makeProjectilePurpleFireball":function(d){return "naredi vijolično gorečo kroglo"},
"makeProjectileRedFireball":function(d){return "naredi rdečo gorečo kroglo"},
"makeProjectileYellowHearts":function(d){return "naredi rumena srca"},
"makeProjectilePurpleHearts":function(d){return "naredi vijolična srca"},
"makeProjectileRedHearts":function(d){return "naredi rdeča srca"},
"makeProjectileTooltip":function(d){return "Naj se projektil, ki je ravnokar trčil, odbije ali izgine."},
"makeYourOwn":function(d){return "Izdelaj svojo igrico/aplikacijo v Play Lab"},
"moveDirectionDown":function(d){return "dol"},
"moveDirectionLeft":function(d){return "levo"},
"moveDirectionRight":function(d){return "desno"},
"moveDirectionUp":function(d){return "gor"},
"moveDirectionRandom":function(d){return "naključno"},
"moveDistance25":function(d){return "25 pikslov"},
"moveDistance50":function(d){return "50 pikslov"},
"moveDistance100":function(d){return "100 pikslov"},
"moveDistance200":function(d){return "200 pikslov"},
"moveDistance400":function(d){return "400 pikslov"},
"moveDistancePixels":function(d){return "piksli"},
"moveDistanceRandom":function(d){return "naključno pikslov"},
"moveDistanceTooltip":function(d){return "Premakni igralca za določeno razdaljo v določeni smeri."},
"moveSprite":function(d){return "premakni"},
"moveSpriteN":function(d){return "premakni igralca "+studio_locale.v(d,"spriteIndex")},
"toXY":function(d){return "to x,y"},
"moveDown":function(d){return "premakni se dol"},
"moveDownTooltip":function(d){return "Premakni igralca dol."},
"moveLeft":function(d){return "premakni se levo"},
"moveLeftTooltip":function(d){return "Premakni igralca v levo."},
"moveRight":function(d){return "premakni se desno"},
"moveRightTooltip":function(d){return "Premakni igralca v desno."},
"moveUp":function(d){return "premakni se gor"},
"moveUpTooltip":function(d){return "Premakni igralca navzgor."},
"moveTooltip":function(d){return "Premakni igralca."},
"nextLevel":function(d){return "Čestitke! Zaključil/a si to uganko."},
"no":function(d){return "Ne"},
"numBlocksNeeded":function(d){return "Ta uganka je lahko rešena z %1 bloki."},
"onEventTooltip":function(d){return "Execute code in response to the specified event."},
"ouchExclamation":function(d){return "Av!"},
"playSoundCrunch":function(d){return "predvajaj zvok drobljenja"},
"playSoundGoal1":function(d){return "predvajaj zvok: cilj 1"},
"playSoundGoal2":function(d){return "predvajaj zvok: cilj 2"},
"playSoundHit":function(d){return "predvajaj zvok udarca"},
"playSoundLosePoint":function(d){return "predvajaj zvok: izgubljena točka"},
"playSoundLosePoint2":function(d){return "predvajaj zvok: izgubljena točka 2"},
"playSoundRetro":function(d){return "predvajaj retro zvok"},
"playSoundRubber":function(d){return "predvajaj zvok: radirka"},
"playSoundSlap":function(d){return "predvajaj zvok: udarec"},
"playSoundTooltip":function(d){return "Predvajaj izbrani zvok."},
"playSoundWinPoint":function(d){return "predvajaj zvok: dobljena točka"},
"playSoundWinPoint2":function(d){return "predvajaj zvok: dobljena točka 2"},
"playSoundWood":function(d){return "predvajaj zvok: lesen udarec"},
"positionOutTopLeft":function(d){return "na zgornji položaj, zgoraj levo"},
"positionOutTopRight":function(d){return "na zgornji položaj, zgoraj desno"},
"positionTopOutLeft":function(d){return "na vrhnji položaj, zunaj levo"},
"positionTopLeft":function(d){return "na vrhnji položaj, levo"},
"positionTopCenter":function(d){return "na vrhnji položaj, sredina"},
"positionTopRight":function(d){return "na vrhnji položaj, desno"},
"positionTopOutRight":function(d){return "na vrhnji položaj, zunaj desno"},
"positionMiddleLeft":function(d){return "na sredinski položaj, levo"},
"positionMiddleCenter":function(d){return "na sredinski položaj, sredina"},
"positionMiddleRight":function(d){return "na sredinski položaj, desno"},
"positionBottomOutLeft":function(d){return "na položaj na dnu, zunaj levo"},
"positionBottomLeft":function(d){return "na položaj na dnu, levo"},
"positionBottomCenter":function(d){return "na položaj na dnu, sredina"},
"positionBottomRight":function(d){return "na položaj na dnu, desno"},
"positionBottomOutRight":function(d){return "na položaj na dnu, zunaj desno"},
"positionOutBottomLeft":function(d){return "na spodnji položaj, levo"},
"positionOutBottomRight":function(d){return "na spodnji položaj, desno"},
"positionRandom":function(d){return "na naključni položaj"},
"projectileBlueFireball":function(d){return "modri izstrelek"},
"projectilePurpleFireball":function(d){return "vijolični izstrelek"},
"projectileRedFireball":function(d){return "rdeči izstrelek"},
"projectileYellowHearts":function(d){return "rumeni srčki"},
"projectilePurpleHearts":function(d){return "vijolični srčki"},
"projectileRedHearts":function(d){return "rdeči srčki"},
"projectileRandom":function(d){return "naključno"},
"projectileAnna":function(d){return "Anna"},
"projectileElsa":function(d){return "iskrica"},
"projectileHiro":function(d){return "mikroboti"},
"projectileBaymax":function(d){return "raketa"},
"projectileRapunzel":function(d){return "ponev"},
"projectileCherry":function(d){return "češnja"},
"projectileIce":function(d){return "led"},
"projectileDuck":function(d){return "raca"},
"reinfFeedbackMsg":function(d){return "Lahko pritisnete gumb \"Igraj naprej\" in se vrnete k igranju zgodbe."},
"repeatForever":function(d){return "ponavljaj kar naprej"},
"repeatDo":function(d){return "izvrši"},
"repeatForeverTooltip":function(d){return "Ves čas, ko poteka zgodba, ponavljaj spodaj navedena dejanja."},
"saySprite":function(d){return "reci (napiši)"},
"saySpriteN":function(d){return "igralec "+studio_locale.v(d,"spriteIndex")+" izjavi"},
"saySpriteTooltip":function(d){return "Prikaži oblaček z besedilom določenega igralca."},
"saySpriteChoices_0":function(d){return "Živjo."},
"saySpriteChoices_1":function(d){return "Pozdravljeni vsi!"},
"saySpriteChoices_2":function(d){return "Kako ti gre?"},
"saySpriteChoices_3":function(d){return "Dobro jutro"},
"saySpriteChoices_4":function(d){return "Dober dan"},
"saySpriteChoices_5":function(d){return "Lahko noč"},
"saySpriteChoices_6":function(d){return "Dober večer"},
"saySpriteChoices_7":function(d){return "Kaj je novega?"},
"saySpriteChoices_8":function(d){return "Kaj?"},
"saySpriteChoices_9":function(d){return "Kje?"},
"saySpriteChoices_10":function(d){return "Kdaj?"},
"saySpriteChoices_11":function(d){return "Dobro."},
"saySpriteChoices_12":function(d){return "Odlično!"},
"saySpriteChoices_13":function(d){return "Prav."},
"saySpriteChoices_14":function(d){return "Ni slabo."},
"saySpriteChoices_15":function(d){return "Veliko sreče."},
"saySpriteChoices_16":function(d){return "Da"},
"saySpriteChoices_17":function(d){return "Ne"},
"saySpriteChoices_18":function(d){return "V redu"},
"saySpriteChoices_19":function(d){return "Lep met!"},
"saySpriteChoices_20":function(d){return "Lep dan."},
"saySpriteChoices_21":function(d){return "Adijo."},
"saySpriteChoices_22":function(d){return "Bom takoj nazaj."},
"saySpriteChoices_23":function(d){return "Se vidimo jutri!"},
"saySpriteChoices_24":function(d){return "Se vidimo kasneje!"},
"saySpriteChoices_25":function(d){return "Drži se!"},
"saySpriteChoices_26":function(d){return "Uživaj!"},
"saySpriteChoices_27":function(d){return "Moram iti."},
"saySpriteChoices_28":function(d){return "Sva prijatelja?"},
"saySpriteChoices_29":function(d){return "Zelo dobro opravljeno!"},
"saySpriteChoices_30":function(d){return "Woo hoo!"},
"saySpriteChoices_31":function(d){return "Yay!"},
"saySpriteChoices_32":function(d){return "Me veseli, da sva se spoznala."},
"saySpriteChoices_33":function(d){return "Prav!"},
"saySpriteChoices_34":function(d){return "Hvala"},
"saySpriteChoices_35":function(d){return "Ne, hvala"},
"saySpriteChoices_36":function(d){return "Aaaaaah!"},
"saySpriteChoices_37":function(d){return "Je že v redu"},
"saySpriteChoices_38":function(d){return "Danes"},
"saySpriteChoices_39":function(d){return "Jutri"},
"saySpriteChoices_40":function(d){return "Včeraj"},
"saySpriteChoices_41":function(d){return "Našel sem te!"},
"saySpriteChoices_42":function(d){return "Našel si me!"},
"saySpriteChoices_43":function(d){return "10, 9, 8, 7, 6, 5, 4, 3, 2, 1!"},
"saySpriteChoices_44":function(d){return "Odličen si!"},
"saySpriteChoices_45":function(d){return "Zabaven si!"},
"saySpriteChoices_46":function(d){return "Se šališ? "},
"saySpriteChoices_47":function(d){return "Ti si dober prijatelj!"},
"saySpriteChoices_48":function(d){return "Pazi!"},
"saySpriteChoices_49":function(d){return "Raca!"},
"saySpriteChoices_50":function(d){return "Pa te imam!"},
"saySpriteChoices_51":function(d){return "Opa!"},
"saySpriteChoices_52":function(d){return "Oprostite!"},
"saySpriteChoices_53":function(d){return "Previdno!"},
"saySpriteChoices_54":function(d){return "Vau!"},
"saySpriteChoices_55":function(d){return "Ups!"},
"saySpriteChoices_56":function(d){return "Skoraj si me!"},
"saySpriteChoices_57":function(d){return "Dober poskus!"},
"saySpriteChoices_58":function(d){return "Ne moreš me ujeti!"},
"scoreText":function(d){return "Dosežek: "+studio_locale.v(d,"playerScore")+" (Uporabnikove točke)"},
"setBackground":function(d){return "nastavi ozadje"},
"setBackgroundRandom":function(d){return "nastavi naključno ozadje"},
"setBackgroundBlack":function(d){return "nastavi črno ozadje"},
"setBackgroundCave":function(d){return "nastavi jamsko ozadje"},
"setBackgroundCloudy":function(d){return "nastavi oblačno ozadje"},
"setBackgroundHardcourt":function(d){return "nastavi teniško ozadje"},
"setBackgroundNight":function(d){return "nastavi nočno ozadje"},
"setBackgroundUnderwater":function(d){return "nastavi podvodno ozadje"},
"setBackgroundCity":function(d){return "nastavi mestno ozadje"},
"setBackgroundDesert":function(d){return "nastavi puščavsko ozadje"},
"setBackgroundRainbow":function(d){return "nastavi mavrično ozadje"},
"setBackgroundSoccer":function(d){return "nastavi nogometno ozadje"},
"setBackgroundSpace":function(d){return "nastavi vesoljsko ozadje"},
"setBackgroundTennis":function(d){return "nastavi teniško ozadje"},
"setBackgroundWinter":function(d){return "nastavi zimsko ozadje"},
"setBackgroundLeafy":function(d){return "nastavi listnato ozadje"},
"setBackgroundGrassy":function(d){return "nastavi travnato ozadje"},
"setBackgroundFlower":function(d){return "nastavi cvetlično ozadje"},
"setBackgroundTile":function(d){return "nastavi ozadje iz ploščic"},
"setBackgroundIcy":function(d){return "nastavi ledeno ozadje"},
"setBackgroundSnowy":function(d){return "nastavi zasneženo ozadje"},
"setBackgroundTooltip":function(d){return "Nastavite sliko ozadja"},
"setEnemySpeed":function(d){return "nastavi hitrost nasprotnika"},
"setPlayerSpeed":function(d){return "nastavi hitrost igralca"},
"setScoreText":function(d){return "nastavi rezultat"},
"setScoreTextTooltip":function(d){return "Določi besedilo za izpis pri rezultatih."},
"setSpriteEmotionAngry":function(d){return "v jezno razpoloženje"},
"setSpriteEmotionHappy":function(d){return "v veselo razpoloženje"},
"setSpriteEmotionNormal":function(d){return "v povprečno razpoloženje"},
"setSpriteEmotionRandom":function(d){return "v naključno razpoloženje"},
"setSpriteEmotionSad":function(d){return "v žalostno razpoloženje"},
"setSpriteEmotionTooltip":function(d){return "Nastavi igralčeva čustva"},
"setSpriteAlien":function(d){return "kot vesoljca"},
"setSpriteBat":function(d){return "kot netopirja"},
"setSpriteBird":function(d){return "kot ptico"},
"setSpriteCat":function(d){return "kot mačko"},
"setSpriteCaveBoy":function(d){return "kot jamskega dečka"},
"setSpriteCaveGirl":function(d){return "kot jamsko deklico"},
"setSpriteDinosaur":function(d){return "kot dinozaura"},
"setSpriteDog":function(d){return "k sliki psa"},
"setSpriteDragon":function(d){return "k sliki zmaja"},
"setSpriteGhost":function(d){return "k sliki duha"},
"setSpriteHidden":function(d){return "k skriti sliki"},
"setSpriteHideK1":function(d){return "skrij"},
"setSpriteAnna":function(d){return "k sliki Anne"},
"setSpriteElsa":function(d){return "k sliki Else"},
"setSpriteHiro":function(d){return "k sliki Hiroja"},
"setSpriteBaymax":function(d){return "k sliki Baymaxa"},
"setSpriteRapunzel":function(d){return "k sliki Trnjulčice"},
"setSpriteKnight":function(d){return "k sliki viteza"},
"setSpriteMonster":function(d){return "k sliki pošasti"},
"setSpriteNinja":function(d){return "k sliki zamaskirane ninje"},
"setSpriteOctopus":function(d){return "k sliki hobotnice"},
"setSpritePenguin":function(d){return "k sliki pingvina"},
"setSpritePirate":function(d){return "k sliki pirata"},
"setSpritePrincess":function(d){return "k sliki princese"},
"setSpriteRandom":function(d){return "k naključni sliki"},
"setSpriteRobot":function(d){return "k sliki robota"},
"setSpriteShowK1":function(d){return "prikaži"},
"setSpriteSpacebot":function(d){return "k sliki vesoljskega robota"},
"setSpriteSoccerGirl":function(d){return "k sliki nogometašice"},
"setSpriteSoccerBoy":function(d){return "k sliki nogometaša"},
"setSpriteSquirrel":function(d){return "k sliki veverice"},
"setSpriteTennisGirl":function(d){return "k sliki tenisačice"},
"setSpriteTennisBoy":function(d){return "k sliki tenisača"},
"setSpriteUnicorn":function(d){return "k sliki samoroga"},
"setSpriteWitch":function(d){return "k sliki čarovnice"},
"setSpriteWizard":function(d){return "k sliki čarovnika"},
"setSpritePositionTooltip":function(d){return "Takoj prestavi igralca na določeno mesto."},
"setSpriteK1Tooltip":function(d){return "Pokaže ali skrije določenega igralca."},
"setSpriteTooltip":function(d){return "Nastavi sliko igralca"},
"setSpriteSizeRandom":function(d){return "na naključno velikost"},
"setSpriteSizeVerySmall":function(d){return "na zelo majhno velikost"},
"setSpriteSizeSmall":function(d){return "na majhno velikost"},
"setSpriteSizeNormal":function(d){return "na normalno velikost"},
"setSpriteSizeLarge":function(d){return "na veliko velikost"},
"setSpriteSizeVeryLarge":function(d){return "na zelo veliko velikost"},
"setSpriteSizeTooltip":function(d){return "Nastavi velikost igralca"},
"setSpriteSpeedRandom":function(d){return "na naključno hitrost"},
"setSpriteSpeedVerySlow":function(d){return "na zelo majhno hitrost"},
"setSpriteSpeedSlow":function(d){return "na majhno hitrost"},
"setSpriteSpeedNormal":function(d){return "na normalno hitrost"},
"setSpriteSpeedFast":function(d){return "na veliko hitrost"},
"setSpriteSpeedVeryFast":function(d){return "na zelo veliko hitrost"},
"setSpriteSpeedTooltip":function(d){return "Določi hitrost igralca"},
"setSpriteZombie":function(d){return "kot sliko zombija"},
"shareStudioTwitter":function(d){return "Oglej si interaktivno zgodbo, ki sem jo sam/a izdelal/a. Napisal/a sem jo z @codeorg"},
"shareGame":function(d){return "Objavi svojo zgodbo:"},
"showCoordinates":function(d){return "prikazuj koordinate"},
"showCoordinatesTooltip":function(d){return "koordinate junaka prikazuj na zaslonu"},
"showTitleScreen":function(d){return "prikaži naslovni zaslon"},
"showTitleScreenTitle":function(d){return "naslov"},
"showTitleScreenText":function(d){return "besedilo"},
"showTSDefTitle":function(d){return "Natipkaj naslov tukaj"},
"showTSDefText":function(d){return "Vnesite besedilo tukaj"},
"showTitleScreenTooltip":function(d){return "Prikaži prvi zaslon z naslovom in besedilom."},
"size":function(d){return "velikost"},
"setSprite":function(d){return "nastavi"},
"setSpriteN":function(d){return "Določi igralca "+studio_locale.v(d,"spriteIndex")},
"soundCrunch":function(d){return "hrustati"},
"soundGoal1":function(d){return "zadetek"},
"soundGoal2":function(d){return "zadetek 2"},
"soundHit":function(d){return "zvok zadetka"},
"soundLosePoint":function(d){return "izguba točke"},
"soundLosePoint2":function(d){return "izguba točke 2"},
"soundRetro":function(d){return "retro"},
"soundRubber":function(d){return "zvok gume"},
"soundSlap":function(d){return "lopni"},
"soundWinPoint":function(d){return "dosegel točko"},
"soundWinPoint2":function(d){return "dosegel točko 2"},
"soundWood":function(d){return "les"},
"speed":function(d){return "hitrost"},
"startSetValue":function(d){return "začetek (funkcija)"},
"startSetVars":function(d){return "game_vars (title, subtitle, background, target, danger, player)"},
"startSetFuncs":function(d){return "game_funcs (update-target, update-danger, update-player, collide?, on-screen?)"},
"stopSprite":function(d){return "zadrži pri miru"},
"stopSpriteN":function(d){return "ustavi igralca "+studio_locale.v(d,"spriteIndex")},
"stopTooltip":function(d){return "Ustavi igralčevo gibanje."},
"throwSprite":function(d){return "vrže"},
"throwSpriteN":function(d){return "igralec "+studio_locale.v(d,"spriteIndex")+" vrže"},
"throwTooltip":function(d){return "Izstrelek poleti iz določenega igralca."},
"vanish":function(d){return "naredi nevidnega"},
"vanishActorN":function(d){return "igralca "+studio_locale.v(d,"spriteIndex")+" naredi nevidnega"},
"vanishTooltip":function(d){return "Igralca naredi nevidnega."},
"waitFor":function(d){return "počakaj na"},
"waitSeconds":function(d){return "sekund(e)"},
"waitForClick":function(d){return "počakaj na klik"},
"waitForRandom":function(d){return "počakaj naključno dolgo"},
"waitForHalfSecond":function(d){return "počakaj pol sekunde"},
"waitFor1Second":function(d){return "počakaj 1 sekundo"},
"waitFor2Seconds":function(d){return "počakaj 2 sekundi"},
"waitFor5Seconds":function(d){return "počakaj 5 sekund"},
"waitFor10Seconds":function(d){return "počakaj 10 sekund"},
"waitParamsTooltip":function(d){return "Počaka določeno število sekund oziroma (če je 0) na klik."},
"waitTooltip":function(d){return "Čaka na klik ali določeno obdobje."},
"whenArrowDown":function(d){return "puščica dol"},
"whenArrowLeft":function(d){return "puščica levo"},
"whenArrowRight":function(d){return "puščica desno"},
"whenArrowUp":function(d){return "puščica gor"},
"whenArrowTooltip":function(d){return "Ko so pritisnjene smerne puščice, naredi spodaj navedeno."},
"whenDown":function(d){return "ko puščica za navzdol"},
"whenDownTooltip":function(d){return "Ko je pritisnjena puščica za navzdol, izvedi sledeče ukaze."},
"whenGameStarts":function(d){return "ko se začne zgodba"},
"whenGameStartsTooltip":function(d){return "Ko se zgodba začne, naredi spodaj navedeno."},
"whenLeft":function(d){return "ko leva puščica"},
"whenLeftTooltip":function(d){return "Ko je pritisnjena desna puščica izvedi sledeče ukaze."},
"whenRight":function(d){return "ko je pritisnjena puščica desno"},
"whenRightTooltip":function(d){return "Ko je pritisnjena desna puščica izvedi sledeče ukaze."},
"whenSpriteClicked":function(d){return "ko je kliknjen igralec"},
"whenSpriteClickedN":function(d){return "ko je kliknjen igralec "+studio_locale.v(d,"spriteIndex")},
"whenSpriteClickedTooltip":function(d){return "Ko je kliknjen igralec, naredi spodaj navedno."},
"whenSpriteCollidedN":function(d){return "ko igralec "+studio_locale.v(d,"spriteIndex")},
"whenSpriteCollidedTooltip":function(d){return "Ko se igralec dotakne drugega igralca, naredi spodaj navedeno."},
"whenSpriteCollidedWith":function(d){return "se dotakne"},
"whenSpriteCollidedWithAnyActor":function(d){return "se dotakne kateregakoli igralca"},
"whenSpriteCollidedWithAnyEdge":function(d){return "se dotakne kateregakoli roba"},
"whenSpriteCollidedWithAnyProjectile":function(d){return "se dotakne kateregakoli projektila"},
"whenSpriteCollidedWithAnything":function(d){return "se dotakne česarkoli"},
"whenSpriteCollidedWithN":function(d){return "se dotakne igralca "+studio_locale.v(d,"spriteIndex")},
"whenSpriteCollidedWithBlueFireball":function(d){return "se dotakne modrih izstrelkov"},
"whenSpriteCollidedWithPurpleFireball":function(d){return "se dotakne vijoličnih izstrelkov"},
"whenSpriteCollidedWithRedFireball":function(d){return "se dotakne rdečih izstrelkov"},
"whenSpriteCollidedWithYellowHearts":function(d){return "se dotakne rumenih srčkov"},
"whenSpriteCollidedWithPurpleHearts":function(d){return "se dotakne vijoličnih srčkov"},
"whenSpriteCollidedWithRedHearts":function(d){return "se dotakne rdečih srčkov"},
"whenSpriteCollidedWithBottomEdge":function(d){return "se dotakne spodnjega roba"},
"whenSpriteCollidedWithLeftEdge":function(d){return "se dotakne levega roba"},
"whenSpriteCollidedWithRightEdge":function(d){return "se dotakne desnega roba"},
"whenSpriteCollidedWithTopEdge":function(d){return "se dotakne zgornjega roba"},
"whenUp":function(d){return "ko je pritisnjena puščica gor"},
"whenUpTooltip":function(d){return "Ko je pritisnjena gor puščica izvedi sledeče ukaze."},
"yes":function(d){return "Da"}};