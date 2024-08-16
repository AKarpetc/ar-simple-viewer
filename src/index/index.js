import sessionUtils from "../common/utils/sessionUtils.js"

const key = 'localId';
window.onload = async (_) => {
    try {
        await sessionUtils.init();
        const storage = JSON.parse(localStorage.getItem(key));
        const modelsInfo = storage.mainCollection.data;
        const randomIndex = Math.floor(Math.random() * modelsInfo.length);
        const defaultModel = modelsInfo[randomIndex];
        var el = document.getElementById('demo-ifr2');
        el.setAttribute('src', `./viewer.html?id=${defaultModel.id}`);
    }
    catch (err) {
        // alert(err)
    }
}