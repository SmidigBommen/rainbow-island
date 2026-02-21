// Programmatic pixel art sprite generation
// All sprites are drawn to offscreen canvases at native resolution

const spriteCache = {};

function createCanvas(w, h) {
  const c = document.createElement('canvas');
  c.width = w;
  c.height = h;
  return c;
}

function getCtx(canvas) {
  const ctx = canvas.getContext('2d');
  ctx.imageSmoothingEnabled = false;
  return ctx;
}

// Draw pixel data from a 2D array of hex colors (null = transparent)
function drawPixels(ctx, data, offX = 0, offY = 0) {
  for (let y = 0; y < data.length; y++) {
    for (let x = 0; x < data[y].length; x++) {
      if (data[y][x]) {
        ctx.fillStyle = data[y][x];
        ctx.fillRect(offX + x, offY + y, 1, 1);
      }
    }
  }
}

// ====== PLAYER SPRITES ======
const P = {
  skin: '#FFD4A8',
  skinS: '#E0B088',
  hair: '#884422',
  hairH: '#AA5533',
  eye: '#222244',
  eyeW: '#FFFFFF',
  mouth: '#CC6644',
  shirt: '#4488FF',
  shirtS: '#2266CC',
  shirtH: '#66AAFF',
  pants: '#44AA44',
  pantsS: '#228822',
  shoe: '#664422',
  shoeS: '#442200',
  belt: '#DDAA22',
  outline: '#222233',
};

const _ = null;
const o = P.outline;
const s = P.skin;
const d = P.skinS;
const h = P.hair;
const hh = P.hairH;
const e = P.eye;
const ew = P.eyeW;
const m = P.mouth;
const b = P.shirt;
const bs = P.shirtS;
const bh = P.shirtH;
const p = P.pants;
const ps = P.pantsS;
const sh = P.shoe;
const ss = P.shoeS;
const bt = P.belt;

// Player idle frame 1 (16x24)
const playerIdle1 = [
  [_,_,_,_,_,o,o,o,o,o,o,_,_,_,_,_],
  [_,_,_,_,o,h,h,h,h,h,h,o,_,_,_,_],
  [_,_,_,o,h,h,hh,h,h,hh,h,h,o,_,_,_],
  [_,_,_,o,h,h,h,h,h,h,h,h,o,_,_,_],
  [_,_,o,s,s,s,s,s,s,s,s,s,s,o,_,_],
  [_,_,o,s,ew,e,s,s,s,ew,e,s,s,o,_,_],
  [_,_,o,s,s,s,s,d,s,s,s,s,s,o,_,_],
  [_,_,_,o,s,s,s,m,s,s,s,s,o,_,_,_],
  [_,_,_,_,o,o,s,s,s,o,o,_,_,_,_,_],
  [_,_,_,o,b,b,b,b,b,b,b,o,_,_,_,_],
  [_,_,o,b,b,bh,b,b,b,bh,b,b,o,_,_],
  [_,_,o,b,b,b,b,b,b,b,b,b,o,_,_],
  [_,o,bs,b,b,b,b,b,b,b,b,bs,o,_,_],
  [_,o,s,bs,b,b,b,b,b,b,bs,s,o,_,_],
  [_,_,o,s,s,bt,bt,bt,bt,s,s,o,_,_,_],
  [_,_,o,p,p,p,p,p,p,p,p,o,_,_,_,_],
  [_,_,o,p,p,p,p,p,p,p,p,o,_,_,_,_],
  [_,_,o,p,p,ps,o,o,ps,p,p,o,_,_,_],
  [_,_,o,p,p,o,_,_,o,p,p,o,_,_,_,_],
  [_,_,o,ps,p,o,_,_,o,ps,p,o,_,_,_],
  [_,_,o,ps,o,_,_,_,_,o,ps,o,_,_,_],
  [_,_,o,sh,sh,o,_,_,o,sh,sh,o,_,_,_],
  [_,_,o,sh,sh,sh,o,o,sh,sh,sh,o,_,_,_],
  [_,_,_,o,o,o,o,o,o,o,o,o,_,_,_,_],
];

// Player idle frame 2 (slight breathing - shift body down 1px conceptually)
const playerIdle2 = playerIdle1; // Same for simplicity, add subtle change later

