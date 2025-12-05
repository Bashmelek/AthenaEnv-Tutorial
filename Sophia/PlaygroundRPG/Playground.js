

import { resfolder,
    mylogo,
    tile_lightstone,
    sprite_lr,
    sprite_f,
    sprite_b,
    tile_dblue,
    uibg_sprite,
    mapobjSprites,
    //screen_640x448,
    START_BMP24,
    level_0_pathedSpecials, } from "./GameData.js";
import { functionDemo, readonlyer } from "./ExporteeA.js";
import { charpos,  mapobjects,
//interruptEffect,
//allowMoveChar,
//inConvo,
//convoClickCooldown,
gamemode,
gamestate,
gameLoad,
NUM_CACHED_LEVELS,
ClearMapObjects } from "./Gamestate.js";

import {  
    abmap,
    bmap,
    getNextFreeBG,
    tryGetLevelBg,
    getCharObjInfo,
    loadLevel,
    tryQueueLevel,
    insertMapObjectInDrawOrder,
    createMapObject,
    SetupLevelFromImage_Lazy,
    SetupLevelFromImage_Static,

 } from "./LevelManager.js";

import {  
    tryMoveChar_Continuous,
    setNewBoundsForPosByVec,
    getEdgeToCornerCenter,
    getCornerNewVec,
    getCornerIncursionComp,
    tryMoveChar_CSRR,
    checkObectCollisions

 } from "./TopdownPhysics.js";


const font = new Font("default"); 

const videoMode = Screen.getMode();
videoMode.width = 640;
videoMode.height = 448;
videoMode.double_buffering = true;
Screen.setMode(videoMode);
Screen.setVSync(true);
Screen.setFrameCounter(true);

let framecounter = 0;

const p1Pad = Pads.get(0);
const p2Pad = Pads.get(1);
 

//const tile_32 = new Image(resfolder + "/tiles_64not.png");
 

////var areamap_demo = std.open(resfolder + "/maparea_advdemo0.bmp", "r");// new Image("maparea_demo0.bmp");
 
//let areamap_pixels = new Int8Array(areamap_demo.pixels);

 
 

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Screen.getMode(); 

 
 

 var initLoad = function() {
    //new Image(resfolder + "/blankred_640x448.png");// blankred_64 

    for(var i = 0; i < NUM_CACHED_LEVELS; i++){
        var imgID = "img" + i.toString();
        gameLoad.useImages[imgID] = {};
        var useImage = gameLoad.useImages[imgID];
    
        useImage.sprite = new Image(resfolder + "/blankred_640x448.png");

        var img = useImage.sprite;  
        img.x = 0;
        img.y = 0;
        img.endx = 640;
        img.endy = 448;
        img.width = 640;
        img.height = 448;

        useImage.id = i;
        useImage.aging = 12;
        useImage.levelnum = null;
        useImage.isLoaded = false;
        useImage.icurrentLoad = 0;
        useImage.jcurrentLoad = 0;
        useImage.mapbits = null;
    }

    gameLoad.useImages.currentBG = null;
    gameLoad.useImages.nextFreeID = 0;
 };  


function getConvoByID(convoid) {
    var convoObj = {};

    switch(convoid)
    {
        case convoid:

        convoObj[0] = { text: "hello", nextid: 1 };
        convoObj[1] = { text: "let's team up!", endsideEffect: 'catjoin' };

        default:
            break;
    }


    return convoObj;
}


function getConvoIdForChar(otherchar){
    var convoid = -1;

    if(otherchar.charname == 'Mitsi' && !gamestate.gotCat) {
        convoid = 1;
    }

    return convoid;
}

function beginConvo(otherchar, convoid) {

    var convoObj = null;
    std.printf("\n\n begin convo: ");
    if(!convoid){
        convoid = getConvoIdForChar(otherchar);
    }

    convoObj = getConvoByID(convoid);
    convoObj.currentNode = convoObj.startnode || 0;

    gamestate.allowMoveChar = false;

    gamestate.currentConvo = convoObj;
    gamestate.inConvo = true;
    gamestate.convoClickCooldown = 4;
}
 
 

 

//setup bg
let timer = Timer.new()
Timer.getTime(timer)

