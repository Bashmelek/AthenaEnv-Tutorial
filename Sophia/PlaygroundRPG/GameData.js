


const resfolder = "res" //res   customresources

    std.printf("\n\n Init GameData: ");
//function setupProgram() {


    // Change root folder to "Sophia/PlaygroundRPG"
    os.chdir("Sophia/PlaygroundRPG");


//};



const mylogo = new Image(resfolder + "/makarioslogo2.png");// Loulou_UomoScreen   makarioslogo1

const tile_lightstone = new Image(resfolder + "/tiles_64lightstone.png");//tiles_64not   tiles_32lightstone
//const sprite = new Image(resfolder + "/tiles_64not.png");
const sprite_lr = new Image(resfolder + "/dogchar64clear_r.png");
const sprite_f = new Image(resfolder + "/dogchar64clear_f.png");
const sprite_b = new Image(resfolder + "/dogchar64clear_b.png");
const tile_dblue = new Image(resfolder + "/tiles_64darkerblue.png");
const uibg_sprite = new Image(resfolder + "/tiles_32slate.png");

const mapobjSprites = {
    doorkey: new Image(resfolder + "/doorkey32.png"),
    eastdoor: new Image(resfolder + "/eastdoor_32.png"),
    charcat: new Image(resfolder + "/charchar_64.png"),
    chest_r: new Image(resfolder + "/trchest_33.png"),
    chestopen_r: new Image(resfolder + "/trchestop_33.png"),
};




sprite_lr.drawoffsetx = 0.0;

sprite_lr.x = 0;
sprite_lr.y = 0;
sprite_lr.endx = 64;
sprite_lr.endy = 64;
sprite_lr.width = 64;
sprite_lr.height = 64;
sprite_lr.drawoffsetx = -16.0;

sprite_b.x = 0;
sprite_b.y = 0;
sprite_b.endx = 64;
sprite_b.endy = 64;
sprite_b.width = 64;
sprite_b.height = 64;
sprite_b.drawoffsetx = -16.0;

sprite_f.x = 0;
sprite_f.y = 0;
sprite_f.endx = 64;
sprite_f.endy = 64;
sprite_f.width = 64;
sprite_f.height = 64;
sprite_f.drawoffsetx = -16.0;

tile_lightstone.width = 32;
tile_lightstone.height = 32;
tile_dblue.width = 32;
tile_dblue.height = 32;

//var screen_640x448 = null;




const START_BMP24 = 54;




var level_0_pathedSpecials = {

    1: { code: 'doorkey' },
    2: { code: 'eedoor_e' },
    3: { code: 'eedoor_n' },
    4: { code: 'chest_w', id: 0 },
    5: { code: 'chest_n', id: 1 },
    6: { code: 'enterzone', id: 0 },
    7: { code: 'exitzone', id: 1, dest: 0, transition: 'flow' },
    8: { code: 'exitzone', id: 1, dest: 1, transition: 'flow' },

    10: { code: 'door_e' },
    11: { code: 'door_n' },
    
    16: { code: 'exitzone', id: 1, dest: 2, transition: 'flow' },
    17: { code: 'exitzone', id: 1, dest: 0, transition: 'flow' },

    18: { code: 'exitzone', id: 1, dest: 0, transition: 'flow' },
    19: { code: 'exitzone', id: 1, dest: 1, transition: 'flow' },
    20: { code: 'exitzone', id: 1, dest: 1, transition: 'flow' },
    21: { code: 'exitzone', id: 1, dest: 1, transition: 'flow' },
    22: { code: 'exitzone', id: 1, dest: 1, transition: 'flow' },
    23: { code: 'exitzone', id: 1, dest: 1, transition: 'flow' },
    24: { code: 'exitzone', id: 1, dest: 1, transition: 'flow' },
    25: { code: 'exitzone', id: 1, dest: 1, transition: 'flow' },

    
    32: { code: 'character', id: 0, action: 'talk' },
    33: { code: 'character', id: 1, action: 'talk' },
    
    42: { code: 'chest_r', id: 0 },
    43: { code: 'chest_r', id: 1 },

}; 



export { resfolder,
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
    level_0_pathedSpecials,
 };