import { createPlaneMarker } from "./createPlaneMarker";
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { DRACOLoader } from 'three/addons/loaders/DRACOLoader.js';
import { handleXRHitTest } from "../common/xr/hitTest";

import {
  AmbientLight,
  DirectionalLight,
  HemisphereLight,
  Matrix4,
  Mesh,
  Object3D,
  PerspectiveCamera,
  Scene,
  WebGLRenderer,
  XRFrame,
  Box3
} from "three";



// Custom 3D model augmentation

export function createScene(renderer, sceneModels, loader = null) {
  const scene = new Scene();

  const camera = new PerspectiveCamera(
    70,
    window.innerWidth / window.innerHeight,
    0.02,
    20,
  );

  /**
   * Add some simple ambient lights to illuminate the model.
   */
  const ambientLight = new AmbientLight(0xffffff, 1.0);
  scene.add(ambientLight);


  /**
   * Load the gLTF model and assign result to variable.
   */
  var models = sceneModels;

  /**
   * Create the plane marker to show on tracked surfaces.
   */
  const planeMarker = createPlaneMarker();
  scene.add(planeMarker);

  /**
   * Setup the controller to get input from the XR space.
   */
  const controller = renderer.xr.getController(0);
  scene.add(controller);

  //controller.addEventListener("select", onSelect);

  /**
   * The onSelect function is called whenever we tap the screen
   * in XR mode.
   */


  function setModels(sourceModels) {
    models = sourceModels;
  }

  function nextPlace() {
    currentModel = null;
    currentPosition = null;
  }


  let installedModels = [];

  var currentModel = null;
  var currentPosition = null;


  function onSelect(i) {

    console.log(models);
    console.log(models[i]);

    if (planeMarker.visible) {
      try {


        if (currentModel == null) {
          currentModel = models[i].glb_model.scene.clone();
          // Place the model on the spot where the marker is showing.
          currentModel.position.setFromMatrixPosition(planeMarker.matrix);
          currentPosition = planeMarker.matrix;

          // Rotate the model randomly to give a bit of variation.
          currentModel.setRotationFromMatrix(planeMarker.matrix);
          currentModel.visible = true;
          scene.add(currentModel);

        } else {
          let newModel = models[i].glb_model.scene.clone();
          newModel.position.setFromMatrixPosition(currentPosition);
          newModel.setRotationFromMatrix(currentPosition);
          scene.remove(currentModel);
          scene.add(newModel);
          currentModel = newModel;
        }

      } catch (e) {
        alert(e);
      }
    }
  }

  /**
   * Called whenever a new hit test result is ready.
   */
  function onHitTestResultReady(hitPoseTransformed) {
    if (hitPoseTransformed) {
      planeMarker.visible = true;
      planeMarker.matrix.fromArray(hitPoseTransformed);

      if (loader)
        loader.hide();

    }
  }

  /**
   * Called whenever the hit test is empty/unsuccesful.
   */
  function onHitTestResultEmpty() {
    planeMarker.visible = false;
  }

  /**
   * The main render loop.
   *
   * This is where we perform hit-tests and update the scene
   * whenever anything changes.
   */
  const renderLoop = (timestamp, frame) => {
    if (renderer.xr.isPresenting) {
      if (frame) {
        handleXRHitTest(
          renderer,
          frame,
          onHitTestResultReady,
          onHitTestResultEmpty,
        );
      }

      renderer.render(scene, camera);
    }
  };

  renderer.setAnimationLoop(renderLoop);

  return { scene, onSelect, setModels, nextPlace }
}