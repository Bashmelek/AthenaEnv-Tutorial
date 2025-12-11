

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



var abmap = new ArrayBuffer(14 * 20 * 3 + START_BMP24);
////areamap_demo.read(abmap, 0, 14 * 20 * 3 - 0 + START_BMP24)
var bmap = new Uint8Array(abmap);


 var getNextFreeBG = function() {

    var currentNextID = gameLoad.useImages.nextFreeID;
    var freeimg = gameLoad.useImages["img" + currentNextID.toString()];
    freeimg.aging = 0;

    var nextFreeID = -1;
    var currentAging = -1;
    for(var i = 0; i < NUM_CACHED_LEVELS; i++) {
        var nextimg = gameLoad.useImages["img" + i.toString()];
        if(nextimg.id != currentNextID) {
            nextimg.aging++;
            if(nextimg.aging > currentAging){
                nextFreeID = nextimg.id;
                currentAging = nextimg.aging;
            }
        }
    }
    gameLoad.useImages.nextFreeID = nextFreeID;

    return freeimg;
 };

 var tryGetLevelBg = function(levelnum) {
    
    var levelBg = null

    for(var c = 0; c < NUM_CACHED_LEVELS; c++) {
        var cimg = gameLoad.useImages["img" + c.toString()];

        if(cimg.id == levelnum & cimg.isLoaded){
            levelBg = cimg;
        }
    }

    return levelBg;
 };


 

function getCharObjInfo(charid) {
    var cb = {};

    if(charid == 0) {
        cb.sprite = mapobjSprites.charcat;
        cb.charname = 'Mitsi';
    }
    if(charid == 1) {
        cb.sprite = mapobjSprites.charoldguy;
        cb.charname = 'Boris';
    }

    return cb;
};

function loadLevel(exitObj) { //levelnum, transitionType) {

    var areamap;
    gameLoad.mapbits = null;
    gameLoad.queuedLevels = [];

    switch(exitObj.levelid){
        case 0:
        std.printf(" \n i say 0");
            areamap = std.open(resfolder + "/maparea_advdemo0.bmp", "r");// new Image("maparea_demo0.bmp");
            var tempmap = new ArrayBuffer(14 * 20 * 3 + START_BMP24);
            areamap.read(tempmap, 0, 14 * 20 * 3 - 0 + START_BMP24)
            gameLoad.mapbits = new Uint8Array(tempmap);
        break;
        case 1:
        std.printf(" \n i say 11");
            areamap = std.open(resfolder + "/maparea_advdemo1.bmp", "r");// new Image("maparea_demo0.bmp");
            var tempmap = new ArrayBuffer(14 * 20 * 3 + START_BMP24);
            areamap.read(tempmap, 0, 14 * 20 * 3 - 0 + START_BMP24)
            gameLoad.mapbits = new Uint8Array(tempmap);
        break;
        case 2:
        std.printf(" \n i say 22");
            areamap = std.open(resfolder + "/maparea_advdemo2.bmp", "r");// new Image("maparea_demo0.bmp");
            var tempmap = new ArrayBuffer(14 * 20 * 3 + START_BMP24);
            areamap.read(tempmap, 0, 14 * 20 * 3 - 0 + START_BMP24)
            gameLoad.mapbits = new Uint8Array(tempmap);
        break;


    }

    bmap = null;

    bmap = gameLoad.mapbits;

    std.printf(" \n level is " + exitObj.levelid);
    std.printf(" \n level is " + exitObj.levelid);
    gamestate.levelid = exitObj.levelid;

    gamestate.char.interactableObj = null;

    var levelstate = gamestate.levelstates["ls" + gamestate.levelid];
    if(levelstate == null) {
        gamestate.levelstates["ls" + gamestate.levelid] = {};
        levelstate = gamestate.levelstates["ls" + gamestate.levelid];
        levelstate.mapobjects = {};
    }

    std.printf(" \n level is " + exitObj.levelid);
    SetupLevelFromImage_Static();
    if(exitObj.transition == 'flow') {
        if(exitObj.collisionType == 'exitleft'){
            charpos.x = 20.0 * 32.0 - charpos.width - 0.2;
        }
        if(exitObj.collisionType == 'exitright'){
            charpos.x = 0.2;
        }
        if(exitObj.collisionType == 'exitup'){
            charpos.y = 14.0 * 32.0 - charpos.height - 0.2;
        }
        if(exitObj.collisionType == 'exitdown'){
            charpos.y = 0.2;
        }
    } else {
        charpos.x = 50.0;
        charpos.y = 50.0; 
    }

    gamestate.currentGameMode = gamemode["inovermap"];
    gamestate.allowMoveChar = true;
};

