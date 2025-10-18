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

// Change your root folder to "gpractice" so we can work with file path magic :p
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

const screen_640x448 = new Image(resfolder + "/blankred_640x448.png");// blankred_64 
screen_640x448.x = 0;
screen_640x448.y = 0;
screen_640x448.endx = 640;
screen_640x448.endy = 448;
screen_640x448.width = 640;
screen_640x448.height = 448;
let blankscreen_pixels = new Int32Array(screen_640x448.pixels);



const START_BMP24 = 54;

let areamap_demo = std.open(resfolder + "/maparea_advdemo0.bmp", "r");// new Image("maparea_demo0.bmp");

var abmap = new ArrayBuffer(14 * 20 * 3 + START_BMP24);
areamap_demo.read(abmap, 0, 14 * 20 * 3 - 0 + START_BMP24)
var bmap = new Uint8Array(abmap);
let areamap_pixels = new Int8Array(areamap_demo.pixels);


//let largebg = new Image(resfolder + "/Loulou_UomoScreen.png");

sprite_lr.drawoffsetx = 0.0;

var charpos = { x: 50.0, y: 50.0, width: 64, height: 64, drawoffsetx: 0.0, drawoffsety: 0.0, isFlipped: false, 
    charsprite: sprite_lr,
    facing: 'r' };

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

var level_0_pathedSpecials = {

    1: { code: 'doorkey' },
    2: { code: 'eedoor_e' },
    3: { code: 'eedoor_n' },
    4: { code: 'chest_w', id: 0 },
    5: { code: 'chest_n', id: 1 },
    6: { code: 'enterzone', id: 0 },
    7: { code: 'exitzone', id: 0 }

};

