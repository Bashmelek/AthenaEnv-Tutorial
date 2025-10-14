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
    facing: 'r' }

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

    var newleftx = Math.floor((cpos.x + vec.x) / 32);
    var newrightx = Math.floor((cpos.x + cpos.width + vec.x) / 32);
    var newtopy = Math.floor((cpos.y + vec.y) / 32);//Math.floor(Math.floor((cpos.y + dir.y) / 32) / 20);
    var newboty = Math.floor((cpos.y + cpos.height + vec.y) / 32);//Math.floor(Math.floor((cpos.y + cpos.height + dir.y) / 32) / 20);

    std.printf(newleftx + "-" + newrightx + ", " + newtopy + "-" + newboty);

    for(var i = newleftx; i <= newrightx; i++) {
        for(var j = newtopy; j <= newboty; j++) {
            var p = START_BMP24 + ((14 - 1 - j) * 20 * 3) + i * 3;
            
            //std.printf(" at pixel: " + p);//54 + i * 3 + 20 * 3(14 - 1 - j)    

            if(bmap[p + 0] == 0 || i < 0 || j < 0 || i > 19 || j > 13) {

                if(nlx < (i + 1.0) * 32.0 && olx >= ((i + 1.0) * 32.0) - 0.02){//from right
                    //std.printf(" a ");
                    //std.printf(" a ");
                    //std.printf(olx);
                    //std.printf(" , ");
                    //std.printf((i + 1.0) * 32.0);

                    vec.x = ((i + 1.0) * 32.0) - olx + 0.02;
                } else if(nrx > (i * 32.0) && orx <= (i * 32.0) + 0.02) {//from left
                    //std.printf(" b ");
                    //std.printf(orx);
                    //std.printf(" , ");
                    //std.printf((i * 32.0));
                    vec.x = (i * 32.0) - orx - 0.02;
                } else if(nty < (j + 1.0) * 32.0 && oty >= ((j + 1.0) * 32.0) - 0.02){// 
                    
                    //std.printf(" c ");
                    vec.y = ((j + 1.0) * 32.0) - oty + 0.02;
                } else if(nby > (j * 32.0) && oby <= (j * 32.0) + 0.02) {// 
                    
                    //std.printf(" d ");
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

function SetBackGroundSprite_Static(){

//

    //const work_640x448 = new Image(resfolder + "/blank_640x448.png");// blankred_64 
    //let work_pixels = new Int8Array(work_640x448.pixels);
    let tile_dblue_pixels = new Int32Array(tile_dblue.pixels);// BigInt64Array   Int32Array
    let tile_lightstone_pixels = new Int32Array(tile_lightstone.pixels);//
 
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
            } 

            var startbyte = tj * 32 * 640 + ti * 32;//tj * 32 * 640 * 4 + ti * 32 * 4;

            for(var bi = 0; bi < 32; bi++) {
                var offsetbi = startbyte + (bi * 640);
                var offsetsbi = bi << 6 ;//* 64;// bi % 64 * 64;

                for(var bj = 0; bj < 32; bj++) {//32
                    var b = offsetbi + bj;
                    var sb = (offsetsbi +  bj);//(bj % 64));
                    blankscreen_pixels[b] = currentSource[sb];
                }
            }

        }
    }


    // const blank_128 = new Image(resfolder + "/blankred_128.png");// blankred_64 
    // let blank128_pixels = new Int8Array(blank_128.pixels);
    // let tile_dblue_pixels = new Int8Array(sprite.pixels);

    // std.printf("\n\nHEYEYE HEY" + blank128_pixels.length + "\n\n");

    // for(var bi = 0; bi < 128; bi++) {
    //     for(var bj = 0; bj < 128; bj++) {
    //         var sx = bi % 64;
    //         var xy = bj % 64;
    //         blank128_pixels[(bi * 128 + bj)* 4 + 0] = tile_dblue_pixels[(bi % 64 * 64 + (bj % 64)) * 4 + 0];
    //         blank128_pixels[(bi * 128 + bj)* 4 + 1] = tile_dblue_pixels[(bi % 64 * 64 + (bj % 64)) * 4 + 1];
    //         blank128_pixels[(bi * 128 + bj)* 4 + 2] = tile_dblue_pixels[(bi % 64 * 64 + (bj % 64)) * 4 + 2];
    //         blank128_pixels[(bi * 128 + bj) * 4 + 3] = tile_dblue_pixels[(bi % 64 * 64 + (bj % 64)) * 4 + 3];
    //     }
    // }
}

//setup bg
SetBackGroundSprite_Static();

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
        tryMoveChar_Continuous(charpos, { x: 5.09, y: 0.0 });
        //charpos.x = charpos.x + 5.09;
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
        tryMoveChar_Continuous(charpos, { x: -5.09, y: 0.0 });
        //charpos.x = charpos.x - 5.09;
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
        tryMoveChar_Continuous(charpos, { x: 0.0, y: -5.09 });
        //charpos.y = charpos.y - 5.09;
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
        tryMoveChar_Continuous(charpos, { x: 0.0, y: 5.09 });
        //charpos.y = charpos.y + 5.09;
    }
   
    screen_640x448.draw(0.0, 0.0);//tile_dblue   screen_640x448
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