// Player run frames
const playerRun1 = [
  [_,_,_,_,_,o,o,o,o,o,o,_,_,_,_,_],
  [_,_,_,_,o,h,h,h,h,h,h,o,_,_,_,_],
  [_,_,_,o,h,h,hh,h,h,hh,h,h,o,_,_,_],
  [_,_,_,o,h,h,h,h,h,h,h,h,o,_,_,_],
  [_,_,o,s,s,s,s,s,s,s,s,s,s,o,_,_],
  [_,_,o,s,ew,e,s,s,s,ew,e,s,s,o,_,_],
  [_,_,o,s,s,s,s,d,s,s,s,s,s,o,_,_],
  [_,_,_,o,s,s,s,m,s,s,s,s,o,_,_,_],
  [_,_,_,_,o,o,s,s,s,o,o,_,_,_,_,_],
  [_,_,_,o,b,b,b,b,b,b,b,o,_,_,_,_],
  [_,_,o,b,b,bh,b,b,b,bh,b,b,o,_,_],
  [_,o,s,b,b,b,b,b,b,b,b,b,s,o,_,_],
  [o,s,s,bs,b,b,b,b,b,b,bs,s,s,o,_],
  [_,o,o,s,bt,bt,bt,bt,bt,s,o,o,_,_,_],
  [_,_,o,p,p,p,p,p,p,p,p,o,_,_,_,_],
  [_,_,o,p,p,p,p,p,p,p,p,o,_,_,_,_],
  [_,_,_,o,p,ps,o,o,ps,p,o,_,_,_,_],
  [_,_,o,ps,p,o,_,o,p,ps,o,_,_,_,_],
  [_,o,sh,sh,o,_,_,_,o,sh,sh,o,_,_,_],
  [_,o,sh,sh,sh,o,_,o,sh,sh,sh,o,_,_],
  [_,_,o,o,o,o,_,_,o,o,o,o,_,_,_,_],
  [_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_],
  [_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_],
  [_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_],
];

const playerRun2 = [
  [_,_,_,_,_,o,o,o,o,o,o,_,_,_,_,_],
  [_,_,_,_,o,h,h,h,h,h,h,o,_,_,_,_],
  [_,_,_,o,h,h,hh,h,h,hh,h,h,o,_,_,_],
  [_,_,_,o,h,h,h,h,h,h,h,h,o,_,_,_],
  [_,_,o,s,s,s,s,s,s,s,s,s,s,o,_,_],
  [_,_,o,s,ew,e,s,s,s,ew,e,s,s,o,_,_],
  [_,_,o,s,s,s,s,d,s,s,s,s,s,o,_,_],
  [_,_,_,o,s,s,s,m,s,s,s,s,o,_,_,_],
  [_,_,_,_,o,o,s,s,s,o,o,_,_,_,_,_],
  [_,_,_,o,b,b,b,b,b,b,b,o,_,_,_,_],
  [_,_,o,b,b,bh,b,b,b,bh,b,b,o,_,_],
  [_,_,o,b,b,b,b,b,b,b,b,b,o,_,_],
  [_,o,s,bs,b,b,b,b,b,b,bs,s,o,_,_],
  [_,o,s,s,bt,bt,bt,bt,bt,s,s,o,_,_],
  [_,_,o,p,p,p,p,p,p,p,p,o,_,_,_,_],
  [_,_,_,o,p,p,p,p,p,p,o,_,_,_,_,_],
  [_,_,_,o,ps,p,o,o,p,ps,o,_,_,_,_],
  [_,_,_,o,ps,o,_,_,o,ps,o,_,_,_,_],
  [_,_,o,sh,sh,o,_,_,_,o,ps,o,_,_,_],
  [_,o,sh,sh,sh,o,_,_,o,sh,sh,o,_,_],
  [_,_,o,o,o,o,_,_,o,sh,sh,sh,o,_,_],
  [_,_,_,_,_,_,_,_,_,o,o,o,o,_,_,_],
  [_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_],
  [_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_],
];