function RunConvoSideEffect(effectname) {
    switch(effectname) {
        case 'catjoin':

            for(var i = 0; i < mapobjects.length; i++) {
                var mi = mapobjects[i];
                if(mi.code == 'character' && mi.charname && mi.charname == 'Mitsi') {
                    gamestate.gotCat = true;
                    mapobjects.splice(i, 1);
                    i = mapobjects.length + 1;
                }
            }

            break;
        default:
            break;
    }
}

function DrawConvo() {
    //uibg_sprite
    
    uibg_sprite.width = 600;
    uibg_sprite.height = 64;
    uibg_sprite.draw(10, 400);
    
    //std.printf('\ntextis: ' + gamestate.currentConvo[gamestate.currentConvo.currentNode].text);
    font.print(14, 404, gamestate.currentConvo[gamestate.currentConvo.currentNode].text);    //564

    if (p1Pad.justPressed(Pads.CROSS) && gamestate.convoClickCooldown <= 0) { 

        var endsideEffect = gamestate.currentConvo[gamestate.currentConvo.currentNode].endsideEffect;
        if(endsideEffect && endsideEffect.length > 0) {
            RunConvoSideEffect(endsideEffect);
        }

        gamestate.currentConvo.currentNode = gamestate.currentConvo[gamestate.currentConvo.currentNode].nextid || -1;

        if(gamestate.currentConvo.currentNode < 0){
            gamestate.allowMoveChar = true;

            gamestate.currentConvo = null;
            gamestate.inConvo = false;
        }
    }
}


