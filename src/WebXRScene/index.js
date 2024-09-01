import { WebGLRenderer } from "three/src/renderers/WebGLRenderer";
import { ARButton } from "../common/utils/ARButton.js";
import { createScene } from "./scene.js";
import { browserHasImmersiveArCompatibility } from "../common/utils/domUtils.js";
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { DRACOLoader } from 'three/addons/loaders/DRACOLoader.js';
import { MeshoptDecoder } from 'three/examples/jsm/libs/meshopt_decoder.module.js';
import osDetector from "../common/osDetector"
import modelUtils from "../common/utils/modelUtils.js"
import conf from "../config/config.js"

var mode = "work";
//var mode = "text";
//var mode = "artool";

var operation = null;
var rotate = "rotate";
var scale = "scale";
var maxModels = 5;

let os = osDetector.getMobileOperatingSystem();

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
gltfLoader.setDRACOLoader(dracoLoader)
  .setMeshoptDecoder(MeshoptDecoder);

var isModelSelected = false;

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
  try {
    let responce = await modelUtils.getModels();
    modelsList = responce.data;
    typesList = responce.types;
    for (let i = 0; i < modelsList.length; i++) {
      modelsList[i].glb = modelsList[i].glb.replace('models', `${conf.awsEndPoint}/avt-models`);
      modelsList[i].preview = modelsList[i].preview.replace('models', `${conf.awsEndPoint}/avt-models`);
    }
    for (let i = 0; i < typesList.length; i++) {
      typesList[i].preview = typesList[i].preview.replace('models', `${conf.awsEndPoint}/avt-models`);
    }
  } catch (err) {
    console.error('Ошибка загрузки моделей:', err);
  }
}

function AddLogs(logs) {
  document.getElementById("log").innerText += logs + "\n";
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
    mainElement.classList.add("hidden");
    document.getElementById("ar-main").classList.remove("hidden");

    session = renderer.xr.getSession();
  });

  renderer.xr.addEventListener('sessionend', function (event) {

    window.location.reload();
  });

  mainElement.appendChild(ARButton.createButton(renderer,
    {
      requiredFeatures: ["hit-test"],
      optionalFeatures: ['dom-overlay', 'dom-overlay-for-handheld-ar'],
      domOverlay: { root: document.body }
    }));

  sceneLoader.init();

  fetchModels().then(async (models) => {
    try {
      await LoadModels(typesList, gltfLoader, "types");
      scene = createScene(renderer, [], sceneLoader, selectModel, clearSelection, null, null, hitTestReady, AddLogs);
    } catch (e) { alert(e) }
  });

};

function hitTestReady() {
  showArOptions();
}

function showArOptions() {
  var optionsButtons = document.getElementById("optionsButtons");

  if (optionsButtons.classList.contains("hidden"))
    optionsButtons.classList.remove("hidden")

}

function hideArOptions() {
  var optionsButtons = document.getElementById("optionsButtons");
  optionsButtons.classList.add("hidden")
}

function showPut() {
  let el = document.getElementById("putModel");
  if (el.classList.contains("hidden"))
    el.classList.remove("hidden")

}

function hidePut() {
  let el = document.getElementById("putModel");
  if (!el.classList.contains("hidden"))
    el.classList.add("hidden")

}

function hideArButtons() {
  [...document.getElementsByClassName("toolbar_button__selected")].forEach(el => {
    el.classList.add("hidden")
  });
}

function showArButtons() {
  [...document.getElementsByClassName("toolbar_button__selected")].forEach(el => {
    if (el.classList.contains("hidden"))
      el.classList.remove("hidden")
  });
}

function selectModel(mode = "all") {
  isModelSelected = true;

  if (mode == "all") {

    hideArOptions();
    showArButtons()

  }

  if (mode == "put") {
    showPut();
  }

}

function clearSelection() {
  isModelSelected = false;
  hideArButtons();
}

window.unselect = async () => {
  scene.unselect();
}

window.closeSession = () => {
  if (session != null)
    session.end();
}

window.putModel = () => {

  if (scene) {
    scene.Place();

    hidePut();
  }
}

window.placeModel = () => {
  window.event.stopPropagation();
  if (session != null && scene != null) {
    scene.onSelect();
  }
}

function openSlider() {
  scene.startTransform();
  document.getElementById("toolbarSlider").classList.remove("hidden")
  document.getElementById("toolbarButtons").classList.add("hidden")
}

function closeSlider() {
  document.getElementById("toolbarSlider").classList.add("hidden")
  document.getElementById("toolbarButtons").classList.remove("hidden")
}

window.moveModel = () => {

  if (scene) {
    scene.moveModel();

    showPut();
    hideArButtons();

  }
}