var tryQueueLevel = function(levelnum) {
    var alreadyHandled = false;

    var alreadyLoadedBG = tryGetLevelBg(levelnum);

    if(alreadyLoadedBG != null){
        return;
    }

    for(var i = 0; i < gameLoad.queuedLevels.length; i++) {
        if(gameLoad.queuedLevels[i].levelnum == levelnum){
            return;
        }
    }

    if(!alreadyHandled) {
        gameLoad.queuedLevels.push({levelnum: levelnum, useImageID: -1});
    }
};

function insertMapObjectInDrawOrder(newobj){

    for(var i = 0; i < mapobjects.length; i++){
        if(mapobjects.y < newobj.y) {
            mapobjects.splice(i, 0, newobj);
            return;
        }
    }
    mapobjects.push(newobj);
}

function createMapObject(numcode, level, x, y, i, j) {

    var ref = level_0_pathedSpecials[numcode];
    //std.printf("\n" + numcode + "\n");
    //std.printf("\n" + ref + "\n");
    //std.printf("\n" + ref.code + "\n");

    var newid = (j * 20 + i);
    var compkey = numcode.toString() + '_' + ref.code + '_' + newid;
    var levelstate = gamestate.levelstates["ls" + gamestate.levelid];
    var mapobj = null;
    if(levelstate.mapobjects[compkey] != null){
        mapobj = levelstate.mapobjects[compkey];
        if(mapobj && mapobj.isRemoved) {
            return;
        }
    }

    var newobj = {};
    newobj.code = ref.code;
    newobj.compkey = compkey;
    newobj.i = i;
    newobj.j = j;
    if(ref.code == 'doorkey') {
        //newobj.code = ref.code;
        newobj.sprite = mapobjSprites.doorkey
        newobj.x = x;
        newobj.y = y;
        newobj.width = 32;
        newobj.height = 32;
        newobj.collisionType = 'touch'
    }
    if(ref.code == 'exitzone') {
        //newobj.code = ref.code;
        newobj.levelid = ref.dest;
        newobj.sprite = null;
        newobj.x = x;
        newobj.y = y;
        newobj.width = 32;
        newobj.height = 32;
        newobj.collisionType = 'mycenter'
        newobj.transition = ref.transition;
        if(i == 0) {
            newobj.collisionType = 'exitleft';
        }
        if(i == 19) {
            newobj.collisionType = 'exitright';
        }
        if(j == 0) {
            newobj.collisionType = 'exitup';
        }
        if(j == 13) {
            newobj.collisionType = 'exitdown';
        }
        var refid = newobj.levelid;
        var transitionType = newobj.transition;
        var exitObj = newobj;
        std.printf('>>>' + newobj.collisionType);
        std.printf('>>>' + newobj.collisionType);
        newobj.interruptEffect = function() {
            gamestate.allowMoveChar = false;
            loadLevel(exitObj);
            gamestate.interruptEffect = null;
        }
        tryQueueLevel(newobj.levelid);
    }
    if(ref.code == 'door_e') {
        //newobj.code = ref.code;
        newobj.sprite = mapobjSprites.eastdoor;
        newobj.x = x;
        newobj.y = y;
        newobj.width = 32;
        newobj.height = 32;
        newobj.collisionType = 'block';
        newobj.isInteractable = true;
    }
    if(ref.code == 'chest_r') {
        //newobj.code = ref.code;

        if(mapobj && mapobj.chestOpened) {
            newobj.chestOpened = true;
            newobj.sprite = mapobjSprites.chestopen_r;
            newobj.drawoffsetx = -10.0;
            newobj.drawoffsety = -39.0;

        } else {
            newobj.chestOpened = false;
            newobj.sprite = mapobjSprites.chest_r;
            newobj.drawoffsetx = 0.0;
            newobj.drawoffsety = -19.0;
        } 
        newobj.x = x;
        newobj.y = y;
        newobj.width = 32;
        newobj.height = 32;
        newobj.collisionType = 'block';
        newobj.isInteractable = true;
    }
    if(ref.code == 'character') {
        var cb = getCharObjInfo(ref.id);
        newobj.charid = ref.id;
        newobj.sprite = cb.sprite;
        newobj.charname = cb.charname;

        if(newobj.charname == 'Mitsi' && gamestate.gotCat){
            return;
        }
        

        if(newobj.charname == 'Mitsi'){
            newobj.drawoffsetx = -0.0;
            newobj.drawoffsety = -19.0;
        } else if(newobj.charname == 'Boris') {
            newobj.drawoffsetx = -0.0;
            newobj.drawoffsety = -32.0;
        } else {
            newobj.drawoffsetx = -0.0;
            newobj.drawoffsety = -19.0;
        }

        newobj.x = x;
        newobj.y = y;
        newobj.width = 32;
        newobj.height = 32;
        newobj.collisionType = 'block'
        newobj.isInteractable = true; 
        newobj.action = cb.action || ref.action;
    }

    //newobj.id = newid;

    insertMapObjectInDrawOrder(newobj);
}


