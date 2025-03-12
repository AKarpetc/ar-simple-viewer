import sessionUtils from "../common/utils/sessionUtils.js"

const key = 'localId';
window.onload = async (_) => {
    try {
        await sessionUtils.init();
        const storage = JSON.parse(localStorage.getItem(key));
        const modelsInfo = storage.mainCollection.data;
        const randomIndex = Math.floor(Math.random() * modelsInfo.length);
        const defaultModel = modelsInfo[randomIndex];
        var els = document.getElementsByClassName('ar-preview');

        if (window.innerWidth > 767) {
            for (let i = 0; i < els.length; i++) {
                if (els[i].classList.contains('demo-ifr')) {
                    els[i].setAttribute('src', `./viewer.html?id=${defaultModel.id}`);
                    break;
                }
            }
        } else {
            for (let i = 0; i < els.length; i++) {
                if (els[i].classList.contains('demo-ifr2')) {
                    els[i].setAttribute('src', `./viewer.html?id=${defaultModel.id}`);
                    break;
                }
            }
        }
    }
    catch (err) {
        // alert(err)
    }
}