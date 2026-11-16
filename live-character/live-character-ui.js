import { createGozieCharacter } from "./gozie-character-model.js";

const byId = id => document.getElementById(id);
const overlay = byId("liveCharacterOverlay");
const canvasHost = byId("liveCharacterCanvas");
const openButton = byId("liveChatButton");
const exitButton = byId("liveCharacterExit");
const settingsButton = byId("liveCharacterSettingsButton");
const settingsPanel = byId("liveCharacterSettingsPanel");
const settingsClose = byId("liveCharacterSettingsClose");
const captionsButton = byId("liveCharacterCaptions");
const captionPanel = byId("liveCharacterCaption");
const micButton = byId("liveCharacterMic");
const speakerButton = byId("liveCharacterSpeaker");
const notice = byId("liveCharacterNotice");

let THREE = null;
let renderer = null;
let scene = null;
let camera = null;
let character = null;
let animationFrame = 0;
let resizeObserver = null;
let opened = false;
let baseY = 0;
let noticeTimer = 0;

function showNotice(message) {
  if (!notice) return;
  notice.textContent = message;
  notice.hidden = false;
  window.clearTimeout(noticeTimer);
  noticeTimer = window.setTimeout(() => { notice.hidden = true; }, 3000);
}

function setOverlayState(isOpen) {
  opened = isOpen;
  overlay.classList.toggle("open", isOpen);
  overlay.setAttribute("aria-hidden", String(!isOpen));
  document.body.classList.toggle("live-character-active", isOpen);
  if (isOpen) {
    window.setTimeout(() => exitButton?.focus(), 50);
  } else {
    settingsPanel.hidden = true;
    settingsButton?.setAttribute("aria-expanded", "false");
    captionPanel.hidden = true;
    captionsButton.setAttribute("aria-pressed", "false");
    captionsButton.classList.remove("accent-active");
    if (animationFrame) cancelAnimationFrame(animationFrame);
    animationFrame = 0;
    if (openButton) openButton.focus();
  }
}

function makeLights() {
  scene.add(new THREE.HemisphereLight(0xffffff, 0xb9b4a8, 2.15));
  const key = new THREE.DirectionalLight(0xffffff, 3.1);
  key.position.set(-3.5, 6, 5);
  scene.add(key);
  const fill = new THREE.DirectionalLight(0xb9d7ff, 1.25);
  fill.position.set(4, 2.5, 2);
  scene.add(fill);
  const rim = new THREE.DirectionalLight(0xffe4a8, 1.4);
  rim.position.set(0.5, 4, -4);
  scene.add(rim);
}

async function initializeRenderer() {
  if (renderer) {
    resizeRenderer();
    startAnimation();
    return;
  }
  showNotice("Loading Gozie…");
  if (!THREE) {
    const threeModuleUrl = "https://cdn.jsdelivr.net/npm/three@0.180.0/build/three.module.js";
    THREE = await import(threeModuleUrl);
  }

  const width = Math.max(1, canvasHost.clientWidth);
  const height = Math.max(1, canvasHost.clientHeight);
  renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true, powerPreference: "high-performance" });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 1.6));
  renderer.setSize(width, height, false);
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.1;
  renderer.setClearColor(0x000000, 0);
  canvasHost.replaceChildren(renderer.domElement);

  scene = new THREE.Scene();
  camera = new THREE.PerspectiveCamera(32, width / height, 0.1, 60);
  makeLights();

  character = createGozieCharacter(THREE, { theme: "light", accentColor: "#4aa8ff" });
  const bounds = new THREE.Box3().setFromObject(character.root);
  const size = bounds.getSize(new THREE.Vector3());
  baseY = -bounds.min.y;
  character.root.position.y = baseY;
  scene.add(character.root);

  const floor = new THREE.Mesh(
    new THREE.CircleGeometry(1.05, 48),
    new THREE.MeshBasicMaterial({ color: 0x8e9a9f, transparent: true, opacity: 0.15, depthWrite: false })
  );
  floor.rotation.x = -Math.PI / 2;
  floor.position.y = 0.012;
  floor.scale.set(1.25, 0.55, 1);
  scene.add(floor);

  const targetY = Math.max(1.35, size.y * 0.49);
  const distance = Math.max(6.8, size.y / (2 * Math.tan(THREE.MathUtils.degToRad(16))) * 1.12);
  camera.position.set(0, targetY + 0.02, distance);
  camera.lookAt(0, targetY, 0);
  camera.updateProjectionMatrix();

  resizeObserver = new ResizeObserver(resizeRenderer);
  resizeObserver.observe(canvasHost);
  startAnimation();
  notice.hidden = true;
}