function RunInOverMap() {
    var sprite = charpos.charsprite;
    
    for(var q = 0; q < gameLoad.queuedLevels.length; q++) {
        std.printf("\n queue size is: " + gameLoad.queuedLevels.length);
        SetupLevelFromImage_Lazy(gameLoad.queuedLevels[q]);
    }
    for(var d = 0; d < gameLoad.queuedLevels.length; d++) {
        var queuedLevObj = gameLoad.queuedLevels[d];
        if(queuedLevObj.useImageID >= 0 && gameLoad.useImages["img" + queuedLevObj.useImageID].isLoaded) {
            gameLoad.queuedLevels.splice(d, 1);
        }
        //SetupLevelFromImage_Lazy(gameLoad.queuedLevels[q]);
    }

    if(gamestate.allowMoveChar) {

        var movevec = { x: 0.0, y: 0.0 };
        var speed = Math.min(Math.max(1.00, charpos.timemove / 1.2) * 0.79, 5.09);

        if (p1Pad.pressed(Pads.RIGHT)) {
            sprite = sprite_lr;
            if (charpos.isFlipped) {
                sprite.width = Math.abs(sprite.width);
                sprite.x = 0;
                //charpos.x -= sprite.width;
                sprite.drawoffsetx = -16.0;//0;
                charpos.isFlipped = false;
            } 

            charpos.facing = 'r';
            //tryMoveChar_Continuous(charpos, { x: 5.09, y: 0.0 });
            movevec.x = speed;
        }

        if (p1Pad.pressed(Pads.LEFT)) {
            sprite = sprite_lr;
            if (!charpos.isFlipped) {
                sprite.width = -Math.abs(sprite.width);
                sprite.x = sprite.width;
                sprite.drawoffsetx = 48.0;//0;-sprite.width;
                charpos.isFlipped = true;
            } 
            charpos.facing = 'l';
            //tryMoveChar_Continuous(charpos, { x: -5.09, y: 0.0 });
            movevec.x = -speed;
        }

        if (p1Pad.pressed(Pads.UP)) {
            sprite = sprite_b;
            // if (charpos.isFlipped) {
            //     sprite.width = Math.abs(sprite.width);
            //     sprite.x = 0;
            //     charpos.drawoffsetx = 0;
            //     charpos.isFlipped = false; 
            // } 
            charpos.facing = 'u';
            //tryMoveChar_Continuous(charpos, { x: 0.0, y: -5.09 });
            movevec.y = -speed;
        }

        if (p1Pad.pressed(Pads.DOWN)) {
            sprite = sprite_f;
            // if (charpos.isFlipped) {
            //     sprite.width = Math.abs(sprite.width);
            //     sprite.x = 0;
            //     charpos.drawoffsetx = 0;
            //     charpos.isFlipped = false;
            // } 
            charpos.facing = 'd';
            //tryMoveChar_Continuous(charpos, { x: 0.0, y: 5.09 });
            movevec.y = speed;
        }

        if(movevec.x != 0.0 || movevec.y != 0.0) {
            var vecdist = Math.sqrt((movevec.x * movevec.x) + (movevec.y * movevec.y));

            charpos.timemove += 1.0;

            movevec.x = speed * movevec.x / vecdist;
            movevec.y = speed * movevec.y / vecdist;

            tryMoveChar_CSRR(charpos, movevec, 3);
        } else {
            charpos.timemove = 0.0;
        }

        checkObectCollisions();

        const irange = 4.0;

        var ipoint = { x: charpos.x + (charpos.width / 2.0), y: charpos.y + (charpos.height / 2.0) };
        if(charpos.facing == 'r') {
            ipoint.x += (charpos.width / 2.0) + irange;
        }
        if(charpos.facing == 'l') {
            ipoint.x -= ((charpos.width / 2.0) + irange);
        }
        if(charpos.facing == 'd') {
            ipoint.y += (charpos.height / 2.0) + irange;
        }
        if(charpos.facing == 'u') {
            ipoint.y -= ((charpos.height / 2.0) + irange);
        }

        var tempi = null;
        var tempindex = -1;

        for(var i = 0; i < mapobjects.length; i++) {
            var mi = mapobjects[i];
            if(mi.isInteractable && ipoint.x > mi.x && ipoint.x < mi.x + mi.width &&
                    ipoint.y > mi.y && ipoint.y < mi.y + mi.height ) {
                tempi = mi;
                tempindex = i;
                //std.printf("\n\n iobj: " + tempi.code);   
            }

            // if(charpos.facing == 'r' && 
            //     mi.isInteractable &&
            //     mi.x > charpos.x + charpos.width - 0.4 && 
            //     mi.x < charpos.x + charpos.width + 4.0 &&
            //     mi.y < (charpos.y + (charpos.height / 2.0)) + 1.0 && 
            //     mi.y + mi.height + 1.0 > (charpos.y + (charpos.height / 2.0)) ) {
            //     gamestate.char.interactableObj = mi;
            //     std.printf("\n\n iobj: " + gamestate.char.interactableObj.code);
            // }
            // if(charpos.facing == 'l' && 
            //     mi.isInteractable &&
            //     mi.x + mi.width - 0.4 < charpos.x && 
            //     mi.x + mi.width + 4.0 > charpos.x &&
            //     mi.y < (charpos.y + (charpos.height / 2.0)) + 1.0 && 
            //     mi.y + mi.height + 1.0 > (charpos.y + (charpos.height / 2.0)) ) {
            //     gamestate.char.interactableObj = mi;
            //     std.printf("\n\n iobj: " + gamestate.char.interactableObj.code);
            // }
        }
        gamestate.char.interactableObj = tempi;

        if (gamestate.char.interactableObj && p1Pad.pressed(Pads.CROSS)) {
            var gobj = gamestate.char.interactableObj;
            if(gobj.code == 'door_e' && gamestate.char.numkeys > 0) {
                var dkey = gobj.compkey;
                var stateobj = gamestate.levelstates["ls" + gamestate.levelid].mapobjects[dkey];

                if(stateobj == null) {
                    gamestate.levelstates["ls" + gamestate.levelid].mapobjects[dkey] = {};
                    stateobj = gamestate.levelstates["ls" + gamestate.levelid].mapobjects[dkey];
                }
                gamestate.char.numkeys--;
                stateobj.isRemoved = true;

                mapobjects.splice(tempindex, 1);
            }
            if(gobj.code == 'chest_r' && !gobj.chestOpened) {
                var dkey = gobj.compkey;
                var stateobj = gamestate.levelstates["ls" + gamestate.levelid].mapobjects[dkey];

                if(stateobj == null) {
                    gamestate.levelstates["ls" + gamestate.levelid].mapobjects[dkey] = {};
                    stateobj = gamestate.levelstates["ls" + gamestate.levelid].mapobjects[dkey];
                }
                stateobj.chestOpened = true;
                
                gobj.sprite = mapobjSprites.chestopen_r;
                gobj.chestOpened = true;
                gobj.drawoffsetx = -10.0;
                gobj.drawoffsety = -39.0;
            }
            if(gobj.code == 'character') {
                if(gobj.action == 'talk') {
                    beginConvo(gobj, null);
                }
            }
        }

    }
    
    
    gameLoad.currentLevelbg.draw(0.0, 0.0);//tile_dblue   screen_640x448

    var renderedChar = false;

    for(let c = 0; c < mapobjects.length; c++) {
        var mo = mapobjects[c];
        if(!renderedChar && mo.y > charpos.y) {
            sprite.draw(charpos.x + (sprite.drawoffsetx || 0.0), charpos.y + (sprite.drawoffsety || charpos.drawoffsety));
            renderedChar = true;
        }
        if(mo.sprite) {
            mo.sprite.draw(mo.x + (mo.drawoffsetx || 0.0), mo.y + (mo.drawoffsety || 0.0));
        }
    }
    if(!renderedChar) {
        sprite.draw(charpos.x + (sprite.drawoffsetx || 0.0), charpos.y + (sprite.drawoffsety || charpos.drawoffsety));
    }
    font.print(10, 10, "Why dost thou continue?");    

    charpos.charsprite = sprite;

    if(gamestate.inConvo) {
        DrawConvo();
        if(gamestate.convoClickCooldown >= 0) {
            gamestate.convoClickCooldown--;
        }
    }

    
    if(gamestate.interruptEffect) {
        gamestate.interruptEffect();
    }
}