// Player jump frame
const playerJump = [
  [_,_,_,_,_,o,o,o,o,o,o,_,_,_,_,_],
  [_,_,_,_,o,h,h,h,h,h,h,o,_,_,_,_],
  [_,_,_,o,h,h,hh,h,h,hh,h,h,o,_,_,_],
  [_,_,_,o,h,h,h,h,h,h,h,h,o,_,_,_],
  [_,_,o,s,s,s,s,s,s,s,s,s,s,o,_,_],
  [_,_,o,s,ew,e,s,s,s,ew,e,s,s,o,_,_],
  [_,_,o,s,s,s,s,d,s,s,s,s,s,o,_,_],
  [_,_,_,o,s,s,s,s,s,s,s,s,o,_,_,_],
  [_,o,s,s,o,o,s,s,s,o,o,s,s,o,_,_],
  [o,s,s,o,b,b,b,b,b,b,b,o,s,s,o,_],
  [_,o,o,b,b,bh,b,b,b,bh,b,b,o,o,_],
  [_,_,o,b,b,b,b,b,b,b,b,b,o,_,_],
  [_,_,o,bs,b,b,b,b,b,b,bs,o,_,_,_],
  [_,_,_,o,bt,bt,bt,bt,bt,o,_,_,_,_],
  [_,_,o,p,p,p,p,p,p,p,p,o,_,_,_,_],
  [_,_,o,p,p,p,o,o,p,p,p,o,_,_,_,_],
  [_,_,o,ps,o,o,_,_,o,o,ps,o,_,_,_],
  [_,_,o,o,_,_,_,_,_,_,o,o,_,_,_,_],
  [_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_],
  [_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_],
  [_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_],
  [_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_],
  [_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_],
  [_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_],
];

// Player fall frame
const playerFall = [
  [_,_,_,_,_,o,o,o,o,o,o,_,_,_,_,_],
  [_,_,_,_,o,h,h,h,h,h,h,o,_,_,_,_],
  [_,_,_,o,h,h,hh,h,h,hh,h,h,o,_,_,_],
  [_,_,_,o,h,h,h,h,h,h,h,h,o,_,_,_],
  [_,_,o,s,s,s,s,s,s,s,s,s,s,o,_,_],
  [_,_,o,s,ew,e,s,s,s,ew,e,s,s,o,_,_],
  [_,_,o,s,s,s,s,d,s,s,s,s,s,o,_,_],
  [_,_,_,o,s,s,s,s,m,s,s,s,o,_,_,_],
  [_,_,_,_,o,o,s,s,s,o,o,_,_,_,_,_],
  [_,o,s,o,b,b,b,b,b,b,b,o,s,o,_,_],
  [o,s,s,b,b,bh,b,b,b,bh,b,s,s,o,_],
  [_,o,o,b,b,b,b,b,b,b,b,b,o,o,_],
  [_,_,o,bs,b,b,b,b,b,b,bs,o,_,_,_],
  [_,_,_,o,bt,bt,bt,bt,bt,o,_,_,_,_],
  [_,_,o,p,p,p,p,p,p,p,p,o,_,_,_,_],
  [_,_,o,p,p,ps,o,o,ps,p,p,o,_,_,_],
  [_,_,_,o,o,o,_,_,o,o,o,_,_,_,_,_],
  [_,_,o,sh,sh,o,_,_,o,sh,sh,o,_,_,_],
  [_,o,sh,sh,sh,o,_,o,sh,sh,sh,o,_,_],
  [_,_,o,o,o,o,_,_,o,o,o,o,_,_,_,_],
  [_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_],
  [_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_],
  [_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_],
  [_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_],
];

// Player shoot frame (arm extended forward)
const playerShoot = [
  [_,_,_,_,_,o,o,o,o,o,o,_,_,_,_,_],
  [_,_,_,_,o,h,h,h,h,h,h,o,_,_,_,_],
  [_,_,_,o,h,h,hh,h,h,hh,h,h,o,_,_,_],
  [_,_,_,o,h,h,h,h,h,h,h,h,o,_,_,_],
  [_,_,o,s,s,s,s,s,s,s,s,s,s,o,_,_],
  [_,_,o,s,ew,e,s,s,s,ew,e,s,s,o,_,_],
  [_,_,o,s,s,s,s,d,s,s,s,s,s,o,_,_],
  [_,_,_,o,s,s,s,m,s,s,s,s,o,_,_,_],
  [_,_,_,_,o,o,s,s,s,o,o,_,_,_,_,_],
  [_,_,_,o,b,b,b,b,b,b,b,o,_,_,_,_],
  [_,_,o,b,b,bh,b,b,b,bh,b,b,o,s,o],
  [_,_,o,b,b,b,b,b,b,b,b,b,o,s,o],
  [_,_,o,bs,b,b,b,b,b,b,bs,s,s,s,o],
  [_,_,_,o,s,bt,bt,bt,bt,s,o,o,o,_,_],
  [_,_,o,p,p,p,p,p,p,p,p,o,_,_,_,_],
  [_,_,o,p,p,p,p,p,p,p,p,o,_,_,_,_],
  [_,_,o,p,p,ps,o,o,ps,p,p,o,_,_,_],
  [_,_,o,p,p,o,_,_,o,p,p,o,_,_,_,_],
  [_,_,o,ps,p,o,_,_,o,ps,p,o,_,_,_],
  [_,_,o,ps,o,_,_,_,_,o,ps,o,_,_,_],
  [_,_,o,sh,sh,o,_,_,o,sh,sh,o,_,_,_],
  [_,_,o,sh,sh,sh,o,o,sh,sh,sh,o,_,_,_],
  [_,_,_,o,o,o,o,o,o,o,o,o,_,_,_,_],
  [_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_],
];

