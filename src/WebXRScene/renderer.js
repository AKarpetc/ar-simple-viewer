import { WebGLRenderer } from "three/src/renderers/WebGLRenderer";
import { ARButton } from "three/examples/jsm/webxr/ARButton";
import { createScene } from "./scene.js";

export function initializeXRApp(model) {
    const { devicePixelRatio, innerHeight, innerWidth } = window;

    const renderer = new WebGLRenderer({ antialias: true, alpha: true });

    renderer.setSize(innerWidth, innerHeight);
    renderer.setPixelRatio(devicePixelRatio);

    renderer.xr.enabled = true;

    var arButton = ARButton.createButton(renderer, { requiredFeatures: ["hit-test"] });
    arButton.classList.add("ar-button");

    document.body.appendChild(arButton);

    createScene(renderer, model);

    return arButton;
};