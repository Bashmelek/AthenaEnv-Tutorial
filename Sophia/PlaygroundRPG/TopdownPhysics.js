

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

    var blockingMapObjs = [];
    for(var m = 0; m < mapobjects.length; m++) {
        var mo = mapobjects[m];
        if(mo.collisionType == 'block' && mo.i >= newleftx && mo.i <= newrightx && mo.j >= newtopy && mo.j <= newboty) {
            blockingMapObjs.push(mo);
        }
    }

    for(var i = istart; i >= newleftx && i <= newrightx; i += i_inc) { // (var i = newleftx; i <= newrightx; i++)
        //todo george problem with c maybe? very subtle
        for(var j = jstart; j >= newtopy && j <= newboty; j += j_inc) { //(var j = newtopy; j <= newboty; j++)
            var p = START_BMP24 + ((14 - 1 - j) * 20 * 3) + i * 3;
            
            //std.printf(" at pixel: " + p);//54 + i * 3 + 20 * 3(14 - 1 - j)    

            if(i < 0 || j < 0 || i > 19 || j > 13){
                continue;
            }

            var hitblockingObj = false;
            for(var b = 0; b < blockingMapObjs.length; b++) {
                if(blockingMapObjs[b].i == i && blockingMapObjs[b].j == j) {
                    hitblockingObj = true;
                }
            }

            if(bmap[p + 0] == 0 || hitblockingObj || i < 0 || j < 0 || i > 19 || j > 13) {

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
                if(mapobjects[c].code == 'doorkey') {
                    gamestate.char.numkeys++;
                }
            }
        }
        if(mapobjects[c].collisionType == 'mycenter' && charpos.x < mo.x + mo.width / 2.0 && charpos.x + charpos.width > mo.x + mo.width / 2.0) {
            if( charpos.y + 0.01 < mo.y + mo.height / 2.0 && charpos.y + charpos.height > mo.y + mo.height / 2.0) {
                //idsToDelete.push(c); 
                //interruptSideEffectObj = mo;   
                std.printf(" \n\n contains cneter " + c);
            }
        }
        if(mapobjects[c].collisionType == 'exitright' && charpos.x < mo.x + mo.width && charpos.x + charpos.width > mo.x + mo.width + 0.01) {
            if( charpos.y + 0.01 < mo.y + mo.height / 2.0 && charpos.y + charpos.height > mo.y + mo.height / 2.0) {
                //idsToDelete.push(c); 
                interruptSideEffectObj = mo;   
                std.printf(" \n\n exitright " + c);
            }
        }
        if(mapobjects[c].collisionType == 'exitleft' && charpos.x < mo.x - 0.01 && charpos.x + charpos.width > mo.x) {
            if( charpos.y + 0.01 < mo.y + mo.height / 2.0 && charpos.y + charpos.height > mo.y + mo.height / 2.0) {
                //idsToDelete.push(c); 
                interruptSideEffectObj = mo;   
                std.printf(" \n\n exitleft " + c);
            }
        }
        if(mapobjects[c].collisionType == 'exitup' && charpos.y < mo.y - 0.01 && charpos.y + charpos.height > mo.y) {
            if( charpos.x + 0.01 < mo.x + mo.width / 2.0 && charpos.x + charpos.width > mo.x + mo.width / 2.0) {
                //idsToDelete.push(c); 
                interruptSideEffectObj = mo;   
                std.printf(" \n\n exitup " + c);
            }
        }
        if(mapobjects[c].collisionType == 'exitdown' && charpos.y < mo.y + mo.height && charpos.y + charpos.height > mo.y + mo.height + 0.01) {
            if( charpos.x + 0.01 < mo.x + mo.width / 2.0 && charpos.x + charpos.width > mo.x + mo.width / 2.0) {
                //idsToDelete.push(c); 
                interruptSideEffectObj = mo;   
                std.printf(" \n\n exitdown " + c);
            }
        }
    }

    if(interruptSideEffectObj && interruptSideEffectObj.interruptEffect) {
        gamestate.interruptEffect = interruptSideEffectObj.interruptEffect;
    } else {        
        for(let d = 0; d < idsToDelete.length; d++) {

            var dkey = mapobjects[idsToDelete[d]].compkey;
            var stateobj = gamestate.levelstates["ls" + gamestate.levelid].mapobjects[dkey];

            if(stateobj == null) {
                gamestate.levelstates["ls" + gamestate.levelid].mapobjects[dkey] = {};
                stateobj = gamestate.levelstates["ls" + gamestate.levelid].mapobjects[dkey];
            }
            stateobj.isRemoved = true;

            mapobjects.splice(idsToDelete[d], 1);
        }
    }
}

export {   
    tryMoveChar_Continuous,
    setNewBoundsForPosByVec,
    getEdgeToCornerCenter,
    getCornerNewVec,
    getCornerIncursionComp,
    tryMoveChar_CSRR,
    checkObectCollisions

 };