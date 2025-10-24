const font = new Font("default");

//Screen.setFrameCounter(true);
//Screen.setVSync(false);

const resfolder = "customresources" //res   customresources

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

// Change root folder to "Sophia"
os.chdir("Sophia");

const tile_lightstone = new Image(resfolder + "/tiles_64lightstone.png");//tiles_64not   tiles_32lightstone
//const sprite = new Image(resfolder + "/tiles_64not.png");
const sprite_lr = new Image(resfolder + "/dogchar64clear_r.png");
const sprite_f = new Image(resfolder + "/dogchar64clear_f.png");
const sprite_b = new Image(resfolder + "/dogchar64clear_b.png");
const tile_dblue = new Image(resfolder + "/tiles_64darkerblue.png");

const mapobjSprites = {
    doorkey: new Image(resfolder + "/doorkey32.png")
};

//const tile_32 = new Image(resfolder + "/tiles_64not.png");

var screen_640x448 = new Image(resfolder + "/blankred_640x448.png");// blankred_64 
screen_640x448.x = 0;
screen_640x448.y = 0;
screen_640x448.endx = 640;
screen_640x448.endy = 448;
screen_640x448.width = 640;
screen_640x448.height = 448;
var blankscreen_pixels = new Int32Array(screen_640x448.pixels);



const START_BMP24 = 54;

////var areamap_demo = std.open(resfolder + "/maparea_advdemo0.bmp", "r");// new Image("maparea_demo0.bmp");

var abmap = new ArrayBuffer(14 * 20 * 3 + START_BMP24);
////areamap_demo.read(abmap, 0, 14 * 20 * 3 - 0 + START_BMP24)
var bmap = new Uint8Array(abmap);
//let areamap_pixels = new Int8Array(areamap_demo.pixels);


//let largebg = new Image(resfolder + "/Loulou_UomoScreen.png");

sprite_lr.drawoffsetx = 0.0;

var charpos = { x: 50.0, y: 50.0, width: 64, height: 64, drawoffsetx: 0.0, drawoffsety: 0.0, isFlipped: false, 
    charsprite: sprite_lr,
    facing: 'r',
    timemove: 0.0,
    lastmovevec: { x: 0.0, y: 0.0 } };

var mapobjects = new Array();

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Screen.getMode(); 


//largebg.width = 640;
//largebg.height = 448;

// tile_32.x = 0;
// tile_32.y = 0;
// tile_32.endx = 32;
// tile_32.endy = 32;
// tile_32.width = 32;
// tile_32.height = 32;

sprite_lr.x = 0;
sprite_lr.y = 0;
sprite_lr.endx = 64;
sprite_lr.endy = 64;
sprite_lr.width = 64;
sprite_lr.height = 64;

sprite_b.x = 0;
sprite_b.y = 0;
sprite_b.endx = 64;
sprite_b.endy = 64;
sprite_b.width = 64;
sprite_b.height = 64;

sprite_f.x = 0;
sprite_f.y = 0;
sprite_f.endx = 64;
sprite_f.endy = 64;
sprite_f.width = 64;
sprite_f.height = 64;

tile_lightstone.width = 32;
tile_lightstone.height = 32;
tile_dblue.width = 32;
tile_dblue.height = 32;

var interruptEffect = null;
var allowMoveChar = true;

var gamemode = {
    "loadingmap": 0,
    "inovermap": 1,
    "initgame": 2
}

var gamestate = {
    levelid: 0,
    currentGameMode: gamemode["initgame"]
};

var wmap = {
    areamap: null,
    mapbits: null,
};



var level_0_pathedSpecials = {

    1: { code: 'doorkey' },
    2: { code: 'eedoor_e' },
    3: { code: 'eedoor_n' },
    4: { code: 'chest_w', id: 0 },
    5: { code: 'chest_n', id: 1 },
    6: { code: 'enterzone', id: 0 },
    7: { code: 'exitzone', id: 0 },
    8: { code: 'exitzone', id: 1 }

};