function makePlayerSprites() {
  const frames = {
    idle: [playerIdle1, playerIdle2],
    run: [playerRun1, playerRun2, playerIdle1, playerRun2], // 4-frame run cycle
    jump: [playerJump],
    fall: [playerFall],
    shoot: [playerShoot],
  };

  const result = {};
  for (const [name, frameList] of Object.entries(frames)) {
    result[name] = frameList.map(data => {
      const c = createCanvas(16, 24);
      const ctx = getCtx(c);
      drawPixels(ctx, data);
      return c;
    });
  }
  return result;
}

// ====== ENEMY SPRITES ======
function makeEnemySprite(bodyColor, bodyDark, eyeColor, type) {
  const frames = [];
  const bc = bodyColor;
  const bd = bodyDark;
  const ec = eyeColor;

  if (type === 'walker') {
    // Caterpillar-like enemy
    const f1 = [
      [_,_,_,_,o,o,o,o,o,o,o,o,_,_,_,_],
      [_,_,_,o,bc,bc,bc,bc,bc,bc,bc,bc,o,_,_,_],
      [_,_,o,bc,bc,bc,bc,bc,bc,bc,bc,bc,bc,o,_,_],
      [_,o,bc,bc,ew,ec,bc,bc,bc,ew,ec,bc,bc,o,_,_],
      [_,o,bc,bc,ew,ec,bc,bc,bc,ew,ec,bc,bc,o,_,_],
      [_,o,bc,bc,bc,bc,bc,bc,bc,bc,bc,bc,bc,o,_,_],
      [_,o,bc,bc,bc,bd,bd,bd,bd,bc,bc,bc,bc,o,_,_],
      [_,_,o,bc,bc,bc,bc,bc,bc,bc,bc,bc,o,_,_,_],
      [_,_,o,bd,bc,bd,bc,bc,bd,bc,bd,o,_,_,_,_],
      [_,_,o,bd,bc,bd,bc,bc,bd,bc,bd,o,_,_,_,_],
      [_,_,_,o,bc,bc,bc,bc,bc,bc,o,_,_,_,_,_],
      [_,_,_,o,bd,bd,o,o,bd,bd,o,_,_,_,_,_],
      [_,_,o,bd,bd,o,_,_,o,bd,bd,o,_,_,_,_],
      [_,_,_,o,o,_,_,_,_,o,o,_,_,_,_,_],
      [_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_],
      [_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_],
    ];
    const c1 = createCanvas(16, 16);
    drawPixels(getCtx(c1), f1);
    frames.push(c1, c1);
  } else if (type === 'flyer') {
    // Bee-like enemy
    const f1 = [
      [_,_,_,_,_,_,o,o,o,o,_,_,_,_,_,_],
      [_,_,_,_,o,o,bc,bc,bc,bc,o,o,_,_,_,_],
      [_,_,_,o,bc,bc,bc,bc,bc,bc,bc,bc,o,_,_,_],
      [_,_,o,bc,ew,ec,bc,bc,ew,ec,bc,bc,o,_,_,_],
      [_,_,o,bc,bc,bc,bc,bc,bc,bc,bc,bc,o,_,_,_],
      [_,o,bd,bc,bc,bd,bd,bd,bd,bc,bc,bd,o,_,_,_],
      [o,bd,bd,bc,bc,bc,bc,bc,bc,bc,bc,bd,bd,o,_,_],
      [o,bd,bd,bd,bc,bd,bd,bd,bd,bc,bd,bd,bd,o,_,_],
      [_,o,o,bd,bc,bc,bc,bc,bc,bc,bd,o,o,_,_,_],
      [_,_,_,o,bd,bd,bd,bd,bd,bd,o,_,_,_,_,_],
      [_,_,_,_,o,o,o,o,o,o,o,_,_,_,_,_],
      [_,_,_,_,_,_,o,_,o,_,_,_,_,_,_,_],
      [_,_,_,_,_,_,_,o,_,_,_,_,_,_,_,_],
      [_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_],
      [_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_],
      [_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_],
    ];
    const c1 = createCanvas(16, 16);
    drawPixels(getCtx(c1), f1);
    frames.push(c1, c1);
  } else if (type === 'jumper') {
    // Frog-like enemy
    const f1 = [
      [_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_],
      [_,_,_,o,o,o,_,_,_,o,o,o,_,_,_,_],
      [_,_,o,ew,ec,o,_,_,o,ew,ec,o,_,_,_,_],
      [_,_,o,ew,ec,o,o,o,o,ew,ec,o,_,_,_,_],
      [_,o,bc,bc,bc,bc,bc,bc,bc,bc,bc,bc,o,_,_,_],
      [_,o,bc,bc,bc,bc,bc,bc,bc,bc,bc,bc,o,_,_,_],
      [o,bc,bc,bc,bc,bc,bc,bc,bc,bc,bc,bc,bc,o,_,_],
      [o,bc,bc,bc,bd,bd,bd,bd,bd,bc,bc,bc,bc,o,_,_],
      [o,bc,bc,bc,bc,bc,bc,bc,bc,bc,bc,bc,bc,o,_,_],
      [_,o,bd,bc,bc,bc,bc,bc,bc,bc,bc,bd,o,_,_,_],
      [_,_,o,bd,bd,bc,bc,bc,bc,bd,bd,o,_,_,_,_],
      [_,o,o,o,o,bd,bd,bd,bd,o,o,o,o,_,_,_],
      [_,o,bd,bd,o,o,_,_,o,o,bd,bd,o,_,_,_],
      [_,_,o,o,o,_,_,_,_,_,o,o,o,_,_,_],
      [_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_],
      [_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_],
    ];
    const c1 = createCanvas(16, 16);
    drawPixels(getCtx(c1), f1);
    frames.push(c1, c1);
  } else if (type === 'shooter') {
    // Turret-like enemy
    const f1 = [
      [_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_],
      [_,_,_,_,o,o,o,o,o,o,o,o,_,_,_,_],
      [_,_,_,o,bc,bc,bc,bc,bc,bc,bc,bc,o,_,_,_],
      [_,_,o,bc,bc,bc,bc,bc,bc,bc,bc,bc,bc,o,_,_],
      [_,_,o,bc,ew,ec,ec,bc,ew,ec,ec,bc,bc,o,_,_],
      [_,_,o,bc,ew,ec,ec,bc,ew,ec,ec,bc,bc,o,_,_],
      [_,_,o,bc,bc,bc,bc,bc,bc,bc,bc,bc,bc,o,_,_],
      [_,_,o,bd,bc,bc,bd,bd,bd,bc,bc,bd,o,_,_,_],
      [_,_,o,bd,bd,bd,bd,bd,bd,bd,bd,bd,o,_,_,_],
      [_,o,bd,bd,bd,bd,bd,bd,bd,bd,bd,bd,bd,o,_,_],
      [_,o,bd,bd,bd,bd,bd,bd,bd,bd,bd,bd,bd,o,_,_],
      [o,bd,bd,bd,bd,bd,bd,bd,bd,bd,bd,bd,bd,bd,o,_],
      [o,bd,bd,bd,bd,bd,bd,bd,bd,bd,bd,bd,bd,bd,o,_],
      [o,o,o,o,o,o,o,o,o,o,o,o,o,o,o,_],
      [_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_],
      [_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_],
    ];
    const c1 = createCanvas(16, 16);
    drawPixels(getCtx(c1), f1);
    frames.push(c1, c1);
  }

  return frames;
}