Screen.display(() => {
   //if (timer.get() > frameDuration) {
   //   if (frameIndex < runAnimFrames.length - 1) {
   //       frameIndex++;
   //       timer.reset();
   //   } else {
   //       frameIndex = 0;
   //   }
   //}

   
    framecounter++;

    //for (var p = START_BMP24; p < bmap.length + START_BMP24; p += 3) {
    //    std.printf(" " + bmap[p + 0]);
    //    var v = p - START_BMP24;
    //    if (bmap[p + 0] == 0) {
    //        tile_dblue.draw(((v / 3) % 20) * 32, Math.floor((v / 3) / 20) * 32);
    //    }
    //    if (bmap[p + 0] == 255) { //-1
    //        tile_lightstone.draw(((v / 3) % 20) * 32, Math.floor((v / 3) / 20) * 32);
    //    }
    //    //else {
    //    //    tile_lightstone.draw(((p / 3) % 32) * 32, Math.floor((p / 3) / 32) * 32);
    //    //}
    //}


    ////old perframe way off drawing bg
    //for (var j = 0; j < 14; j++) { //14
    //    for (var i = 0; i < 20; i++)  {
    //        var p = START_BMP24 + ((14 - 1 - j) * 20 * 3) + i * 3;
    //        if (bmap[p + 0] == 0) {
    //            tile_dblue.draw(i * 32, (j) * 32);
    //        }
    //        if (bmap[p + 0] == 255) { //-1
    //            tile_lightstone.draw(i * 32, (j) * 32);
    //        } 
    //    }
    //}


    p1Pad.update();

    
    //std.printf("\n" + gamestate.currentGameMode + "\n");

    //gamestate.currentGameMode = "zztest"

    switch(gamestate.currentGameMode) {
        case "zztest":
            functionDemo();
            readonlyer.val += 1;
            break;
        case gamemode["loadingmap"]:
            gamestate.currentGameMode = gamemode["inovermap"];
        break;
        case gamemode["inovermap"]: 
    //std.printf("\n xxx000: " + Timer.getTime(timer).toString());
    //std.printf("\n xxx111: " + Timer.getTime(timer).toString());
            RunInOverMap();
            //std.printf("\n xxx222: " + Timer.getTime(timer).toString());
            //std.printf("\n xxx333: " + Timer.getTime(timer).toString());
        break;
        case gamemode["initgame"]: 

            mylogo.draw(80.0, 84.0);
            if(framecounter == 1){
                initLoad();
            }
            if(framecounter > 1){
                loadLevel({ levelid: 0 });
                gamestate.currentGameMode = gamemode["inovermap"];
            }
        //std.printf("\n timeinitgame: " + Timer.getTime(timer).toString());
        //std.printf("\n timeinitgame: " + Timer.getTime(timer).toString());
        break;

    }

    ////sprite.draw(charpos.x + 40, charpos.y);
    ////blank_128.draw(20.0, 20.0)
});

//os.setInterval(() => { // Basically creates an infinite loop, similar to while true(you can use it too).
//  Screen.clear(); // Clear screen for the next frame.
//  font.print(0, 0, "Hello Creator!"); // x, y, text
//  
//  if(++counter > 14400) {
//	  font.print(0, 40, "You so are cool!"); 
//  }
//  Screen.flip(); // Updates the screen.
//}, 0);