function loadLevel(levelnum) {

    var areamap;
    wmap.mapbits = null;

    switch(levelnum){
        case 0:
        std.printf(" \n i say 0");
            areamap = std.open(resfolder + "/maparea_advdemo0.bmp", "r");// new Image("maparea_demo0.bmp");
            var tempmap = new ArrayBuffer(14 * 20 * 3 + START_BMP24);
            areamap.read(tempmap, 0, 14 * 20 * 3 - 0 + START_BMP24)
            wmap.mapbits = new Uint8Array(tempmap);
        break;
        case 1:
        std.printf(" \n i say 11");
            areamap = std.open(resfolder + "/maparea_advdemo1.bmp", "r");// new Image("maparea_demo0.bmp");
            var tempmap = new ArrayBuffer(14 * 20 * 3 + START_BMP24);
            areamap.read(tempmap, 0, 14 * 20 * 3 - 0 + START_BMP24)
            wmap.mapbits = new Uint8Array(tempmap);
        break;


    }

    bmap = null;

    bmap = wmap.mapbits;

    std.printf(" \n level is " + levelnum);
    std.printf(" \n level is " + levelnum);
    gamestate.levelid = levelnum;
    std.printf(" \n level is " + levelnum);
    SetupLevelFromImage_Static();
    charpos.x = 50.0;
    charpos.y = 50.0; 

    gamestate.currentGameMode = gamemode["inovermap"];
    allowMoveChar = true;
}

function createMapObject(numcode, level, x, y, i, j) {

    var ref = level_0_pathedSpecials[numcode];
    //std.printf("\n" + numcode + "\n");
    //std.printf("\n" + ref + "\n");
    //std.printf("\n" + ref.code + "\n");

    var newobj = {};
    if(ref.code == 'doorkey') {
        newobj.code = ref.code;
        newobj.sprite = mapobjSprites.doorkey
        newobj.x = x;
        newobj.y = y;
        newobj.width = 32;
        newobj.height = 32;
        newobj.collisionType = 'touch'
    }
    if(ref.code == 'exitzone') {
        newobj.code = ref.code;
        newobj.levelid = ref.id;
        newobj.sprite = null;
        newobj.x = x;
        newobj.y = y;
        newobj.width = 32;
        newobj.height = 32;
        newobj.collisionType = 'mycenter'
        if(i == 0) {
            newobj.collisionType = 'exitleft';
        }
        if(i == 19) {
            newobj.collisionType = 'exitright';
        }
        var refid = newobj.levelid;
        std.printf('>>>' + newobj.collisionType);
        std.printf('>>>' + newobj.collisionType);
        newobj.interruptEffect = function() {
            allowMoveChar = false;
            loadLevel(refid);
            interruptEffect = null;
        }
    }

    mapobjects.push(newobj);
}


function tryMoveChar_Continuous(cpos, vec) {
    std.printf("\n");

    var dir = { x: Math.sign(vec.x), y: Math.sign(vec.y) };

    //var slope = vec.y / vec.x;

    //find range of cells to track
    var olx = cpos.x;
    var orx = cpos.x + cpos.width;
    var oty = cpos.y;
    var oby = cpos.y + cpos.height;

    var nlx = cpos.x + vec.x;
    var nrx = cpos.x + cpos.width + vec.x;
    var nty = cpos.y + vec.y;
    var nby = cpos.y + cpos.height + vec.y;

    var newleftx = Math.floor(Math.ceil(cpos.x + vec.x) / 32);
    var newrightx = Math.floor((cpos.x + cpos.width + vec.x) / 32);
    var newtopy = Math.floor(Math.ceil(cpos.y + vec.y) / 32);//Math.floor(Math.floor((cpos.y + dir.y) / 32) / 20);
    var newboty = Math.floor((cpos.y + cpos.height + vec.y) / 32);//Math.floor(Math.floor((cpos.y + cpos.height + dir.y) / 32) / 20);

    std.printf(newleftx + "-" + newrightx + ", " + newtopy + "-" + newboty);

    for(var i = newleftx; i <= newrightx; i++) {
        for(var j = newtopy; j <= newboty; j++) {
            var p = START_BMP24 + ((14 - 1 - j) * 20 * 3) + i * 3;
            
            //std.printf(" at pixel: " + p);//54 + i * 3 + 20 * 3(14 - 1 - j)    

            if(bmap[p + 0] == 0 || i < 0 || j < 0 || i > 19 || j > 13) {

                if(nlx + 0.02 < (i + 1.0) * 32.0 && olx >= ((i + 1.0) * 32.0) + 0.02){//from right
                    std.printf(" a ");
                    //std.printf(" a ");
                    //std.printf(olx);
                    //std.printf(" , ");
                    //std.printf((i + 1.0) * 32.0);

                    vec.x = ((i + 1.0) * 32.0) - olx + 0.02;
                } else if(nrx - 0.02 > (i * 32.0) && orx <= (i * 32.0) - 0.02) {//from left
                    std.printf(" b ");
                    //std.printf(orx);
                    //std.printf(" , ");
                    //std.printf((i * 32.0));
                    vec.x = (i * 32.0) - orx - 0.02;
                } else if(nty + 0.02 < (j + 1.0) * 32.0 && oty >= ((j + 1.0) * 32.0) + 0.02){// 
                    
                    std.printf(" c ");
                    vec.y = ((j + 1.0) * 32.0) - oty + 0.02;
                } else if(nby - 0.02 > (j * 32.0) && oby <= (j * 32.0) - 0.02) {// 
                    
                    std.printf(" d ");
                    //std.printf((j * 32.0));
                    vec.y = (j * 32.0) - oby - 0.02;
                } else {
                    std.printf(" ee ");
                    vec.x = 0.0;
                    vec.y = 0.0;
                }

                std.printf(" < hit " + vec.x + ' ' + vec.y + '   ');
            }
        }
    }

    cpos.x += vec.x;
    cpos.y += vec.y;

}

