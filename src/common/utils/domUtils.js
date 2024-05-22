/*  
 * Returns true if navigator has xr with 'immersive-ar' capabilities
 * Returns false otherwise.
 */
export async function browserHasImmersiveArCompatibility() {
    if (window.navigator.xr) {
      const isSupported = await window.navigator.xr.isSessionSupported(
        "immersive-ar",
      );
      console.info(
        `[DEBUG] ${
          isSupported
            ? "Browser supports immersive-ar"
            : "Browser does not support immersive-ar"
        }`,
      );
      return isSupported;
    }
    return false;
  }
  
  /*
   * Create and display message when no XR capabilities are found.
   */
  export function displayUnsupportedBrowserMessage() {
    const appRoot = document.getElementById("app-root");
    const bigMessage = document.createElement("p");
  
    bigMessage.innerText = "😢 Oh no!";
    if (appRoot) {
      appRoot.appendChild(bigMessage);
    }
  
    const middleMessage = document.createElement("p");
    middleMessage.innerText =
      "Your browser does not seem to support augmented reality with WebXR.";
  
    if (appRoot) {
      appRoot.appendChild(middleMessage);
    }
  
    const helpMessage = document.createElement("p");
  
    helpMessage.innerText =
      "Try opening the page using a recent version of Chrome on Android.";
  
    if (appRoot) {
      appRoot.appendChild(helpMessage);
    }
  }
  
  /**
   * Create and show a simple introduction message if the device supports
   * WebXR with immersive-ar mode.
   */
  export function displayIntroductionMessage() {
    const appRoot = document.getElementById("app-root");
  
    const bigMessage = document.createElement("h1");
    bigMessage.innerText = "Welcome! 👋";
  
    const middleMessage = document.createElement("p");
    middleMessage.innerText = "Press the button below to enter the AR experience.";
  
    const helpMessage = document.createElement("p");
    helpMessage.innerText =
      "Note: The app works best in a well lit environment, with enough space to move around.";
  
    helpMessage.style.fontSize = "16px";
    helpMessage.style.fontWeight = "bold";
    helpMessage.style.padding = "64px 64px 0px 64px";
    helpMessage.style.opacity = "0.8";
  
    if (appRoot) {
      appRoot.appendChild(bigMessage);
      appRoot.appendChild(middleMessage);
      appRoot.appendChild(helpMessage);
    }
  
    return () => {
      if (appRoot) {
        if (appRoot.contains(middleMessage)) {
          appRoot.removeChild(middleMessage);
        }
        if (appRoot.contains(bigMessage)) {
          appRoot.removeChild(bigMessage);
        }
        if (appRoot.contains(helpMessage)) {
          appRoot.removeChild(helpMessage);
        }
      }
    };
  }
  
  export default {
    browserHasImmersiveArCompatibility,
    displayIntroductionMessage,
    displayUnsupportedBrowserMessage,
  };