// ====== TILE SPRITES ======
function makeTileSprites() {
  const tiles = {};

  // Solid ground
  const solid = createCanvas(16, 16);
  const sctx = getCtx(solid);
  sctx.fillStyle = '#996633';
  sctx.fillRect(0, 0, 16, 16);
  sctx.fillStyle = '#885522';
  // Add some texture
  for (let i = 0; i < 8; i++) {
    const x = (i * 5 + 3) % 16;
    const y = (i * 7 + 2) % 16;
    sctx.fillRect(x, y, 2, 2);
  }
  sctx.fillStyle = '#AA7744';
  for (let i = 0; i < 5; i++) {
    const x = (i * 7 + 1) % 16;
    const y = (i * 3 + 5) % 16;
    sctx.fillRect(x, y, 1, 1);
  }
  tiles.solid = solid;

  // Grass-topped ground
  const grass = createCanvas(16, 16);
  const gctx = getCtx(grass);
  // Dirt base
  gctx.fillStyle = '#996633';
  gctx.fillRect(0, 3, 16, 13);
  gctx.fillStyle = '#885522';
  for (let i = 0; i < 6; i++) {
    const x = (i * 5 + 3) % 16;
    const y = (i * 3 + 5) % 13 + 3;
    gctx.fillRect(x, y, 2, 2);
  }
  // Grass top
  gctx.fillStyle = '#55BB55';
  gctx.fillRect(0, 0, 16, 3);
  gctx.fillStyle = '#44AA44';
  gctx.fillRect(0, 2, 16, 1);
  gctx.fillStyle = '#66CC66';
  gctx.fillRect(1, 0, 2, 1);
  gctx.fillRect(6, 0, 3, 1);
  gctx.fillRect(12, 0, 2, 1);
  // Grass blades
  gctx.fillStyle = '#66CC66';
  gctx.fillRect(2, -1, 1, 2);
  gctx.fillRect(7, -1, 1, 2);
  gctx.fillRect(13, -1, 1, 2);
  tiles.grass = grass;

  // One-way platform
  const platform = createCanvas(16, 16);
  const pctx = getCtx(platform);
  pctx.fillStyle = '#CC8844';
  pctx.fillRect(0, 0, 16, 6);
  pctx.fillStyle = '#AA6622';
  pctx.fillRect(0, 4, 16, 2);
  pctx.fillStyle = '#DDA855';
  pctx.fillRect(1, 1, 4, 2);
  pctx.fillRect(8, 1, 5, 2);
  // Bolts
  pctx.fillStyle = '#888888';
  pctx.fillRect(0, 1, 1, 3);
  pctx.fillRect(7, 1, 1, 3);
  pctx.fillRect(15, 1, 1, 3);
  tiles.platform = platform;

  return tiles;
}