function setNewBoundsForPosByVec(bounds, posx, posy, w, h, vec) {
    
    bounds.left = (posx + vec.x);
    bounds.right = posx + w + vec.x;
    bounds.top = (posy + vec.y);
    bounds.bottom = posy + h + vec.y;
}

function getEdgeToCornerCenter(edgecenter, charcorner, evec) {
                        
    var edgeToCornerCenter = {}
    edgeToCornerCenter.x = (edgecenter.x) - (charcorner.x + evec.x);
    edgeToCornerCenter.y = (edgecenter.y) - (charcorner.y + evec.y);

    return edgeToCornerCenter;
}

function getCornerNewVec(origvec, squaredEdgeDist, edgeRadius) {
    var evec = { x: origvec.x, y: origvec.y };
    var veclen = Math.sqrt(evec.x * evec.x + evec.y * evec.y);
    var realEdgeDist = Math.sqrt(squaredEdgeDist);
    var eincursion = edgeRadius - realEdgeDist;//
    var eratio = (veclen - eincursion) / veclen;
    eratio -= 0.02;//just for rounding
    evec.x = evec.x * eratio;
    evec.y = evec.y * eratio;

    return evec;
}

function getCornerIncursionComp(ovec, evec, edgeRadius, edgeToCornerCenter) {

    var incursionVect = {};
    incursionVect.x = ovec.x - evec.x;
    incursionVect.y = ovec.y - evec.y;

    var dot = edgeToCornerCenter.x * incursionVect.x + edgeToCornerCenter.y * incursionVect.y;
    var proj = { x: (edgeToCornerCenter.x * dot) / (edgeRadius * edgeRadius), y: (edgeToCornerCenter.y * dot) / (edgeRadius * edgeRadius) };
    var comp = { x: incursionVect.x - proj.x, y: incursionVect.y - proj.y };

    return comp;
}