function resizeRenderer() {
  if (!renderer || !camera || !canvasHost) return;
  const width = Math.max(1, canvasHost.clientWidth);
  const height = Math.max(1, canvasHost.clientHeight);
  renderer.setSize(width, height, false);
  camera.aspect = width / height;
  camera.updateProjectionMatrix();
}

function startAnimation() {
  if (animationFrame || !renderer || !opened) return;
  const tick = time => {
    if (!opened) { animationFrame = 0; return; }
    if (character) {
      character.root.position.y = baseY + Math.sin(time * 0.00125) * 0.018;
      character.parts.head.rotation.y = Math.sin(time * 0.00055) * 0.035;
      character.parts.head.rotation.z = Math.sin(time * 0.0008) * 0.012;
      const blinkPhase = time % 4700;
      const blink = blinkPhase > 90 && blinkPhase < 185 ? 0.22 : 1;
      character.parts.eyes.forEach(eye => { eye.scale.y = 0.115 * blink; });
    }
    renderer.render(scene, camera);
    animationFrame = requestAnimationFrame(tick);
  };
  animationFrame = requestAnimationFrame(tick);
}

async function openCharacter() {
  if (opened) return;
  setOverlayState(true);
  try {
    await initializeRenderer();
  } catch (error) {
    console.error("Gozie Live Character could not initialize:", error);
    showNotice("The 3D character could not load. Check your internet connection and WebGL support.");
  }
}

function closeCharacter() {
  setOverlayState(false);
}

openButton?.addEventListener("click", openCharacter);
exitButton?.addEventListener("click", closeCharacter);

settingsButton?.addEventListener("click", () => {
  settingsPanel.hidden = !settingsPanel.hidden;
  settingsButton.setAttribute("aria-expanded", String(!settingsPanel.hidden));
  if (!settingsPanel.hidden) captionPanel.hidden = true;
});
settingsClose?.addEventListener("click", () => {
  settingsPanel.hidden = true;
  settingsButton?.setAttribute("aria-expanded", "false");
});

captionsButton?.addEventListener("click", () => {
  const show = captionsButton.getAttribute("aria-pressed") !== "true";
  captionsButton.setAttribute("aria-pressed", String(show));
  captionsButton.classList.toggle("accent-active", show);
  captionPanel.hidden = !show;
  settingsPanel.hidden = true;
  settingsButton?.setAttribute("aria-expanded", "false");
});

micButton?.addEventListener("click", () => showNotice("Microphone connection will be added in Task 5."));
speakerButton?.addEventListener("click", () => showNotice("Live voice and speaker controls will be added in Task 5."));

document.addEventListener("keydown", event => {
  if (opened && event.key === "Escape") closeCharacter();
});

document.addEventListener("visibilitychange", () => {
  if (document.hidden && opened && animationFrame) {
    cancelAnimationFrame(animationFrame);
    animationFrame = 0;
  } else if (!document.hidden && opened) {
    startAnimation();
  }
});
window.addEventListener("pagehide", () => {
  if (animationFrame) cancelAnimationFrame(animationFrame);
  resizeObserver?.disconnect();
  renderer?.dispose();
});