// ====== ITEM SPRITES ======
function makeItemSprites() {
  const items = {};

  // Apple
  items.apple = makeSimpleItem('#FF3333', '#CC0000', '#44AA44', 'round');
  // Cherry
  items.cherry = makeSimpleItem('#FF2255', '#CC0033', '#44AA44', 'cherry');
  // Melon
  items.melon = makeSimpleItem('#44CC44', '#228822', '#338833', 'round');
  // Diamond (generated per color)
  items.diamond = makeDiamondSprite('#66EEFF', '#33BBDD');
  // Speed shoe
  items.shoe = makeShoeSprite();
  // Rainbow potion
  items.potion = makePotionSprite();
  // Star
  items.star = makeStarSprite();
  // Heart (1UP)
  items.heart = makeHeartSprite();

  return items;
}

function makeSimpleItem(color, dark, stemColor, shape) {
  const c = createCanvas(12, 12);
  const ctx = getCtx(c);
  const o = '#222233';

  if (shape === 'round') {
    ctx.fillStyle = o;
    ctx.fillRect(3, 1, 6, 1);
    ctx.fillRect(2, 2, 8, 1);
    ctx.fillRect(1, 3, 10, 6);
    ctx.fillRect(2, 9, 8, 1);
    ctx.fillRect(3, 10, 6, 1);

    ctx.fillStyle = color;
    ctx.fillRect(3, 2, 6, 1);
    ctx.fillRect(2, 3, 8, 5);
    ctx.fillRect(3, 8, 6, 2);

    ctx.fillStyle = dark;
    ctx.fillRect(5, 7, 4, 2);
    ctx.fillRect(6, 6, 3, 1);

    // Highlight
    ctx.fillStyle = '#FFFFFF';
    ctx.fillRect(3, 3, 2, 1);
    ctx.fillRect(3, 4, 1, 1);

    // Stem
    ctx.fillStyle = stemColor;
    ctx.fillRect(5, 0, 2, 2);
  } else if (shape === 'cherry') {
    // Two small circles with stems
    ctx.fillStyle = stemColor;
    ctx.fillRect(5, 0, 1, 4);
    ctx.fillRect(6, 0, 1, 3);
    ctx.fillRect(7, 1, 1, 3);
    ctx.fillStyle = o;
    ctx.fillRect(2, 4, 4, 1);
    ctx.fillRect(1, 5, 6, 4);
    ctx.fillRect(2, 9, 4, 1);
    ctx.fillRect(6, 5, 4, 1);
    ctx.fillRect(5, 6, 6, 4);
    ctx.fillRect(6, 10, 4, 1);
    ctx.fillStyle = color;
    ctx.fillRect(2, 5, 4, 3);
    ctx.fillRect(3, 8, 2, 1);
    ctx.fillRect(6, 6, 4, 3);
    ctx.fillRect(7, 9, 2, 1);
    ctx.fillStyle = '#FFFFFF';
    ctx.fillRect(2, 5, 1, 1);
    ctx.fillRect(7, 6, 1, 1);
  }
  return c;
}