function SetupLevelFromImage_Lazy(lazyloadobj) {
//

    //const work_640x448 = new Image(resfolder + "/blank_640x448.png");// blankred_64 
    //let work_pixels = new Int8Array(work_640x448.pixels);
    const tile_dblue_pixels = new Int32Array(tile_dblue.pixels);// BigInt64Array   Int32Array
    const tile_lightstone_pixels = new Int32Array(tile_lightstone.pixels);//

    //const mapbits = bmap;

    var img = null;

    var queueImage = tryGetLevelBg(lazyloadobj.levelnum);
    if(queueImage != null){
        return;
    }
 
    
    if(lazyloadobj.useImageID >= 0) {
        queueImage = gameLoad.useImages["img" + lazyloadobj.useImageID];

    } else {
        queueImage = getNextFreeBG();

        
        var areamap = std.open(resfolder + "/maparea_advdemo" + lazyloadobj.levelnum + ".bmp", "r");// new Image("maparea_demo0.bmp");
        var tempmap = new ArrayBuffer(14 * 20 * 3 + START_BMP24);
        areamap.read(tempmap, 0, 14 * 20 * 3 - 0 + START_BMP24)
        queueImage.mapbits = new Uint8Array(tempmap);

        lazyloadobj.useImageID = queueImage.id;
        queueImage.levelnum = lazyloadobj.levelnum;
        queueImage.isLoaded = false;
        queueImage.icurrentLoad = 0;
        queueImage.jcurrentLoad = 0;
    }
    var queueImageSprite = queueImage.sprite;
     
    const blankscreen_pixels = new Int32Array(queueImageSprite.pixels);
    const imageAlreadyLoaded = queueImage.levelnum == gamestate.levelid && queueImage.isLoaded;
    const qmapbits = queueImage.mapbits;


    var currentSource = tile_dblue_pixels;

    //mapobjects = [];
    //return;

    const MAX_QUEUED_CELLS = 3;
    var queuedCellsProcessed = 0;

    var startti = queueImage.icurrentLoad;
    var starttj = queueImage.jcurrentLoad;

    for(var ti = startti; ti < 20; ti++) {
        for(var tj = starttj; tj < 14; tj++) {
    
            var p = START_BMP24 + ((14 - 1 - tj) * 20 * 3) + ti * 3;
            if (qmapbits[p + 0] == 0) {
                currentSource = tile_dblue_pixels;
            }
            if (qmapbits[p + 0] == 255) { //-1
                currentSource = tile_lightstone_pixels;

                // if(mapbits[p + 2] > 0){
                //     std.printf("\n\nmaking obj\n\n");
                //     createMapObject(mapbits[p + 2], gamestate.levelid, ti * 32, tj * 32, ti, tj);
                // }
            } 

            if(!imageAlreadyLoaded){
                var startbyte = tj * 32 * 640 + ti * 32;//tj * 32 * 640 * 4 + ti * 32 * 4;

                for(var bi = 0; bi < 32; bi++) {
                    var offsetbi = startbyte + (bi * 640);
                    var offsetsbi = bi << 6 ;//* 64;// bi % 64 * 64;
                    
                    //var bj = 32;
                    for(var bj = 0; bj < 32; bj++) { // while(bj--) {//32    for(var bj = 0; bj < 32; bj++) { //
                        var b = offsetbi + bj;
                        var sb = (offsetsbi +  bj);//(bj % 64));
                        //if(gamestate.levelid==1) {
                        blankscreen_pixels[b] = currentSource[sb];
                    }
                }
            }

            queuedCellsProcessed++;
            if(queuedCellsProcessed >= MAX_QUEUED_CELLS ) {
                
                queueImage.icurrentLoad = ti;
                queueImage.jcurrentLoad = tj;

                if(ti < 19 || tj < 13) {
                    std.printf("\n returned at: " + queueImage.icurrentLoad + ' :: ' + queueImage.jcurrentLoad);
                    return;
                }
            }

        }

        starttj = 0;
    }

    //queueImage.levelnum = gamestate.levelid
    queueImage.isLoaded = true;
    //gameLoad.useImages.currentBG = queueImage;
    //gameLoad.currentLevelbg = queueImage.sprite;

}

