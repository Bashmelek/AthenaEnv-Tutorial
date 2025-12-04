
import { resfolder,
    mylogo,
    tile_lightstone,
    sprite_lr,
    sprite_f,
    sprite_b,
    tile_dblue,
    uibg_sprite,
    mapobjSprites,
    screen_640x448,
    START_BMP24, } from "./GameData.js";


var charpos = { x: 50.0, y: 50.0, width: 32, height: 32, drawoffsetx: 0.0, drawoffsety: -32.0, isFlipped: false, 
    charsprite: sprite_lr,
    facing: 'r',
    timemove: 0.0,
    lastmovevec: { x: 0.0, y: 0.0 } };

var mapobjects = new Array();



var interruptEffect = null;
var allowMoveChar = true;
var inConvo = false;

var convoClickCooldown = 10;

var gamemode = {
    "loadingmap": 0,
    "inovermap": 1,
    "initgame": 2
}

var gamestate = {
    levelid: 0,
    currentGameMode: gamemode["initgame"],
    levelstates: {},
    char: {
        kesef: 0,
        numkeys: 0,
        interactableObj: null
    },
    currentConvo: null
};

var gameLoad = {

    areamap: null,
    mapbits: null,
    currentLevelbg: null,

    useImages: {},
    queuedLevels: []
};

const NUM_CACHED_LEVELS = 10;



export { charpos,  mapobjects,
interruptEffect,
allowMoveChar,
inConvo,
convoClickCooldown,
gamemode,
gamestate,
gameLoad,
NUM_CACHED_LEVELS

 };