function makeDiamondSprite(color, dark) {
  const c = createCanvas(12, 12);
  const ctx = getCtx(c);
  const o = '#222233';
  // Diamond shape
  ctx.fillStyle = o;
  ctx.fillRect(5, 0, 2, 1);
  ctx.fillRect(4, 1, 4, 1);
  ctx.fillRect(3, 2, 6, 1);
  ctx.fillRect(2, 3, 8, 1);
  ctx.fillRect(1, 4, 10, 1);
  ctx.fillRect(0, 5, 12, 1);
  ctx.fillRect(1, 6, 10, 1);
  ctx.fillRect(2, 7, 8, 1);
  ctx.fillRect(3, 8, 6, 1);
  ctx.fillRect(4, 9, 4, 1);
  ctx.fillRect(5, 10, 2, 1);

  ctx.fillStyle = color;
  ctx.fillRect(5, 1, 2, 1);
  ctx.fillRect(4, 2, 4, 1);
  ctx.fillRect(3, 3, 6, 1);
  ctx.fillRect(2, 4, 8, 1);
  ctx.fillRect(1, 5, 10, 1);
  ctx.fillRect(2, 6, 8, 1);
  ctx.fillRect(3, 7, 6, 1);
  ctx.fillRect(4, 8, 4, 1);
  ctx.fillRect(5, 9, 2, 1);

  ctx.fillStyle = dark;
  ctx.fillRect(6, 5, 5, 1);
  ctx.fillRect(6, 6, 4, 1);
  ctx.fillRect(6, 7, 3, 1);
  ctx.fillRect(6, 8, 2, 1);
  ctx.fillRect(6, 9, 1, 1);

  ctx.fillStyle = '#FFFFFF';
  ctx.fillRect(4, 3, 1, 1);
  ctx.fillRect(3, 4, 2, 1);
  ctx.fillRect(2, 5, 1, 1);
  return c;
}

function makeShoeSprite() {
  const c = createCanvas(12, 12);
  const ctx = getCtx(c);
  const o = '#222233';
  ctx.fillStyle = o;
  ctx.fillRect(3, 2, 4, 1);
  ctx.fillRect(2, 3, 5, 5);
  ctx.fillRect(1, 8, 10, 3);
  ctx.fillRect(0, 9, 12, 2);
  ctx.fillStyle = '#DD4444';
  ctx.fillRect(3, 3, 3, 1);
  ctx.fillRect(3, 4, 3, 3);
  ctx.fillRect(2, 8, 8, 1);
  ctx.fillRect(1, 9, 9, 1);
  ctx.fillStyle = '#FFFFFF';
  ctx.fillRect(1, 10, 10, 1);
  ctx.fillStyle = '#EEEEEE';
  ctx.fillRect(4, 4, 1, 1);
  return c;
}

