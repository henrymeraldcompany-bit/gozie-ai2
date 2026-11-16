# Gozie AI Live Character — Task 1 Asset

This folder contains the first reusable 3D character asset for Gozie AI Live Character.

## Character design
- Full-body, compact futuristic companion inspired by the supplied reference.
- White/porcelain armor and clothing, gold trim, headphones and halo ornament.
- Glossy black face screen with two illuminated eyes.
- **No mouth geometry or mouth animation.**
- A blue infinity emblem on the chest.
- Front direction is +Z and world up is +Y.

## Model implementation
`gozie-character-model.js` exports:
- `createGozieCharacter(THREE, options)` — builds and returns the character.
- `applyGoziePalette(character, { theme, accentColor })` — applies light/dark body materials and a user's accent colour.
- `GOZIE_CHARACTER_MODEL_VERSION` — model source version.

The model is created from Three.js procedural geometry. Named pivot groups are provided for the head, hips, shoulders, elbows, hands, thighs, knees, feet, coat and halo. These give later animation work clear control points for turning, gestures and walking. This first asset is a transform-articulated model; it is not yet a bone-skinned GLB or a finished animation set.

## Example integration
```js
import * as THREE from "three";
import { createGozieCharacter } from "./gozie-character-model.js";

const gozie = createGozieCharacter(THREE, {
  theme: "light",
  accentColor: "#df6ca5"
});
scene.add(gozie.root);

// Later, when the user's saved appearance changes:
gozie.setPalette("dark", "#df6ca5");

// Example animation control point:
gozie.parts.head.rotation.y = 0.2;
```

The main Gozie AI chat page has not been changed in Task 1. Task 2 will build the full-screen character interface and add its Live Chat entry point immediately to the **right of the Send button** in the message composer.


## Task 2 — Full-screen interface
The main chat page now includes a compact **Live Chat** launch button immediately to the right of Send. It opens a full-screen character stage with the complete 3D model and five controls positioned to match the supplied layout:
- Top left: exit.
- Top right: options.
- Bottom left: captions preview toggle.
- Bottom centre: microphone control placeholder.
- Bottom right: speaker control placeholder.

The character screen currently renders the procedural model with gentle idle motion and blinking eyes. Microphone and speaker actions explicitly indicate that voice integration is scheduled for Task 5. Caption display is a preview shell; caption preferences and live transcription are scheduled for Task 6. Theme/accent-driven character materials are scheduled for Task 3.

Three.js is loaded on demand from the pinned jsDelivr package URL when the Live Chat screen is first opened. The renderer caps device pixel ratio for mobile performance. No existing chat, Firebase, or Worker behaviour has been replaced.