//Continuous Single Resolved Rounded...
function tryMoveChar_CSRR(cpos, vec, level) {
    //std.printf("\n");
    if(level < 0) {
        return;
    }

    const edgeRadius = 16.0;

    // var adjustedDest = { x: cpos.x + vec.x, y: cpos.y + vec.y }
    // if(vec.x > 0) {
    //     adjustedDest.x = Math.floor(adjustedDest.x);
    // }
    // else if(vec.x < 0){
    //     adjustedDest.x = Math.ceil(adjustedDest.x);
    // }
    // if(vec.y > 0) {
    //     adjustedDest.y = Math.floor(adjustedDest.y);
    // }
    // else if(vec.y < 0){
    //     adjustedDest.y = Math.ceil(adjustedDest.y);
    // }
    // vec.x = adjustedDest.x - cpos.x;
    // vec.y = adjustedDest.y - cpos.y;

    var ovec = { x: vec.x, y: vec.y };
    var hasHit = false;
    var afterResVec = { x: 0.0, y: 0.0 };

    //var slope = vec.y / vec.x;

    //find range of cells to track

    var cheight = cpos.height - 0.2;
    var cwidth = cpos.width - 0.2;

    var olx = cpos.x;
    var orx = cpos.x + cwidth;
    var oty = cpos.y;
    var oby = cpos.y + cheight;

    //var nlx = (cpos.x + vec.x);
    //var nrx = cpos.x + cwidth + vec.x;
    //var nty = (cpos.y + vec.y);
    //var nby = cpos.y + cheight + vec.y;
    var nbpos = {};
    nbpos.left = (cpos.x + vec.x);
    nbpos.right = cpos.x + cwidth + vec.x;
    nbpos.top = (cpos.y + vec.y);
    nbpos.bottom = cpos.y + cheight + vec.y;

    var newleftx = Math.floor((cpos.x + vec.x) / 32);
    var newrightx = Math.floor((cpos.x + cwidth + vec.x) / 32);
    var newtopy = Math.floor((cpos.y + vec.y) / 32);//Math.floor(Math.floor((cpos.y + dir.y) / 32) / 20);
    var newboty = Math.floor((cpos.y + cheight + vec.y) / 32);//Math.floor(Math.floor((cpos.y + cpos.height + dir.y) / 32) / 20);

    //std.printf('lev ' + level + '  ' + newleftx + "-" + newrightx + ", " + newtopy + "-" + newboty + 'absolute: ' + cpos.x + ' ' + cpos.y);

    var istart = ovec.x < 0 ? newrightx : newleftx;
    var i_inc = ovec.x < 0 ? -1 : 1;
    var jstart = ovec.y < 0 ? newboty : newtopy;
    var j_inc = ovec.y < 0 ? -1 : 1;
    for(var i = istart; i >= newleftx && i <= newrightx; i += i_inc) { // (var i = newleftx; i <= newrightx; i++)
        //todo george problem with c maybe? very subtle
        for(var j = jstart; j >= newtopy && j <= newboty; j += j_inc) { //(var j = newtopy; j <= newboty; j++)
            var p = START_BMP24 + ((14 - 1 - j) * 20 * 3) + i * 3;
            
            //std.printf(" at pixel: " + p);//54 + i * 3 + 20 * 3(14 - 1 - j)    

            if(i < 0 || j < 0 || i > 19 || j > 13){
                continue;
            }

            if(bmap[p + 0] == 0 || i < 0 || j < 0 || i > 19 || j > 13) {

                var otherbox = {};
                otherbox.right = (i + 1.0) * 32.0;
                otherbox.left = (i * 32.0);
                otherbox.top = (j * 32.0);
                otherbox.bottom = ((j + 1.0) * 32.0);

                var loophit = false;

                var ignoreHit = false;
                
                
                if(j < 13 && bmap[START_BMP24 + ((14 - 2 - j) * 20 * 3) + i * 3] != 0 && nbpos.top > otherbox.bottom - edgeRadius && nbpos.right < otherbox.left + edgeRadius){//your topright
                    var edgecenter = {};
                    edgecenter.x = otherbox.left + edgeRadius;
                    edgecenter.y = otherbox.bottom - edgeRadius;

                    var edgeDist = (nbpos.top - edgecenter.y) * (nbpos.top - edgecenter.y) + (nbpos.right - edgecenter.x) * (nbpos.right - edgecenter.x);
                    ignoreHit = edgeDist > (edgeRadius * edgeRadius);
                    //std.printf(" n ");
                    if(!ignoreHit){
                        //std.printf(" nside ");
                        var charcorner = { x: cpos.x + cwidth, y: cpos.y };

                        var evec = getCornerNewVec(ovec, edgeDist, edgeRadius);
                        
                        var edgeToCornerCenter = getEdgeToCornerCenter(edgecenter, charcorner, evec) 
                        evec.x = evec.x - (edgeToCornerCenter.x * 0.1);
                        evec.y = evec.y - (edgeToCornerCenter.y * 0.1);
                        //std.printf(eratio + ":" + evec.x + "," + evec.y);

                        if(charcorner.y + evec.y < (edgecenter.y) || charcorner.x + evec.x > edgecenter.x) {
                            ignoreHit = false
                        } else {                           
                            
                            loophit = true;                    
                            hasHit = true;

                            vec.x = evec.x;
                            vec.y = evec.y;
                            
                            setNewBoundsForPosByVec(nbpos, cpos.x, cpos.y, cwidth, cheight, vec);
                            var comp = getCornerIncursionComp(ovec, evec, edgeRadius, edgeToCornerCenter);
                            afterResVec.y = comp.y;
                            afterResVec.x = comp.x;                            
                            //std.printf(" nresolve " + comp.x + ',' + comp.y);
                        }

                    }
                }
                if(j < 13 && bmap[START_BMP24 + ((14 - 2 - j) * 20 * 3) + i * 3] != 0 && nbpos.top > otherbox.bottom - edgeRadius && nbpos.left > otherbox.right - edgeRadius){//your topleft
                    var edgecenter = {};
                    edgecenter.x = otherbox.right - edgeRadius;
                    edgecenter.y = otherbox.bottom - edgeRadius;

                    var edgeDist = (nbpos.top - edgecenter.y) * (nbpos.top - edgecenter.y) + (nbpos.left - edgecenter.x) * (nbpos.left - edgecenter.x);
                    ignoreHit = edgeDist > (edgeRadius * edgeRadius);
                    //std.printf(" o ");
                    if(!ignoreHit){
                        //std.printf(" oside ");
                        var charcorner = { x: cpos.x, y: cpos.y };

                        var evec = getCornerNewVec(ovec, edgeDist, edgeRadius);
                        
                        var edgeToCornerCenter = getEdgeToCornerCenter(edgecenter, charcorner, evec) 
                        evec.x = evec.x - (edgeToCornerCenter.x * 0.1);
                        evec.y = evec.y - (edgeToCornerCenter.y * 0.1);
                        //std.printf(eratio + ":" + evec.x + "," + evec.y);

                        if(charcorner.y + evec.y < (edgecenter.y) || charcorner.x + evec.x < edgecenter.x) {
                            ignoreHit = false
                        } else {                           
                            
                            loophit = true;                    
                            hasHit = true;

                            vec.x = evec.x;
                            vec.y = evec.y;
                            
                            setNewBoundsForPosByVec(nbpos, cpos.x, cpos.y, cwidth, cheight, vec);
                            var comp = getCornerIncursionComp(ovec, evec, edgeRadius, edgeToCornerCenter);
                            afterResVec.y = comp.y;
                            afterResVec.x = comp.x;                            
                            //std.printf(" oresolve " + comp.x + ',' + comp.y);
                        }

                    }
                }
                if(nbpos.bottom < otherbox.top + edgeRadius && nbpos.left > otherbox.right - edgeRadius){//your botleft
                    var edgecenter = {};
                    edgecenter.x = otherbox.right - edgeRadius;
                    edgecenter.y = otherbox.top + edgeRadius;

                    var edgeDist = (nbpos.bottom - edgecenter.y) * (nbpos.bottom - edgecenter.y) + (nbpos.left - edgecenter.x) * (nbpos.left - edgecenter.x);
                    ignoreHit = edgeDist > (edgeRadius * edgeRadius);
                    //std.printf(" p ");
                    if(!ignoreHit){
                        //std.printf(" pside ");
                        var charcorner = { x: cpos.x, y: cpos.y + cheight };

                        var evec = getCornerNewVec(ovec, edgeDist, edgeRadius);
                        
                        var edgeToCornerCenter = getEdgeToCornerCenter(edgecenter, charcorner, evec) 
                        evec.x = evec.x - (edgeToCornerCenter.x * 0.1);
                        evec.y = evec.y - (edgeToCornerCenter.y * 0.1);
                        //std.printf(eratio + ":" + evec.x + "," + evec.y);

                        if(charcorner.y + evec.y > (edgecenter.y) || charcorner.x + evec.x < edgecenter.x) {
                            ignoreHit = false
                        } else {                           
                            
                            loophit = true;                    
                            hasHit = true;

                            vec.x = evec.x;
                            vec.y = evec.y;
                            
                            setNewBoundsForPosByVec(nbpos, cpos.x, cpos.y, cwidth, cheight, vec);
                            var comp = getCornerIncursionComp(ovec, evec, edgeRadius, edgeToCornerCenter);
                            afterResVec.y = comp.y;
                            afterResVec.x = comp.x;                            
                            //std.printf(" presolve " + comp.x + ',' + comp.y);
                        }

                    }
                }
                if(nbpos.bottom < otherbox.top + edgeRadius && nbpos.right < otherbox.left + edgeRadius){//your botright
                    var edgecenter = {};
                    edgecenter.x = otherbox.left + edgeRadius;
                    edgecenter.y = otherbox.top + edgeRadius;

                    var edgeDist = (nbpos.bottom - edgecenter.y) * (nbpos.bottom - edgecenter.y) + (nbpos.right - edgecenter.x) * (nbpos.right - edgecenter.x);
                    ignoreHit = edgeDist > (edgeRadius * edgeRadius);
                    //std.printf(" q ");
                    if(!ignoreHit){
                        //std.printf(" qside ");
                        var charcorner = { x: cpos.x + cwidth, y: cpos.y + cheight };

                        var evec = getCornerNewVec(ovec, edgeDist, edgeRadius);
                        
                        var edgeToCornerCenter = getEdgeToCornerCenter(edgecenter, charcorner, evec) 
                        evec.x = evec.x - (edgeToCornerCenter.x * 0.1);
                        evec.y = evec.y - (edgeToCornerCenter.y * 0.1);
                        //std.printf(eratio + ":" + evec.x + "," + evec.y);

                        if(charcorner.y + evec.y > (edgecenter.y) || charcorner.x + evec.x > edgecenter.x) {
                            ignoreHit = false
                        } else {                           
                            
                            loophit = true;                    
                            hasHit = true;

                            vec.x = evec.x;
                            vec.y = evec.y;
                            
                            setNewBoundsForPosByVec(nbpos, cpos.x, cpos.y, cwidth, cheight, vec);
                            var comp = getCornerIncursionComp(ovec, evec, edgeRadius, edgeToCornerCenter);
                            afterResVec.y = comp.y;
                            afterResVec.x = comp.x;                            
                            //std.printf(" qresolve " + comp.x + ',' + comp.y);
                        }

                    }
                }

                if(ignoreHit) {
                    //std.printf("<edge ");
                    continue;
                }
                if(loophit) {
                    //std.printf("<slide ");
                    continue;
                }

                if(nbpos.left < otherbox.right && olx >= (otherbox.right)){//from right

                    //std.printf(" a ");
                    loophit = true;
                    
                    hasHit = true;
                    vec.x = (otherbox.right) - olx + 0.04;
                    
                    var ratio = ovec.x != 0 ? vec.x / ovec.x : 0.0;
                    vec.y = ratio * ovec.y;// y traveled at collision

                    setNewBoundsForPosByVec(nbpos, cpos.x, cpos.y, cwidth, cheight, vec);

                    afterResVec.x = 0.0;
                    afterResVec.y = ovec.y - vec.y; //amount of y left
                } 
                if(nbpos.right > otherbox.left && orx <= otherbox.left) {//from left
                    //std.printf(" b ");
                    loophit = true;
                    
                    hasHit = true;
                    vec.x = otherbox.left - orx - 0.04;
                        
                    var ratio = ovec.x != 0 ? vec.x / ovec.x : 0.0;
                    vec.y = ratio * ovec.y;// y traveled at collision
                    
                    setNewBoundsForPosByVec(nbpos, cpos.x, cpos.y, cwidth, cheight, vec);
                        
                    afterResVec.x = 0.0;
                    afterResVec.y = ovec.y - vec.y; //amount of y left
                }  
                if(nbpos.top < otherbox.bottom && oty >= (otherbox.bottom) ){// 
                    
                    //std.printf(" c ");
                    loophit = true;
                    
                    hasHit = true;
                    vec.y = (otherbox.bottom) - oty + 0.04;
                    
                    var ratio = ovec.y != 0 ? vec.y / ovec.y : 0.0;
                    vec.x = ratio * ovec.x;// y traveled at collision

                    setNewBoundsForPosByVec(nbpos, cpos.x, cpos.y, cwidth, cheight, vec);

                    afterResVec.y = 0.0;
                    afterResVec.x = ovec.x - vec.x;
                } 
                if(nbpos.bottom > otherbox.top && oby <= otherbox.top) {// 
                    
                    //std.printf(" d ");
                    loophit = true;
                    
                    hasHit = true;
                    vec.y = otherbox.top - oby - 0.04;
                    
                    var ratio = ovec.y != 0 ? vec.y / ovec.y : 0.0;
                    vec.x = ratio * ovec.x;// y traveled at collision

                    setNewBoundsForPosByVec(nbpos, cpos.x, cpos.y, cwidth, cheight, vec);

                    afterResVec.y = 0.0;
                    afterResVec.x = ovec.x - vec.x;
                } 
                
                if(!loophit)
                {
                    
                    if(nbpos.left + 0.02 < otherbox.right &&
                            nbpos.right - 0.02 > otherbox.left &&
                            nbpos.top + 0.02 < otherbox.bottom &&
                            nbpos.bottom - 0.02 > otherbox.top) {
                        var displaced = false;
                        if (otherbox.right - nbpos.left < 3.0) {

                            displaced = true;
                            //std.printf(" dis1 ");
                            vec.x += Math.abs(nbpos.left - otherbox.right) + 0.1;
                        }
                        if (nbpos.right - otherbox.left < 3.0) {

                            displaced = true;
                            //std.printf(" dis2 ");
                            vec.x -= nbpos.right - otherbox.left + 0.1;
                        }
                        if (otherbox.bottom - nbpos.top < 3.0) {

                            displaced = true;
                            //std.printf(" dis3 ");
                            vec.y += Math.abs(nbpos.top - otherbox.bottom) + 0.1;
                        }
                        if (nbpos.bottom - otherbox.top < 3.0) {

                            displaced = true;
                            //std.printf(" dis4 ");
                            vec.x -= nbpos.bottom - otherbox.top + 0.1;
                        }

                        if(!displaced) {
                            hasHit = true;
                            ////std.printf(" ee " + i + ',' + j + ' ' + level + ' in ' + nbpos.left + ' ' + nbpos.top);
                            vec.x = 0.0;
                            vec.y = 0.0;
                            
                            afterResVec.y = 0.0;
                            afterResVec.x = 0.0;
                        }
                    }
                }

                ////std.printf(" < hit at level " + level + '  ' + vec.x + ' ' + vec.y + '   ');
            }
        }
    }

    // var eadjustedDest = { x: cpos.x + vec.x, y: cpos.y + vec.y }
    // if(ovec.x > 0) {
    //     eadjustedDest.x = Math.floor(eadjustedDest.x);
    // }
    // else if(ovec.x < 0){
    //     eadjustedDest.x = Math.ceil(eadjustedDest.x);
    // }
    // if(ovec.y > 0) {
    //     eadjustedDest.y = Math.floor(eadjustedDest.y);
    // }
    // else if(ovec.y < 0){
    //     eadjustedDest.y = Math.ceil(eadjustedDest.y);
    // }
    // vec.x = eadjustedDest.x - cpos.x;
    // vec.y = eadjustedDest.y - cpos.y;

    ////std.printf("\n" + vec.x + ' ' + vec.y);
    cpos.x += vec.x;
    cpos.y += vec.y;

    if(hasHit && (afterResVec.x != 0.0 || afterResVec.y != 0.0)){
        tryMoveChar_CSRR(cpos, afterResVec, level - 1);
    }

}

