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

var mode = "work";
///var mode = "text";
//var mode = "artool";


const urlParams = new URLSearchParams(window.location.search);

let renderer;
var arButton;

let session = null;
let scene = null;

let modelsList;
let typesList;

const gltfLoader = new GLTFLoader();
const dracoLoader = new DRACOLoader();
dracoLoader.setDecoderPath("decoder/");
gltfLoader.setDRACOLoader(dracoLoader);

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

async function fetchModels() {
  await fetch(window.location.origin + '/models/getModels.json')
    .then(response => response.json())
    .then(responce => {
      modelsList = responce.data;
      typesList = responce.types;

    })
    .catch(error => {
      console.error('Ошибка загрузки моделей:', error);
    });

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
    document.getElementById("ar-main").classList.add("hidden");
    document.getElementById("main").classList.remove("hidden");
  });

  arButton = ARButton.createButton(renderer,
    {
      requiredFeatures: ["hit-test"],
      optionalFeatures: ['dom-overlay', 'dom-overlay-for-handheld-ar'],
      domOverlay: { root: document.body }
    });

  sceneLoader.init();

  fetchModels().then(async (models) => {

    let sceneModels = await LoadModels(typesList, gltfLoader, "types");
    scene = createScene(renderer, [], sceneLoader);
  });

};

window.closeSession = () => {
  if (session != null)
    session.end();
}

window.nextPlace = () => {
  clearSelectedModel();
  scene.nextPlace();
}

window.showAr = () => {
  arButton.click();
}

function hideArButtons() {
  document.getElementById("arBack").classList.add("hidden");
  document.getElementById("arOk").classList.add("hidden");

}

function showArButtons() {
  document.getElementById("arBack").classList.remove("hidden");
  document.getElementById("arOk").classList.remove("hidden");
}

window.arBack = async () => {
  let sceneModels = await LoadModels(typesList, gltfLoader, "types");
  scene.models = [];
  hideArButtons();
}



function uuidv4() {
  return "10000000-1000-4000-8000-100000000000".replace(/[018]/g, c =>
    (+c ^ crypto.getRandomValues(new Uint8Array(1))[0] & 15 >> +c / 4).toString(16)
  );
}


async function LoadModels(items, gltfLoader, type = "models") {
  var placeWrapper = document.getElementById("places");
  placeWrapper.innerHTML = "";

  for (let i = 0; i < items.length; i++) {

    let button = document.createElement("button");
    button.classList.add("session-button");
    button.dataset.alias = items[i].alias;
    button.id = uuidv4();

    button.dataset.aliasindex = i;
    button.dataset.baseType = type;
    button.dataset.type = items[i].type;
    button.innerHTML = `<img class="session-button__image"  src="${items[i].preview}" />`;

    button.addEventListener("click", (e) => {
      ClickToArButton(e);
    });

    if (type == "models") {
      var sceneModel = await gltfLoader.loadAsync(items[i].glb);
      var scale = items[i].scale;

      if (items[i].scale)
        sceneModel.scene.scale.set(scale.x, scale.y, scale.z);

      items[i]["glb_model"] = sceneModel;
    }

    placeWrapper.appendChild(button);

  }

  return items;
}

function clearSelectedModel() {
  [...document.getElementsByClassName("session-button__image__checked")].forEach(item => {
    item.classList.remove("session-button__image__checked");
  })
}

function ClickToArButton(e) {

  var dataset = e.currentTarget.dataset;
  console.log(e.currentTarget.dataset);

  if (dataset.baseType == "types") {
    var models = modelsList.filter(x => x.type == dataset.type)
    console.log(models);

    LoadModels(models, gltfLoader, "models").then(models => {
      scene.setModels(models);
      showArButtons();
    });
    return;
  }

  clearSelectedModel();
  e.currentTarget.className += " session-button__image__checked";

  var aliasindex = parseInt(e.currentTarget.dataset.aliasindex);
  if (session != null && scene != null) {
    scene.onSelect(aliasindex);
  }
}

function showQR() {
  var qrcodeElement = document.getElementById("qr-code");
  qrcodeElement.classList.remove("hidden");

  var baseUrl = window.location.origin;
  console.log(window.location);

  var host = window.location.host.toString();

  if (baseUrl.indexOf('127.0.0.1') >= 0 || baseUrl.indexOf('localhost') >= 0) {
    baseUrl = "https://192.168.100.27:" + host.split(':')[1];
  }

  new QRCode(qrcodeElement,
    {
      text: baseUrl + "/xrviewer.html",
      width: 400,
      height: 400,
    });
}


async function start() {

  if (mode == "artool") {
    document.getElementById("main").classList.add("hidden");
    document.getElementById("ar-main").classList.remove("hidden");
    initializeXRApp();
    return;
  }

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