function makePotionSprite() {
  const c = createCanvas(12, 12);
  const ctx = getCtx(c);
  const o = '#222233';
  // Bottle shape
  ctx.fillStyle = o;
  ctx.fillRect(4, 0, 4, 1);
  ctx.fillRect(5, 1, 2, 2);
  ctx.fillRect(3, 3, 6, 1);
  ctx.fillRect(2, 4, 8, 6);
  ctx.fillRect(3, 10, 6, 1);
  // Fill
  ctx.fillStyle = '#AA88FF';
  ctx.fillRect(3, 4, 6, 5);
  ctx.fillRect(4, 9, 4, 1);
  ctx.fillStyle = '#8866DD';
  ctx.fillRect(3, 7, 6, 2);
  ctx.fillRect(4, 9, 4, 1);
  // Cork
  ctx.fillStyle = '#CC8844';
  ctx.fillRect(5, 1, 2, 2);
  // Highlight
  ctx.fillStyle = '#CCAAFF';
  ctx.fillRect(3, 4, 1, 2);
  return c;
}

function makeStarSprite() {
  const c = createCanvas(12, 12);
  const ctx = getCtx(c);
  ctx.fillStyle = '#FFD700';
  ctx.fillRect(5, 0, 2, 3);
  ctx.fillRect(0, 3, 12, 3);
  ctx.fillRect(1, 6, 10, 1);
  ctx.fillRect(2, 7, 3, 2);
  ctx.fillRect(7, 7, 3, 2);
  ctx.fillRect(3, 9, 2, 2);
  ctx.fillRect(7, 9, 2, 2);
  ctx.fillStyle = '#FFEE66';
  ctx.fillRect(5, 1, 2, 2);
  ctx.fillRect(3, 3, 6, 2);
  ctx.fillRect(4, 5, 4, 1);
  ctx.fillStyle = '#222233';
  ctx.fillRect(5, 4, 1, 1);
  ctx.fillRect(7, 4, 1, 1);
  return c;
}

function makeHeartSprite() {
  const c = createCanvas(12, 12);
  const ctx = getCtx(c);
  const o = '#222233';
  ctx.fillStyle = o;
  ctx.fillRect(1, 1, 4, 1);
  ctx.fillRect(7, 1, 4, 1);
  ctx.fillRect(0, 2, 6, 1);
  ctx.fillRect(6, 2, 6, 1);
  ctx.fillRect(0, 3, 12, 4);
  ctx.fillRect(1, 7, 10, 1);
  ctx.fillRect(2, 8, 8, 1);
  ctx.fillRect(3, 9, 6, 1);
  ctx.fillRect(4, 10, 4, 1);
  ctx.fillRect(5, 11, 2, 1);

  ctx.fillStyle = '#FF4466';
  ctx.fillRect(1, 2, 4, 1);
  ctx.fillRect(7, 2, 4, 1);
  ctx.fillRect(1, 3, 10, 3);
  ctx.fillRect(2, 6, 8, 1);
  ctx.fillRect(2, 7, 8, 1);
  ctx.fillRect(3, 8, 6, 1);
  ctx.fillRect(4, 9, 4, 1);
  ctx.fillRect(5, 10, 2, 1);

  ctx.fillStyle = '#FF8899';
  ctx.fillRect(2, 2, 2, 2);
  return c;
}

// ====== PROJECTILE SPRITE ======
function makeProjectileSprite() {
  const c = createCanvas(6, 6);
  const ctx = getCtx(c);
  ctx.fillStyle = '#FF4400';
  ctx.fillRect(1, 0, 4, 1);
  ctx.fillRect(0, 1, 6, 4);
  ctx.fillRect(1, 5, 4, 1);
  ctx.fillStyle = '#FFAA00';
  ctx.fillRect(1, 1, 4, 3);
  ctx.fillStyle = '#FFDD44';
  ctx.fillRect(2, 2, 2, 1);
  return c;
}

// ====== MAIN EXPORT ======
let allSprites = null;

export function generateAllSprites() {
  if (allSprites) return allSprites;

  allSprites = {
    player: makePlayerSprites(),
    enemies: {
      walker: makeEnemySprite('#44BB44', '#228822', '#FF2222', 'walker'),
      flyer: makeEnemySprite('#FFCC00', '#CC9900', '#222222', 'flyer'),
      jumper: makeEnemySprite('#4488FF', '#2255CC', '#FF4444', 'jumper'),
      shooter: makeEnemySprite('#AA44CC', '#7722AA', '#FFFF00', 'shooter'),
    },
    tiles: makeTileSprites(),
    items: makeItemSprites(),
    projectile: makeProjectileSprite(),
  };

  return allSprites;
}

export function getSprites() {
  return allSprites;
}
