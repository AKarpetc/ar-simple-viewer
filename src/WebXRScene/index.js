import { WebGLRenderer } from "three/src/renderers/WebGLRenderer";
//import { ARButton } from "three/examples/jsm/webxr/ARButton";
import { ARButton } from "../common/utils/ARButton.js";

import { createScene } from "./scene.js";
import conf from '../config/config.js'
import {
  browserHasImmersiveArCompatibility,
  displayUnsupportedBrowserMessage,
} from "../common/utils/domUtils.js";

import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { DRACOLoader } from 'three/addons/loaders/DRACOLoader.js';


const urlParams = new URLSearchParams(window.location.search);

let renderer;
var arButton;

let session = null;
let scene = null;


const sceneLoader =
{
  loader: null,
  init: () => {
    sceneLoader.loader = document.getElementById("place-finder");
  },
  show: () => {
    sceneLoader.loader.style.display = ""
  },
  hide: () => {
    sceneLoader.loader.style.display = "none"
  }
}


function base64ToJson(encoded) {
  if (encoded == 'undefined' || encoded == null || encoded == '')
    return null;

  var actual = JSON.parse(atob(encoded))
  return actual;
}

async function fetchModels() {
  let models;

  await fetch(window.location.origin + '/models/getModels.json')
    .then(response => response.json())
    .then(responce => {
      models = responce.data;
    })
    .catch(error => {
      console.error('Ошибка загрузки моделей:', error);
    });

  return models;
}

function initializeXRApp() {
  const { devicePixelRatio, innerHeight, innerWidth } = window;

  var mainElement = document.getElementById("main");
  mainElement.classList.remove("hidden");

  renderer = new WebGLRenderer({ antialias: true, alpha: true });

  renderer.setSize(innerWidth, innerHeight);
  renderer.setPixelRatio(devicePixelRatio);

  renderer.xr.enabled = true;

  renderer.xr.addEventListener('sessionstart', function (event) {
    document.getElementById("main").classList.add("hidden");
    document.getElementById("ar-main").classList.remove("hidden");

    session = renderer.xr.getSession();
  });

  renderer.xr.addEventListener('sessionend', function (event) {
    session = null;
    history.back();
  });

  arButton = ARButton.createButton(renderer,
    {
      requiredFeatures: ["hit-test"],
      optionalFeatures: ['dom-overlay', 'dom-overlay-for-handheld-ar'],
      domOverlay: { root: document.body }
    });


  const gltfLoader = new GLTFLoader();
  const dracoLoader = new DRACOLoader();
  dracoLoader.setDecoderPath("decoder/");
  gltfLoader.setDRACOLoader(dracoLoader);

  sceneLoader.init();


  fetchModels().then(async (models) => {

    let sceneModels = await LoadModels(models, gltfLoader);

    console.log(sceneModels);

    scene = createScene(renderer, sceneModels, sceneLoader);

  });




};

window.closeSession = () => {
  if (session != null)
    session.end();
}

window.placeModel = () => {
  if (session != null && scene != null) {
    scene.onSelect(this.dataset.aliasindex);
  }

}

window.showAr = () => {
  arButton.click();
}

async function LoadModels(models, gltfLoader) {
  for (let i = 0; i < models.length; i++) {
    var sceneModel = await gltfLoader.loadAsync(models[i].glb);
    models[i]["glb_model"] = sceneModel;

    var placeWrapper = document.getElementById("places");

    let button = document.createElement("button");

    button.classList.add("session-button");

    button.dataset.alias = models[i].alias;

    button.dataset.aliasindex = i;

    button.innerHTML = `<img class="session-button__image" src="${models[i].preview}" />`;

    button.addEventListener("click", (e) => {
      var aliasindex = parseInt(e.currentTarget.dataset.aliasindex);
      if (session != null && scene != null) {
        scene.onSelect(aliasindex);
      }
    });

    placeWrapper.appendChild(button);
  }

  return models;
}

function showQR() {
  var qrcodeElement = document.getElementById("qr-code");
  qrcodeElement.classList.remove("hidden");

  var baseUrl = window.location.origin;

  if (baseUrl.indexOf('127.0.0.1') >= 0 || baseUrl.indexOf('localhost') >= 0) {
    baseUrl = "https://192.168.100.27:5501"
  }

  new QRCode(qrcodeElement,
    {
      text: baseUrl + "/xrviewer.html",
      width: 400,
      height: 400,
    });
}


async function start() {
  const isImmersiveArSupported = await browserHasImmersiveArCompatibility();

  isImmersiveArSupported
    ? initializeXRApp()
    : showQR();
}

try {
  await start();

} catch (err) {
  alert(err);
}