window.transformDone = () => {
  closeSlider();
  setTimeout(scene.stopTransform(), 2000);

}

let oldRotation = 100;
window.sliderChange = (element) => {

  if (operation == rotate) {
    if (oldRotation != element.value) {
      scene.Rotate(oldRotation < element.value);
      oldRotation = element.value;
    }
  }

  if (operation == scale) {
    scene.Scale(element.value);
    oldScale = element.value;
  }
}

window.rotateModel = () => {
  window.event.stopPropagation()
  operation = rotate;
  document.getElementById("modelSlider").value = 100;
  oldRotation = 100;
  openSlider();
}

window.scaleModel = () => {
  window.event.stopPropagation()
  operation = scale;
  document.getElementById("modelSlider").value = 100;
  openSlider();
}

window.removeModel = async () => {
  window.event.stopPropagation()

  if (session != null && scene != null) {
    await scene.onRemove();
  }
}

window.nextPlace = () => {
  scene.nextPlace();
}

window.showAr = () => {
  arButton.click();
}

function hideBack() {
  document.getElementById("arBack").classList.add("hidden");
}

function showBack() {
  document.getElementById("arBack").classList.remove("hidden");
}

window.arBack = async () => {
  let sceneModels = await LoadModels(typesList, gltfLoader, "types");
  scene.models = [];
  hideBack();
}

async function LoadModels(items, gltfLoader, type = "models") {
  var placeWrapper = document.getElementById("places");
  placeWrapper.innerHTML = "";

  for (let i = 0; i < items.length; i++) {

    let button = document.createElement("button");

    button.id = "buttonModel" + i;
    button.classList.add("session-button");
    button.dataset.alias = items[i].alias;
    button.dataset.aliasindex = i;
    button.dataset.modelLoaded = false;

    button.dataset.baseType = type;
    button.dataset.type = items[i].type;

    if (type == "models")
      button.innerHTML += `<i id="spinnerModel${i}" class="fa fa-spinner fa-pulse fa-3x fa-spin loading-model" aria-hidden="true"></i>`;

    button.innerHTML += `<img class="session-button__image" src="${items[i].preview}" />`

    button.addEventListener("click", (e) => {
      ClickToArButton(e);
    });

    placeWrapper.appendChild(button);
  }

  GetModelAsync(items).then(models => {
    scene.setModels(models);
  })

  return items;
}
async function GetModelAsync(items) {
  for (let i = 0; i < items.length; i++) {
    var sceneModel = await gltfLoader.loadAsync(items[i].glb);
    var scale = items[i].scale;
    items[i]["glb_model"] = sceneModel;

    var spinner = document.getElementById(`spinnerModel${i}`);
    spinner?.classList?.add("hidden");

    var button = document.getElementById(`buttonModel${i}`);
    button.dataset.modelLoaded = true;

  }

  return items;
}

function ClickToArButton(e) {

  var dataset = e.currentTarget.dataset;
  console.log(e.currentTarget.dataset);

  if (dataset.baseType == "types") {
    var models = modelsList.filter(x => x.type == dataset.type)
    console.log(models);

    LoadModels(models, gltfLoader, "models").then(models => {
      scene.setModels(models);
      showBack();
    });
    return;
  }

  var aliasindex = parseInt(e.currentTarget.dataset.aliasindex);

  if (e.currentTarget.dataset.modelLoaded == "false")
    return;

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


window.addEventListener('vlaunch-initialized', async (event) => {
  if (!isImmersiveArSupported && os != "Windows" && os != "Android") {
    var launchUrl = VLaunch.getLaunchUrl(window.location.href + '?instantWebxr=true')
    window.location.href = launchUrl
  }
})

const isImmersiveArSupported = await browserHasImmersiveArCompatibility();
async function start() {
  if (mode == "artool") {
    document.getElementById("main").classList.add("hidden");
    document.getElementById("ar-main").classList.remove("hidden");
    initializeXRApp();
    return;
  }

  isImmersiveArSupported
    ? initializeXRApp()
    : showQR();
}


try {
  if (os == "Android" || mode == "artool") {
    let main = document.getElementById("main");
    main.classList.remove("hidden");
    await start(false);
  } else if (os == "Windows") {
    showQR();
    document.body.appendChild(ARButton.createButton(renderer,
      {
        requiredFeatures: ["hit-test"],
        optionalFeatures: ['dom-overlay', 'dom-overlay-for-handheld-ar'],
        domOverlay: { root: document.body }
      }));
  } else {
    if (isImmersiveArSupported) {
      let main = document.getElementById("main");
      main.classList.remove("hidden");
      await start(false);
    }
  }

} catch (err) {
  alert(err);
}