function createMapObject(numcode, level, x, y) {

    var ref = level_0_pathedSpecials[numcode];
    std.printf("\n" + numcode + "\n");
    std.printf("\n" + ref + "\n");
    std.printf("\n" + ref.code + "\n");

    var newobj = {};
    if(ref.code == 'doorkey') {
        newobj.code = ref.code;
        newobj.sprite = mapobjSprites.doorkey
        newobj.x = x;
        newobj.y = y;
        newobj.width = 32;
        newobj.height = 32;
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

//Continuous Single Resolved Rounded...
function tryMoveChar_CSRR(cpos, vec, level) {
    std.printf("\n");
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

    var nlx = (cpos.x + vec.x);
    var nrx = cpos.x + cwidth + vec.x;
    var nty = (cpos.y + vec.y);
    var nby = cpos.y + cheight + vec.y;

    var newleftx = Math.floor((cpos.x + vec.x) / 32);
    var newrightx = Math.floor((cpos.x + cwidth + vec.x) / 32);
    var newtopy = Math.floor((cpos.y + vec.y) / 32);//Math.floor(Math.floor((cpos.y + dir.y) / 32) / 20);
    var newboty = Math.floor((cpos.y + cheight + vec.y) / 32);//Math.floor(Math.floor((cpos.y + cpos.height + dir.y) / 32) / 20);

    std.printf('lev ' + level + '  ' + newleftx + "-" + newrightx + ", " + newtopy + "-" + newboty + 'absolute: ' + cpos.x + ' ' + cpos.y);

    var istart = ovec.x < 0 ? newrightx : newleftx;
    var i_inc = ovec.x < 0 ? -1 : 1;
    for(var i = istart; i >= newleftx && i <= newrightx; i += i_inc) { // (var i = newleftx; i <= newrightx; i++)
        for(var j = newtopy; j <= newboty; j++) { //
            var p = START_BMP24 + ((14 - 1 - j) * 20 * 3) + i * 3;
            
            //std.printf(" at pixel: " + p);//54 + i * 3 + 20 * 3(14 - 1 - j)    

            if(bmap[p + 0] == 0 || i < 0 || j < 0 || i > 19 || j > 13) {

                var loophit = false;

                var ignoreHit = false

                if(nty > (j + 1.0) * 32.0 - edgeRadius && nrx < (i * 32.0) + edgeRadius){//your topright
                    var edgecenter = {};
                    edgecenter.x = (i * 32.0) + edgeRadius;
                    edgecenter.y = (j + 1.0) * 32.0 - edgeRadius;

                    var edgeDist = (nty - edgecenter.y) * (nty - edgecenter.y) + (nrx - edgecenter.x) * (nrx - edgecenter.x);
                    ignoreHit = edgeDist > (edgeRadius * edgeRadius);
                    std.printf(" n ");
                    if(!ignoreHit){
                        std.printf(" nside ");

                        var newEdgeDst = {};

                        var evec = { x: ovec.x, y: ovec.y };
                        var veclen = Math.sqrt(evec.x * evec.x + evec.y * evec.y);
                        var realEdgeDist = Math.sqrt(edgeDist);
                        var eincursion = edgeRadius - realEdgeDist;//
                        var eratio = (veclen - eincursion) / veclen;
                        eratio -= 0.02;//just for rounding
                        evec.x = evec.x * eratio;
                        evec.y = evec.y * eratio;
                        std.printf(eratio + ":" + evec.x + "," + evec.y);

                        if(cpos.y + evec.y < ((j + 1.0) * 32.0 - edgeRadius) || cpos.x + evec.x > (i * 32.0) + edgeRadius) {
                            ignoreHit = false
                        } else {
                            var edgeToCornerCenter = {}
                            edgeToCornerCenter.x = ((i * 32.0) + edgeRadius) - (cpos.x + cwidth + evec.x);
                            edgeToCornerCenter.y = ((j + 1.0) * 32.0 - edgeRadius) - (cpos.y + evec.y);
                            var incursionVect = {};
                            incursionVect.x = ovec.x - evec.x;
                            incursionVect.y = ovec.y - evec.y;

                            var dot = edgeToCornerCenter.x * incursionVect.x + edgeToCornerCenter.y * incursionVect.y;
                            var proj = { x: (edgeToCornerCenter.x * dot) / (edgeRadius * edgeRadius), y: (edgeToCornerCenter.y * dot) / (edgeRadius * edgeRadius) };
                            var comp = { x: incursionVect.x - proj.x, y: incursionVect.y - proj.y };
                            
                            loophit = true;
                    
                            hasHit = true;
                            vec.x = evec.x;
                            vec.y = evec.y;

                            nlx = (cpos.x + vec.x);
                            nrx = cpos.x + cwidth + vec.x;
                            nty = (cpos.y + vec.y);
                            nby = cpos.y + cheight + vec.y;

                            afterResVec.y = comp.y;
                            afterResVec.x = comp.x;
                            
                            std.printf(" nresolve " + comp.x + ',' + comp.y);
                        }

                    }
                }
                if(nty > (j + 1.0) * 32.0 - edgeRadius && nlx > (i + 1.0) * 32.0 - edgeRadius){//your topleft
                    var edgecenter = {};
                    edgecenter.x = (i + 1.0) * 32.0 - edgeRadius;
                    edgecenter.y = (j + 1.0) * 32.0 - edgeRadius;

                    var edgeDist = (nty - edgecenter.y) * (nty - edgecenter.y) + (nlx - edgecenter.x) * (nlx - edgecenter.x);
                    ignoreHit = edgeDist > (edgeRadius * edgeRadius);
                    std.printf(" o ");
                }
                if(nby < (j * 32.0) + edgeRadius && nlx > (i + 1.0) * 32.0 - edgeRadius){//your botleft
                    var edgecenter = {};
                    edgecenter.x = (i + 1.0) * 32.0 - edgeRadius;
                    edgecenter.y = (j * 32.0) + edgeRadius;

                    var edgeDist = (nby - edgecenter.y) * (nby - edgecenter.y) + (nlx - edgecenter.x) * (nlx - edgecenter.x);
                    ignoreHit = edgeDist > (edgeRadius * edgeRadius);
                    std.printf(" p ");
                }
                if(nby < (j * 32.0) + edgeRadius && nrx < (i * 32.0) + edgeRadius){//your botright
                    var edgecenter = {};
                    edgecenter.x = (i * 32.0) + edgeRadius;
                    edgecenter.y = (j * 32.0) + edgeRadius;

                    var edgeDist = (nby - edgecenter.y) * (nby - edgecenter.y) + (nrx - edgecenter.x) * (nrx - edgecenter.x);
                    ignoreHit = edgeDist > (edgeRadius * edgeRadius);
                    std.printf(" q ");
                }

                if(ignoreHit) {
                    std.printf("<edge ");
                    continue;
                }
                if(loophit) {
                    std.printf("<slide ");
                    continue;
                }

                if(nlx < (i + 1.0) * 32.0 && olx >= ((i + 1.0) * 32.0)){//from right

                    std.printf(" a ");
                    loophit = true;
                    
                    hasHit = true;
                    vec.x = ((i + 1.0) * 32.0) - olx + 0.04;
                    
                    var ratio = ovec.x != 0 ? vec.x / ovec.x : 0.0;
                    vec.y = ratio * ovec.y;// y traveled at collision

                    nlx = (cpos.x + vec.x);
                    nrx = cpos.x + cwidth + vec.x;
                    nty = (cpos.y + vec.y);
                    nby = cpos.y + cheight + vec.y;

                    afterResVec.x = 0.0;
                    afterResVec.y = ovec.y - vec.y; //amount of y left
                } 
                if(nrx > (i * 32.0) && orx <= (i * 32.0)) {//from left
                    std.printf(" b ");
                    loophit = true;
                    
                    hasHit = true;
                    vec.x = (i * 32.0) - orx - 0.04;
                        
                    var ratio = ovec.x != 0 ? vec.x / ovec.x : 0.0;
                    vec.y = ratio * ovec.y;// y traveled at collision

                    nlx = (cpos.x + vec.x);
                    nrx = cpos.x + cwidth + vec.x;
                    nty = (cpos.y + vec.y);
                    nby = cpos.y + cheight + vec.y;
                        
                    afterResVec.x = 0.0;
                    afterResVec.y = ovec.y - vec.y; //amount of y left
                }  
                if(nty < (j + 1.0) * 32.0 && oty >= ((j + 1.0) * 32.0) ){// 
                    
                    std.printf(" c ");
                    loophit = true;
                    
                    hasHit = true;
                    vec.y = ((j + 1.0) * 32.0) - oty + 0.04;
                    
                    var ratio = ovec.y != 0 ? vec.y / ovec.y : 0.0;
                    vec.x = ratio * ovec.x;// y traveled at collision

                    nlx = (cpos.x + vec.x);
                    nrx = cpos.x + cwidth + vec.x;
                    nty = (cpos.y + vec.y);
                    nby = cpos.y + cheight + vec.y;

                    afterResVec.y = 0.0;
                    afterResVec.x = ovec.x - vec.x;
                } 
                if(nby > (j * 32.0) && oby <= (j * 32.0)) {// 
                    
                    std.printf(" d ");
                    loophit = true;
                    
                    hasHit = true;
                    vec.y = (j * 32.0) - oby - 0.04;
                    
                    var ratio = ovec.y != 0 ? vec.y / ovec.y : 0.0;
                    vec.x = ratio * ovec.x;// y traveled at collision

                    nlx = (cpos.x + vec.x);
                    nrx = cpos.x + cwidth + vec.x;
                    nty = (cpos.y + vec.y);
                    nby = cpos.y + cheight + vec.y;

                    afterResVec.y = 0.0;
                    afterResVec.x = ovec.x - vec.x;
                } 
                
                if(!loophit)
                {
                    
                    if(nlx + 0.02 < (i + 1.0) * 32.0 &&
                            nrx - 0.02 > (i * 32.0) &&
                            nty + 0.02 < (j + 1.0) * 32.0 &&
                            nby - 0.02 > (j * 32.0)) {
                        hasHit = true;
                        std.printf(" ee " + i + ',' + j + ' ' + level + ' in ' + nlx + ' ' + nty);
                        vec.x = 0.0;
                        vec.y = 0.0;
                        
                        afterResVec.y = 0.0;
                        afterResVec.x = 0.0;
                    }
                }

                std.printf(" < hit at level " + level + '  ' + vec.x + ' ' + vec.y + '   ');
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

    std.printf("\n" + vec.x + ' ' + vec.y);
    cpos.x += vec.x;
    cpos.y += vec.y;

    if(hasHit && (afterResVec.x != 0.0 || afterResVec.y != 0.0)){
        tryMoveChar_CSRR(cpos, afterResVec, level - 1);
    }

}

function checkObectCollisions() {
    var idsToDelete = new Array();
    for(let c = 0; c < mapobjects.length; c++) {
        var mo = mapobjects[c];
        //if( Math.abs(charpos.x + charpos.width / 2.0 - (mo.x + mo.width / 2.0)) < Math.abs(mo.width / 2.0 + charpos.width / 2.0))
        if( charpos.x + 0.01 < mo.x + mo.width && charpos.x + charpos.width > mo.x + 0.01) {
            if( charpos.y + 0.01 < mo.y + mo.height && charpos.y + charpos.height > mo.y + 0.01) {
                idsToDelete.push(c);    
                std.printf(" \n picked up " + c);
            }
        }
    }

    for(let d = 0; d < idsToDelete.length; d++) {
        mapobjects.splice(idsToDelete[d], 1);
    }
}

function SetupLevelFromImage_Static(){

//

    //const work_640x448 = new Image(resfolder + "/blank_640x448.png");// blankred_64 
    //let work_pixels = new Int8Array(work_640x448.pixels);
    let tile_dblue_pixels = new Int32Array(tile_dblue.pixels);// BigInt64Array   Int32Array
    let tile_lightstone_pixels = new Int32Array(tile_lightstone.pixels);//

    var levelid = 0;
 
    std.printf("\n\nHEYEYE HEY " + blankscreen_pixels.length + "\n\n");

    var currentSource = tile_dblue_pixels;

    for(var ti = 0; ti < 20; ti++) {
        for(var tj = 0; tj < 14; tj++) {
    
            var p = START_BMP24 + ((14 - 1 - tj) * 20 * 3) + ti * 3;
            if (bmap[p + 0] == 0) {
                currentSource = tile_dblue_pixels;
            }
            if (bmap[p + 0] == 255) { //-1
                currentSource = tile_lightstone_pixels;

                if(bmap[p + 2] > 0){
                    // var newmapojb = {};
                    // mapobjects.push(newmapojb);
                    createMapObject(bmap[p + 2], levelid, ti * 32, tj * 32);
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
                    blankscreen_pixels[b] = currentSource[sb];
                }
            }

        }
    }


}

//setup bg
SetupLevelFromImage_Static();

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

    var sprite = charpos.charsprite;

    var movevec = { x: 0.0, y: 0.0 };

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
        movevec.x = 5.09;
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
        movevec.x = -5.09;
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
        movevec.y = -5.09;
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
        movevec.y = 5.09;
    }

    if(movevec.x != 0.0 || movevec.y != 0.0) {
        tryMoveChar_CSRR(charpos, movevec, 3)
    }

    checkObectCollisions();
   
    screen_640x448.draw(0.0, 0.0);//tile_dblue   screen_640x448

    for(let c = 0; c < mapobjects.length; c++) {
        var mo = mapobjects[c];
        mapobjects[c].sprite.draw(mo.x, mo.y);
    }

    sprite.draw(charpos.x + (sprite.drawoffsetx || 0.0), charpos.y + charpos.drawoffsety);
    font.print(10, 10, "Why dost thou continue?");    

    charpos.charsprite = sprite;
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