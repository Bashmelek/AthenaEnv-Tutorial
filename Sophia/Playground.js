const font = new Font("default");

//Screen.setFrameCounter(true);
//Screen.setVSync(false);

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
os.chdir("gpractice");

const tile_lightstone = new Image("tiles_64lightstone.png");//tiles_64not   tiles_32lightstone
const sprite = new Image("tiles_64not.png");
const tile_dblue = new Image("tiles_64darkerblue.png");


const tile_32 = new Image("tiles_64not.png");
//
let areamap_demo = std.open("maparea_demo0.bmp", "r");// new Image("maparea_demo0.bmp");

const START_BMP24 = 54;

var abmap = new ArrayBuffer(14 * 20 * 3 + START_BMP24);
areamap_demo.read(abmap, 0, 14 * 20 * 3 - 0 + START_BMP24)
var bmap = new Uint8Array(abmap);

let largebg = new Image("Loulou_UomoScreen.png");

let areamap_pixels = new Int8Array(areamap_demo.pixels);

var charpos = { x: 50.0, y: 50.0, width: 64, height: 64, drawoffsetx: 0.0, drawoffsety: 0.0, isFlipped: false }

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Screen.getMode(); 


largebg.width = 640;
largebg.height = 448;

tile_32.x = 0;
tile_32.y = 0;
tile_32.endx = 32;
tile_32.endy = 32;
tile_32.width = 32;
tile_32.height = 32;

sprite.x = 0;
sprite.y = 0;
sprite.endx = 64;
sprite.endy = 64;
sprite.width = 64;
sprite.height = 64;

tile_lightstone.width = 32;
tile_lightstone.height = 32;
tile_dblue.width = 32;
tile_dblue.height = 32;

function tryMoveChar_Continuous(cpos, dir) {
    std.printf("testFunc\n");

    //find range of cells to track
    var newleftx = Math.floor((cpos.x + dir.x) / 32) % 20;
    var newrightx = Math.floor((cpos.x + cpos.width + dir.x) / 32) % 20;
    var newtopy = Math.floor((cpos.y + dir.y) / 32);//Math.floor(Math.floor((cpos.y + dir.y) / 32) / 20);
    var newboty = Math.floor((cpos.y + cpos.height + dir.y) / 32);//Math.floor(Math.floor((cpos.y + cpos.height + dir.y) / 32) / 20);

    std.printf(newleftx + "-" + newrightx + ", " + newtopy + "-" + newboty);

    for(var i = newleftx; i <= newrightx; i++) {
        for(var j = newtopy; j <= newboty; j++) {
            var p = START_BMP24 + ((14 - 1 - j) * 20 * 3) + i * 3;
            
            std.printf(" at pixel: " + p);//54 + i * 3 + 20 * 3(14 - 1 - j)    

            if(bmap[p + 0] == 0) {
                std.printf(" < hit ");
                dir.x = 0.0;
                dir.y = 0.0;
            }
        }
    }

    cpos.x += dir.x;
    cpos.y += dir.y;

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
    //testFunc();


    //tilelightstone.x = 0;
    //std.printf(" " + areamap_pixels.length + '\n');
    //std.puts(areamap_demo.pixels.length);

    ////largebg.draw(0, 0);

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

    for (var j = 0; j < 14; j++) { //14
        for (var i = 0; i < 20; i++)  {
            var p = START_BMP24 + ((14 - 1 - j) * 20 * 3) + i * 3;
            if (bmap[p + 0] == 0) {
                tile_dblue.draw(i * 32, (j) * 32);
            }
            if (bmap[p + 0] == 255) { //-1
                tile_lightstone.draw(i * 32, (j) * 32);
            } 
        }
    }


    font.print(10, 10, "Why dost thou continue?");    
    p1Pad.update();

    if (p1Pad.pressed(Pads.RIGHT)) {
        if (charpos.isFlipped) {
            sprite.width = Math.abs(sprite.width);
            sprite.x = 0;
            //charpos.x -= sprite.width;
            charpos.drawoffsetx = 0;
            charpos.isFlipped = false;
        } 

        tryMoveChar_Continuous(charpos, { x: 5.09, y: 0.0 });
        //charpos.x = charpos.x + 5.09;
    }

    if (p1Pad.pressed(Pads.LEFT)) {
        if (!charpos.isFlipped) {
            sprite.width = -Math.abs(sprite.width);
            sprite.x = sprite.width;
            charpos.drawoffsetx = -sprite.width;
            charpos.isFlipped = true;
        } 
        tryMoveChar_Continuous(charpos, { x: -5.09, y: 0.0 });
        //charpos.x = charpos.x - 5.09;
    }

    if (p1Pad.pressed(Pads.UP)) {
        tryMoveChar_Continuous(charpos, { x: 0.0, y: -5.09 });
        //charpos.y = charpos.y - 5.09;
    }

    if (p1Pad.pressed(Pads.DOWN)) {
        tryMoveChar_Continuous(charpos, { x: 0.0, y: 5.09 });
        //charpos.y = charpos.y + 5.09;
    }
   
    sprite.draw(charpos.x + charpos.drawoffsetx, charpos.y + charpos.drawoffsety);
    //sprite.draw(charpos.x + 40, charpos.y);
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