import { createPlaneMarker, createPlaceButton } from "./createPlaneMarker";
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
  Box3,
  Raycaster,
  BoxGeometry,
  MeshBasicMaterial,
  Vector3,
  MeshNormalMaterial
} from "three";



// Custom 3D model augmentation

export function createScene(renderer, sceneModels, loader = null, selectModel = null, clearSelection = null, max = 5, changeModelsNumber = null, hittestRady = null, AddLogs = null) {
  const scene = new Scene();

  var intersectedObject;
  var isTransforming = false;

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
  let selectedModel;
  scene.add(planeMarker);
  //scene.add(placeButton);


  /**
   * Setup the controller to get input from the XR space.
   */
  // Controllers
  var controller1 = renderer.xr.getController(0);
  controller1.addEventListener('selectstart', onSelectStart);
  scene.add(controller1);

  var controller2 = renderer.xr.getController(1);
  controller2.addEventListener('selectstart', onSelectStart);
  scene.add(controller2);

  //controller.addEventListener("select", onSelect);

  /**
   * The onSelect function is called whenever we tap the screen
   * in XR mode.
   */

  // Raycasting setup
  const raycaster = new Raycaster();
  let tempMatrix = new Matrix4();

  function hightLightObject(boundaryBox) {
    if (boundaryBox) {
      let hModel = installedModels.filter(x => x.boundaryBox == boundaryBox)[0];
      hModel.hightLightBox.visible = true;
      selectedModel = hModel;

      if (selectModel)
        selectModel(hModel.model);
    }
  }

  function unHightLightObject(boundaryBox) {
    if (boundaryBox) {
      let model = installedModels.filter(x => x.boundaryBox == boundaryBox);
      model[0].hightLightBox.visible = false;
      intersectedObject = null;
      selectedModel = null;

      if (clearSelection)
        clearSelection();
    }
  }


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

  function onSelectStart(event) {
    if (isTransforming)
      return;

    try {
      const controller = event.target;
      tempMatrix.identity().extractRotation(controller.matrixWorld);
      raycaster.ray.origin.setFromMatrixPosition(controller.matrixWorld);
      raycaster.ray.direction.set(0, 0, -1).applyMatrix4(tempMatrix);
      const intersects = raycaster.intersectObjects(scene.children, true).filter(x => x.object.name == "modelBox");

      if (intersects.length > 0) {

        if (intersectedObject)
          unHightLightObject(intersectedObject);

        intersectedObject = intersects[0].object;

        hightLightObject(intersectedObject);

        selectModel();
      }

    } catch (e) { alert(e); }
  }

  function unselect() {
    unHightLightObject(intersectedObject);
  }

  async function onRemove() {
    if (isTransforming)
      return;

    if (intersectedObject) {
      try {
        let currentModel = installedModels.filter(x => x.boundaryBox == intersectedObject)[0];
        unHightLightObject(intersectedObject);

        await scene.remove(currentModel.model);
        await scene.remove(currentModel.boundaryBox);
        await scene.remove(currentModel.hightLightBox);

        installedModels = installedModels.filter(x => x.boundaryBox != currentModel.boundaryBox);

        intersectedObject = null;

        if (changeModelsNumber)
          changeModelsNumber(installedModels.length);

      } catch (e) {
        alert(e);
      }
    }
  }

  function Place() {
    try {
      var matrix = currentModel.matrix;
      currentModel.matrixAutoUpdate = true;

      currentModel.position.setFromMatrixPosition(matrix);

      if (!currentModel?.isTransformed) {
        currentModel.setRotationFromMatrix(matrix);
      }

      // Rotate the model randomly to give a bit of variation.
      // currentModel.setRotationFromMatrix(planeMarker.matrix);
      const materialboundaryBox = new MeshBasicMaterial({
        color: 0xffffff, // Green color
        transparent: true, // Enable transparency
        opacity: 0  // Set the opacity (50% transparent)
      });

      const box3 = new Box3().setFromObject(currentModel);
      const boxGeometry = new BoxGeometry(
        box3.getSize(new Vector3()).x,
        box3.getSize(new Vector3()).y * 2,
        box3.getSize(new Vector3()).z
      );

      const boundaryBox = new Mesh(boxGeometry, materialboundaryBox);
      boundaryBox.setRotationFromMatrix(planeMarker.matrix);
      boundaryBox.position.setFromMatrixPosition(planeMarker.matrix);
      boundaryBox.name = "modelBox";
      scene.add(boundaryBox);

      const hightLightBoxGeometry = new BoxGeometry(
        box3.getSize(new Vector3()).x + 0.01,
        0.05,
        box3.getSize(new Vector3()).z + 0.01,
      );

      const materialhightLightBox = new MeshBasicMaterial({
        color: 0x7CFC00, // Green color
        transparent: false,// Enable transparency
      });

      const hightLightBox = new Mesh(hightLightBoxGeometry, materialhightLightBox);
      hightLightBox.setRotationFromMatrix(planeMarker.matrix);
      hightLightBox.position.setFromMatrixPosition(planeMarker.matrix);
      hightLightBox.name = "hightLightBox";
      hightLightBox.visible = false;
      scene.add(hightLightBox);

      installedModels.push({
        model: currentModel,
        boundaryBox: boundaryBox,
        hightLightBox: hightLightBox
      });

      if (currentModel.scale) {
        currentModel.scale.set(1, 1, 1)
      }

      if (changeModelsNumber)
        changeModelsNumber(installedModels.length);

      currentModel = null;
      clearSelection();
    } catch (e) { alert(e); }
  }

  function onSelect(i) {
    if (planeMarker.visible) {
      try {

        currentModel = models[i].glb_model.scene.clone();

        if (currentModel.scale) {
          currentModel.scale.set(0.7, 0.7, 0.7)
        }

        currentModel.visible = true;
        currentModel.matrixAutoUpdate = false;

        currentModel.matrix.fromArray(planeMarker.matrix);

        scene.add(currentModel);
        selectModel("put");

      } catch (e) {
        alert(e);
      }
    }
  }

  function Scale(rangaValue) {
    let currentModel = installedModels.filter(x => x.boundaryBox == intersectedObject)[0];
    var rotationModel = currentModel.model;
    var rotationBoundary = currentModel.boundaryBox;
    var rotationHightLight = currentModel.hightLightBox;

    var value = rangaValue / 100;

    rotationModel.scale.set(value, value, value)
    rotationBoundary.scale.set(value, value, value)
    rotationHightLight.scale.set(value, value, value)
  }

  function Rotate(isUp) {
    let currentModel = installedModels.filter(x => x.boundaryBox == intersectedObject)[0];
    let rotationModel = currentModel.model;
    let rotationBoundary = currentModel.boundaryBox;
    let rotationHightLight = currentModel.hightLightBox;

    //installedModels=installedModels.filter(x => x.boundaryBox != intersectedObject);

    if (isUp) {
      rotationModel.rotation.y += 0.1;
      rotationBoundary.rotation.y += 0.1;
      rotationHightLight.rotation.y += 0.1;
    }
    else {
      rotationModel.rotation.y -= 0.1;
      rotationBoundary.rotation.y -= 0.1;
      rotationHightLight.rotation.y -= 0.1;
    }

    rotationModel.updateMatrix();

    //installedModels.put(currentModel);

    // resetRotation(rotationModel);
  }
  /**
   * Called whenever a new hit test result is ready.
   */
  function onHitTestResultReady(hitPoseTransformed) {
    if (hitPoseTransformed) {
      planeMarker.visible = true;
      planeMarker.matrix.fromArray(hitPoseTransformed);

      if (currentModel) {
        currentModel.matrix.fromArray(hitPoseTransformed);
        currentModel.visible = true;
      }

      if (hittestRady)
        hittestRady()

      if (loader)
        loader.hide();
    }
  }

  /**
   * Called whenever the hit test is empty/unsuccesful.
   */
  function onHitTestResultEmpty() {
    planeMarker.visible = false;


    if (currentModel) {
      currentModel.visible = false;
    }
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


  let savedScale = null;
  function startTransform() {
    isTransforming = true;
  }

  function stopTransform() {

    try {
      isTransforming = false;

      let currentModel = selectedModel;
      let rotationModel = currentModel.model;

      rotationModel.isTransformed = true;

      rotationModel["savedRotation"] = {
        x: rotationModel.rotation.x,
        y: rotationModel.rotation.y,
        z: rotationModel.rotation.z
      }
      rotationModel["savedScale"] = {
        x: rotationModel.scale.x,
        y: rotationModel.scale.y,
        z: rotationModel.scale.z
      }

    } catch (e) {
      alert(e);
    }

  }

  function bakeCurrentScaleAsDefault(mesh) {
    // Capture the current scale
    const currentScale = mesh.scale.clone();

    // Create a scaling matrix
    const scaleMatrix = new Matrix4();
    scaleMatrix.makeScale(currentScale.x, currentScale.y, currentScale.z);

    // Apply this scaling matrix to the mesh's geometry
    mesh.geometry.applyMatrix4(scaleMatrix);

    // Reset the object's scale to default (1, 1, 1)
    mesh.scale.set(1, 1, 1);

    // If your render loop doesn't update the geometry by default, ensure positions are marked updated
    mesh.geometry.attributes.position.needsUpdate = true;

    // Log for verification
    console.log("The model's current scale has been set as default.");
  }

  function bakeCurrentRotationAsDefault(mesh) {
    // Ensure matrix updates reflect current state
    mesh.updateMatrixWorld(true);

    // Get the current rotation as a quaternion
    const currentQuaternion = mesh.quaternion.clone();

    // Reset the object's rotation
    mesh.rotation.set(0, 0, 0);

    // Create a rotation matrix from the inverted current rotation quaternion
    const rotationMatrix = new Matrix4();
    rotationMatrix.makeRotationFromQuaternion(currentQuaternion.invert());

    // Apply this matrix to the mesh's geometry, baking the rotation into the vertices
    mesh.geometry.applyMatrix4(rotationMatrix);

    // Flag the position for update, if necessary
    mesh.geometry.attributes.position.needsUpdate = true;
  }

  let savedMatrix;

  function moveModel() {

    try {
      let selected = selectedModel;

      var movingModel = selected.model;
      var movingBoundary = selected.boundaryBox;
      var movingHightLight = selected.hightLightBox;

      currentModel = movingModel;

      currentModel.matrixAutoUpdate = false;
      currentModel.scale.set(0.5, 0.5, 0.5)

      currentModel.updateMatrix();

      /*
      if (currentModel.savedRotation)
        currentModel.rotation.set(currentModel.savedRotation.x, currentModel.savedRotation.y, currentModel.savedRotation.z);


      currentModel.traverse(function (node) { // or myObject.traverse(
        if (node.isMesh) {
          if (currentModel.savedRotation)
            node.geometry.rotateY(currentModel.savedRotation.y);
        }
      });
      */

      /*
      if (currentModel.currentQuaternion)
        currentModel.setRotationFromQuaternion(currentModel.currentQuaternion)

      currentModel.updateMatrix();
    */


      scene.remove(movingBoundary);
      scene.remove(movingHightLight);

      selectModel("put");
    } catch (e) {
      alert(e);

    }
  }

  renderer.setAnimationLoop(renderLoop);

  return { scene, onSelect, setModels, nextPlace, onRemove, Scale, Rotate, startTransform, stopTransform, unselect, Place, moveModel }
}