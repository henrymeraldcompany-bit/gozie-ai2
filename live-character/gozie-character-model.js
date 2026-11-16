/**
 * Gozie AI mouthless full-body character model.
 * Procedural Three.js model, kept modular for the later Live Character screen.
 * Front faces +Z; up is +Y. No mouth mesh or mouth animation is created.
 */
export const GOZIE_CHARACTER_MODEL_VERSION = "1.0.0";

export function createGozieCharacter(THREE, options = {}) {
  if (!THREE || !THREE.Group || !THREE.Mesh) throw new TypeError("A Three.js namespace is required.");
  const root = new THREE.Group();
  root.name = "GozieCharacterRoot";
  root.userData.gozieModel = { name: "Gozie AI", version: GOZIE_CHARACTER_MODEL_VERSION, mouthless: true, animationReady: true, frontDirection: "+Z" };

  const mats = {
    white: new THREE.MeshStandardMaterial({ color: "#fbfbf8", roughness: .42, metalness: .12 }),
    whiteBright: new THREE.MeshStandardMaterial({ color: "#ffffff", roughness: .34, metalness: .15 }),
    dark: new THREE.MeshStandardMaterial({ color: "#20242c", roughness: .27, metalness: .25 }),
    joint: new THREE.MeshStandardMaterial({ color: "#58616d", roughness: .4, metalness: .36 }),
    gold: new THREE.MeshStandardMaterial({ color: "#e7c46a", roughness: .27, metalness: .7 }),
    accent: new THREE.MeshStandardMaterial({ color: "#4aa8ff", emissive: "#4aa8ff", emissiveIntensity: .48, metalness: .18, roughness: .22 }),
    glow: new THREE.MeshBasicMaterial({ color: "#4aa8ff", transparent: true, opacity: .23, depthWrite: false }),
    visor: new THREE.MeshPhysicalMaterial({ color: "#080d16", roughness: .16, metalness: .28, clearcoat: 1 }),
    eye: new THREE.MeshBasicMaterial({ color: "#e7faff" }),
    sole: new THREE.MeshStandardMaterial({ color: "#343b46", roughness: .5 })
  };
  const parts = {};
  const group = (parent, name, pos = [0,0,0]) => {
    const g = new THREE.Group(); g.name = name; g.position.set(...pos); parent.add(g); return g;
  };
  const mesh = (parent, name, geo, mat, pos = [0,0,0], scale = [1,1,1]) => {
    const m = new THREE.Mesh(geo, mat); m.name = name; m.position.set(...pos); m.scale.set(...scale);
    m.castShadow = true; m.receiveShadow = true; parent.add(m); return m;
  };
  const ball = (p,n,mat,pos,scale) => mesh(p,n,new THREE.SphereGeometry(1,24,18),mat,pos,scale);
  const block = (p,n,mat,pos,size) => mesh(p,n,new THREE.BoxGeometry(...size),mat,pos);
  const tube = (p,n,mat,pos,r,t,rot=[0,0,0],scale=[1,1,1]) => {
    const m = mesh(p,n,new THREE.TorusGeometry(r,t,10,48),mat,pos,scale); m.rotation.set(...rot); return m;
  };
  const capsule = (p,n,mat,pos,r,len) => mesh(p,n,THREE.CapsuleGeometry
    ? new THREE.CapsuleGeometry(r,len,4,10) : new THREE.CylinderGeometry(r,r,len+r*2,14),mat,pos);
  const shapeMesh = (p,n,shape,mat,pos,depth=.045) => mesh(p,n,new THREE.ExtrudeGeometry(shape,{depth,bevelEnabled:true,bevelSegments:2,bevelSize:.012,bevelThickness:.012}),mat,pos);

  // Hips, articulated legs, boots, and coat tails.
  const hips = group(root,"Hips",[0,1.12,0]); parts.hips = hips;
  ball(hips,"HipShell",mats.white,[0,0,0],[.36,.24,.24]);
  const legs = {};
  for (const side of [-1,1]) {
    const label = side < 0 ? "Left" : "Right";
    const thigh = group(hips,label+"ThighPivot",[side*.19,-.08,0]);
    capsule(thigh,label+"UpperLeg",mats.white,[0,-.17,0],.13,.25);
    ball(thigh,label+"KneeShell",mats.whiteBright,[0,-.37,.045],[.14,.13,.11]);
    block(thigh,label+"KneeAccent",mats.accent,[0,-.39,.145],[.1,.022,.018]);
    const knee = group(thigh,label+"KneePivot",[0,-.42,0]);
    capsule(knee,label+"Shin",mats.white,[0,-.2,0],.12,.28);
    ball(knee,label+"Ankle",mats.joint,[0,-.39,0],[.09,.085,.09]);
    const foot = group(knee,label+"FootPivot",[0,-.44,.06]);
    ball(foot,label+"Boot",mats.whiteBright,[0,-.045,.1],[.16,.12,.27]);
    block(foot,label+"BootSole",mats.sole,[0,-.14,.12],[.3,.05,.43]);
    block(foot,label+"BootAccent",mats.accent,[0,-.11,.31],[.15,.018,.018]);
    legs[label.toLowerCase()] = { thigh, knee, foot };
  }
  parts.legs = legs;
  const coat = group(hips,"CoatSkirt");
  const panel = new THREE.Shape();
  panel.moveTo(-.2,.14); panel.bezierCurveTo(-.27,-.1,-.38,-.35,-.42,-.57);
  panel.quadraticCurveTo(0,-.68,.42,-.57); panel.bezierCurveTo(.38,-.35,.27,-.1,.2,.14); panel.closePath();
  shapeMesh(coat,"BackCoatPanel",panel,mats.white,[0,-.12,-.19],.07);
  for (const side of [-1,1]) {
    const tail = new THREE.Shape();
    tail.moveTo(0,.12); tail.lineTo(side*.18,.02); tail.lineTo(side*.32,-.52);
    tail.quadraticCurveTo(side*.16,-.62,side*.03,-.54); tail.lineTo(-side*.05,-.08); tail.closePath();
    shapeMesh(coat,side < 0 ? "LeftCoatTail" : "RightCoatTail",tail,mats.whiteBright,[side*.15,-.12,.22],.055);
    block(coat,side < 0 ? "LeftGoldHem" : "RightGoldHem",mats.gold,[side*.31,-.67,.25],[.11,.02,.04]);
  }
  parts.coat = coat;

  // Torso, glowing infinity emblem, belt, and gold buckle.
  const torso = group(root,"Torso",[0,1.65,0]); parts.torso = torso;
  ball(torso,"TorsoArmor",mats.white,[0,0,0],[.39,.46,.27]);
  ball(torso,"ChestPlate",mats.whiteBright,[0,.08,.19],[.33,.29,.12]);
  block(torso,"ChestDarkPanel",mats.dark,[0,-.025,.30],[.27,.2,.035]);
  tube(torso,"InfinityLeftLoop",mats.accent,[-.07,-.02,.335],.073,.018,[0,0,0],[1,.78,1]);
  tube(torso,"InfinityRightLoop",mats.accent,[.07,-.02,.335],.073,.018,[0,0,0],[1,.78,1]);
  ball(torso,"InfinityGlow",mats.glow,[0,-.02,.325],[.19,.11,.025]);
  block(torso,"WaistBelt",mats.dark,[0,-.34,.02],[.62,.13,.48]);
  const buckle = mesh(torso,"GoldDiamondBuckle",new THREE.OctahedronGeometry(.115),mats.gold,[0,-.34,.29],[1,1,.42]);
  buckle.rotation.z = Math.PI/4;
  block(torso,"BuckleAccent",mats.accent,[0,-.34,.34],[.05,.05,.018]);

  // Neck scarf and separately pivoted arms.
  const neck = group(root,"NeckAndScarf",[0,2.05,0]); parts.neck = neck;
  ball(neck,"NeckJoint",mats.joint,[0,.02,0],[.16,.16,.16]);
  ball(neck,"WhiteScarf",mats.whiteBright,[0,-.06,.025],[.42,.18,.3]);
  ball(neck,"ScarfFrontFold",mats.white,[0,-.13,.23],[.25,.09,.11]);
  const arms = {};
  for (const side of [-1,1]) {
    const label = side < 0 ? "Left" : "Right";
    const shoulder = group(torso,label+"ShoulderPivot",[side*.42,.28,0]);
    ball(shoulder,label+"ShoulderShell",mats.white,[0,0,0],[.18,.19,.18]);
    tube(shoulder,label+"ShoulderGoldRing",mats.gold,[0,.015,.01],.16,.017,[Math.PI/2,0,0]);
    capsule(shoulder,label+"UpperArm",mats.white,[0,-.22,.01],.115,.26);
    ball(shoulder,label+"ElbowJoint",mats.joint,[0,-.4,.01],[.1,.1,.1]);
    const elbow = group(shoulder,label+"ElbowPivot",[0,-.42,.01]);
    capsule(elbow,label+"Forearm",mats.whiteBright,[0,-.19,.02],.12,.27);
    ball(elbow,label+"WristJoint",mats.joint,[0,-.37,.03],[.08,.08,.08]);
    const hand = group(elbow,label+"HandPivot",[0,-.42,.04]);
    ball(hand,label+"Hand",mats.white,[0,-.05,.04],[.1,.12,.09]);
    capsule(hand,label+"Thumb",mats.white,[side*-.08,-.07,.08],.04,.07);
    arms[label.toLowerCase()] = { shoulder, elbow, hand };
  }
  parts.arms = arms;

  // Helmet and featureless black screen: two glowing eyes, deliberately no mouth.
  const head = group(root,"HeadPivot",[0,2.62,0]); parts.head = head;
  ball(head,"HelmetShell",mats.whiteBright,[0,0,0],[.6,.55,.5]);
  ball(head,"FaceGlassVisor",mats.visor,[0,-.025,.42],[.455,.39,.13]);
  for (const side of [-1,1]) {
    const x = side*.185;
    ball(head,side < 0 ? "LeftEyeGlow" : "RightEyeGlow",mats.glow,[x,-.03,.545],[.11,.16,.03]);
    ball(head,side < 0 ? "LeftEye" : "RightEye",mats.eye,[x,-.03,.57],[.068,.115,.025]);
  }
  const star = new THREE.Shape();
  for (let i=0;i<8;i++) { const r=i%2===0?.14:.05, a=Math.PI*i/4-Math.PI/2, x=Math.cos(a)*r, y=Math.sin(a)*r; i===0?star.moveTo(x,y):star.lineTo(x,y); }
  star.closePath();
  const forehead = shapeMesh(head,"ForeheadAccentStar",star,mats.accent,[0,.245,.55],.025); forehead.rotation.z=Math.PI/4;
  ball(head,"ForeheadGlow",mats.glow,[0,.245,.545],[.18,.18,.025]);

  // Swept fringe and side locks.
  const fringe = new THREE.Shape();
  fringe.moveTo(-.47,.2); fringe.bezierCurveTo(-.45,.45,-.12,.5,.07,.4);
  fringe.bezierCurveTo(.28,.32,.4,.16,.38,.01); fringe.bezierCurveTo(.18,.16,.04,.14,-.08,.02);
  fringe.bezierCurveTo(-.2,-.1,-.31,-.1,-.47,.2); fringe.closePath();
  shapeMesh(head,"WhiteSweptFringe",fringe,mats.whiteBright,[0,.28,.46],.12);
  for (const side of [-1,1]) {
    const lock = new THREE.Shape();
    lock.moveTo(0,.14); lock.bezierCurveTo(side*-.2,.3,side*-.47,.13,side*-.53,-.08);
    lock.bezierCurveTo(side*-.4,.01,side*-.29,-.04,side*-.23,-.19);
    lock.bezierCurveTo(side*-.15,-.08,side*-.07,.04,0,.14); lock.closePath();
    shapeMesh(head,side < 0 ? "LeftHairLock" : "RightHairLock",lock,mats.white,[side*.02,.18,.41],.085);
  }

  // Headphones and halo ornament.
  for (const side of [-1,1]) {
    const cup = group(head,side < 0 ? "LeftHeadphone" : "RightHeadphone",[side*.56,-.03,.015]);
    ball(cup,"Cushion",mats.joint,[0,0,0],[.13,.28,.23]);
    ball(cup,"WhiteEarCup",mats.whiteBright,[side*.03,0,.02],[.11,.26,.21]);
    tube(cup,"AccentRing",mats.accent,[side*.11,0,.02],.19,.017,[0,Math.PI/2,0],[1,1.2,1]);
    block(cup,"GoldEarMark",mats.gold,[side*.12,-.04,.01],[.02,.08,.03]);
  }
  const halo = group(head,"HaloOrnament",[0,.12,-.34]); parts.halo = halo;
  tube(halo,"HaloMainRing",mats.gold,[0,0,0],.76,.022);
  tube(halo,"HaloAccentRing",mats.accent,[0,0,-.02],.68,.009);
  for (let i=0;i<8;i++) {
    const a=Math.PI*2*i/8, r=.76, x=Math.cos(a)*r, y=Math.sin(a)*r;
    const point = new THREE.Shape();
    for (let j=0;j<8;j++) { const q=j%2===0?.085:.03, t=Math.PI*j/4-Math.PI/2, px=Math.cos(t)*q, py=Math.sin(t)*q; j===0?point.moveTo(px,py):point.lineTo(px,py); }
    point.closePath();
    const gem = shapeMesh(halo,"HaloPoint"+(i+1),point,i%2?mats.whiteBright:mats.gold,[x,y,.01],.018);
    gem.rotation.z=a;
  }
  ball(halo,"HaloTopGlow",mats.glow,[0,.78,.04],[.14,.14,.025]);

  parts.face = head.getObjectByName("FaceGlassVisor");
  parts.eyes = [head.getObjectByName("LeftEye"),head.getObjectByName("RightEye")];
  parts.materials = mats;

  const api = {
    root, parts, materials: mats,
    setPalette(theme, accentColor) { applyGoziePalette(api,{theme,accentColor}); },
    dispose() {
      root.traverse(o => { if (o.isMesh) o.geometry.dispose(); });
      Object.values(mats).forEach(m => m.dispose());
    }
  };
  applyGoziePalette(api,{theme:options.theme || "light",accentColor:options.accentColor || "#4aa8ff"});
  return api;
}

export function applyGoziePalette(character,{theme="light",accentColor="#4aa8ff"}={}) {
  if (!character || !character.root || !character.materials) return;
  const dark = String(theme).toLowerCase() === "dark";
  const color = new character.materials.accent.color.constructor(accentColor);
  character.materials.accent.color.copy(color);
  character.materials.accent.emissive.copy(color);
  character.materials.glow.color.copy(color);
  character.materials.white.color.set(dark ? "#414854" : "#fbfbf8");
  character.materials.whiteBright.color.set(dark ? "#262d38" : "#ffffff");
  character.root.userData.goziePalette = {theme:dark ? "dark" : "light",accentColor};
}

export default createGozieCharacter;