function checkObectCollisions() {
    var idsToDelete = new Array();
    var interruptSideEffectObj = null;
    for(let c = 0; c < mapobjects.length; c++) {
        var mo = mapobjects[c];
        //if( Math.abs(charpos.x + charpos.width / 2.0 - (mo.x + mo.width / 2.0)) < Math.abs(mo.width / 2.0 + charpos.width / 2.0))
        if(mapobjects[c].collisionType == 'touch' && charpos.x + 0.01 < mo.x + mo.width && charpos.x + charpos.width > mo.x + 0.01) {
            if( charpos.y + 0.01 < mo.y + mo.height && charpos.y + charpos.height > mo.y + 0.01) {
                idsToDelete.push(c);    
                std.printf(" \n picked up " + c);
            }
        }
        if(mapobjects[c].collisionType == 'mycenter' && charpos.x < mo.x + mo.width / 2.0 && charpos.x + charpos.width > mo.x + mo.width / 2.0) {
            if( charpos.y + 0.01 < mo.y + mo.height + mo.height / 2.0 && charpos.y + charpos.height > mo.y + mo.height / 2.0) {
                //idsToDelete.push(c); 
                //interruptSideEffectObj = mo;   
                std.printf(" \n\n contains cneter " + c);
            }
        }
        if(mapobjects[c].collisionType == 'exitright' && charpos.x < mo.x + mo.width && charpos.x + charpos.width > mo.x + mo.width + 0.01) {
            if( charpos.y + 0.01 < mo.y + mo.height + mo.height / 2.0 && charpos.y + charpos.height > mo.y + mo.height / 2.0) {
                //idsToDelete.push(c); 
                interruptSideEffectObj = mo;   
                std.printf(" \n\n exitright " + c);
            }
        }
        if(mapobjects[c].collisionType == 'exitleft' && charpos.x < mo.x - 0.01 && charpos.x + charpos.width > mo.x) {
            if( charpos.y + 0.01 < mo.y + mo.height + mo.height / 2.0 && charpos.y + charpos.height > mo.y + mo.height / 2.0) {
                //idsToDelete.push(c); 
                interruptSideEffectObj = mo;   
                std.printf(" \n\n exitleft " + c);
            }
        }
    }

    if(interruptSideEffectObj && interruptSideEffectObj.interruptEffect) {
        interruptEffect = interruptSideEffectObj.interruptEffect;
    } else {        
        for(let d = 0; d < idsToDelete.length; d++) {
            mapobjects.splice(idsToDelete[d], 1);
        }
    }
}