function SetupLevelFromImage_Static() {
//

    //const work_640x448 = new Image(resfolder + "/blank_640x448.png");// blankred_64 
    //let work_pixels = new Int8Array(work_640x448.pixels);
    const tile_dblue_pixels = new Int32Array(tile_dblue.pixels);// BigInt64Array   Int32Array
    const tile_lightstone_pixels = new Int32Array(tile_lightstone.pixels);//

    const mapbits = bmap;

    var img = null;

        //     if(!screen_640x448) {
        //   screen_640x448 = new Image(resfolder + "/blankred_640x448.png");// blankred_64 
        // screen_640x448.x = 0;
        // screen_640x448.y = 0;
        // screen_640x448.endx = 640;
        // screen_640x448.endy = 448;
        // screen_640x448.width = 640;
        // screen_640x448.height = 448;
            // 
        //   backup = new Image(resfolder + "/blankred_640x448.png");// blankred_64 
        // backup.x = 0;
        // backup.y = 0;
        // backup.endx = 640;
        // backup.endy = 448;
        // backup.width = 640;
        // backup.height = 448;
            // 
        //         img = screen_640x448;
        //     } else {
        //         var tempimg = screen_640x448;
        //         screen_640x448 = backup;
        //         img = screen_640x448;
        //         backup = tempimg;
        //         ruincount++;
        //     }
    //screen_640x448.filter = LINEAR;

    var freeimage = tryGetLevelBg(gamestate.levelid);
    
    if(freeimage == null) {
        freeimage = getNextFreeBG();
    }
    var freeimageSprite = freeimage.sprite;
     
    const blankscreen_pixels = new Int32Array(freeimageSprite.pixels);
    const imageAlreadyLoaded = freeimage.levelnum == gamestate.levelid && freeimage.isLoaded;

    //var levelid = 0;
 
    //std.printf("\n\nHEYEYE HEY " + blankscreen_pixels.length + "\n\n");

    var currentSource = tile_dblue_pixels;

    //mapobjects = [];
    ClearMapObjects();

    for(var ti = 0; ti < 20; ti++) {
        for(var tj = 0; tj < 14; tj++) {
    
            var p = START_BMP24 + ((14 - 1 - tj) * 20 * 3) + ti * 3;
            if (mapbits[p + 0] == 0) {
                currentSource = tile_dblue_pixels;
            }
            if (mapbits[p + 0] == 255) { //-1
                currentSource = tile_lightstone_pixels;

                if(mapbits[p + 2] > 0){
                    // var newmapojb = {};
                    // mapobjects.push(newmapojb);
                    std.printf("\n\nmaking obj\n\n");
                    createMapObject(mapbits[p + 2], gamestate.levelid, ti * 32, tj * 32, ti, tj);
                }
            } 

            if(!imageAlreadyLoaded){
                var startbyte = tj * 32 * 640 + ti * 32;//tj * 32 * 640 * 4 + ti * 32 * 4;

                for(var bi = 0; bi < 32; bi++) {
                    var offsetbi = startbyte + (bi * 640);
                    var offsetsbi = bi << 6 ;//* 64;// bi % 64 * 64;
                    
                    //var bj = 32;
                    for(var bj = 0; bj < 32; bj++) { // while(bj--) {//32    for(var bj = 0; bj < 32; bj++) { //
                        var b = offsetbi + bj;
                        var sb = (offsetsbi +  bj);//(bj % 64));
                        //if(gamestate.levelid==1) {
                        blankscreen_pixels[b] = currentSource[sb];
                        //} else {  
                        //blankscreen_pixels[b] = tile_lightstone_pixels[sb];
                    }
                        //std.printf(gamestate.levelid);
                    //}
                }
            }

        }
    }

    freeimage.levelnum = gamestate.levelid;
    freeimage.isLoaded = true;
    gameLoad.useImages.currentBG = freeimage;
    gameLoad.currentLevelbg = freeimage.sprite;

}

export {  
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

 };