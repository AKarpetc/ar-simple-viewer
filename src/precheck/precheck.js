import modelUtils from "../common/utils/modelUtils.js"

let cards = [];
let modelsInfo = [];
const mainGuid = 'ab9a9d67-f0fd-4d5b-a994-5fe2a0be8bf2';
const urlParams = new URLSearchParams(window.location.search);

const ids = urlParams.get('ids');
let parsedIds = null;
try {
    parsedIds = JSON.parse(ids);
}
catch (err) {
    console.log(err)
}

window.addEventListener('load', async function () {
    window.loaderShow();
    var infos = await modelUtils.getObjectByGUID(mainGuid);
    modelsInfo = JSON.parse((infos).modelsInfos);
    drawHOne();
    drawCardsByModels();
    window.loaderHide();

    const searchInput = document.getElementById('cards-row');
    searchInput.childNodes.forEach(x => {
        const button = x.querySelector('.remove-item');

        button.addEventListener('click', function () {
            this.parentElement.parentElement.parentElement.remove();
        });
    });

    document.querySelector('.btn-secondary').addEventListener('click', function () {
        alert('Действие отменено');
    });

    document.querySelector('.btn-primary').addEventListener('click', function () {
        alert('Добавлено в корзину');
    });
});

function drawHOne() {
    const cardsContainers = document.querySelector('#cards-all');
    let h1 = document.createElement('h1');
    h1.classList.add('text-center', 'mb-4');
    h1.innerText = `Выбранно (${modelsInfo.length}) позиций:`
    const lastElementChild = cardsContainers.lastElementChild;
    cardsContainers.removeChild(lastElementChild);
    cardsContainers.appendChild(h1);
    cardsContainers.appendChild(lastElementChild);
}

function drawCardsByModels() {
    let id = 1;
    const cardsContainer = document.querySelector('#cards-row');
    modelsInfo.forEach(cardData => {
        if (parsedIds && !parsedIds.find(x => x === cardData.id)) return;

        const key = id++;
        cards.push({
            key: key,
            value: cardData
        });
        let card = document.createElement('div');
        card.classList.add('card', 'chart-card');
        card.setAttribute("id", key);

        let img = document.createElement('img');
        img.setAttribute("src", cardData.imgLink);
        img.style.height = "200px";
        img.dataset.previewLink = `/viewer.html?id=${cardData.id}`;
        img.classList.add("img-preview");

        let ifrWrapper = document.createElement('div');
        ifrWrapper.style.height = "200px";
        ifrWrapper.classList.add("ifraime-wrapper");
        ifrWrapper.appendChild(img);

        let paddingDiv = document.createElement('div');
        paddingDiv.setAttribute("name", "padding");
        paddingDiv.setAttribute('style', 'padding: 10px;');

        let cardBody = document.createElement('div');
        cardBody.classList.add('card-body', 'card-body-text');

        let title = document.createElement('h4');
        title.classList.add('card-title');
        title.innerHTML = `<b>${cardData.name}</b>`;

        let deleteButton = document.createElement('button');
        deleteButton.href = cardData.configLink;
        deleteButton.classList.add('btn', 'btn-danger', 'btn-sm', 'remove-item');
        deleteButton.setAttribute("id", 'remove-item');

        let deleteButtonIcon = document.createElement('i');
        deleteButtonIcon.classList.add('bi', 'bi-x');
        deleteButton.appendChild(deleteButtonIcon);

        cardBody.appendChild(title);
        cardBody.appendChild(deleteButton);

        card.appendChild(ifrWrapper);

        card.appendChild(cardBody);
        paddingDiv.appendChild(card);
        cardsContainer.appendChild(paddingDiv);
    });
}