function SetupLevelFromImage_Static(){

//

    //const work_640x448 = new Image(resfolder + "/blank_640x448.png");// blankred_64 
    //let work_pixels = new Int8Array(work_640x448.pixels);
    let tile_dblue_pixels = new Int32Array(tile_dblue.pixels);// BigInt64Array   Int32Array
    let tile_lightstone_pixels = new Int32Array(tile_lightstone.pixels);//

    var mapbits = bmap;

  screen_640x448 = new Image(resfolder + "/blankred_640x448.png");// blankred_64 
screen_640x448.x = 0;
screen_640x448.y = 0;
screen_640x448.endx = 640;
screen_640x448.endy = 448;
screen_640x448.width = 640;
screen_640x448.height = 448;
    blankscreen_pixels = new Int32Array(screen_640x448.pixels);

    //var levelid = 0;
 
    //std.printf("\n\nHEYEYE HEY " + blankscreen_pixels.length + "\n\n");

    var currentSource = tile_dblue_pixels;

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

//setup bg
let timer = Timer.new()
Timer.getTime(timer)
std.printf("\ntimestart: " + Timer.getTime(timer).toString());
std.printf("\ntimestart: " + Timer.getTime(timer).toString());
//SetupLevelFromImage_Static();
loadLevel(0);
std.printf("\n timefnis: " + Timer.getTime(timer).toString());
std.printf("\n timefnis: " + Timer.getTime(timer).toString());

function RunInOverMap() {
    var sprite = charpos.charsprite;

    if(allowMoveChar) {

        var movevec = { x: 0.0, y: 0.0 };
        var speed = Math.min(Math.max(1.00, charpos.timemove / 1.2) * 0.79, 5.09);

        if (p1Pad.pressed(Pads.RIGHT)) {
            sprite = sprite_lr;
            if (charpos.isFlipped) {
                sprite.width = Math.abs(sprite.width);
                sprite.x = 0;
                //charpos.x -= sprite.width;
                sprite.drawoffsetx = 0;
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
                sprite.drawoffsetx = -sprite.width;
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
            charpos.facing = 'b';
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
            charpos.facing = 'f';
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
    }
    
    
    screen_640x448.draw(0.0, 0.0);//tile_dblue   screen_640x448

    for(let c = 0; c < mapobjects.length; c++) {
        var mo = mapobjects[c];
        if(mo.sprite) {
            mapobjects[c].sprite.draw(mo.x, mo.y);
        }
    }

    sprite.draw(charpos.x + (sprite.drawoffsetx || 0.0), charpos.y + charpos.drawoffsety);
    font.print(10, 10, "Why dost thou continue?");    

    charpos.charsprite = sprite;

    
    if(interruptEffect) {
        interruptEffect();
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

    switch(gamestate.currentGameMode) {
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
        //std.printf("\n timeinitgame: " + Timer.getTime(timer).toString());
        //std.printf("\n timeinitgame: " + Timer.getTime(timer).toString());
            gamestate.currentGameMode = gamemode["inovermap"];
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