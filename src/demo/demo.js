let cards = [];
let modelsInfo = [];

window.onload = async (_) => {
  enrichModels(await fetchModels());
  drawCardsByModels();
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

function LoadIfraime() {

  var imgs = [...document.getElementsByClassName("img-preview")];
  imgs.forEach(e => {
    e.style.display = "";
  })

  var ifrs = [...document.getElementsByClassName("ifr-preview")];
  ifrs.forEach(e => {
    e.remove();
  })

  let ifrm = document.createElement('iframe');
  ifrm.setAttribute("src", this.dataset.previewLink);
  ifrm.style.height = "200px";
  ifrm.classList.add("ifr-preview");

  var parent = this.parentElement;

  this.style.display = "none";
  parent.appendChild(ifrm);

  console.log(this);
}

function enrichModels(models) {
  models.forEach(model => {
    const modelAlias = model.alias;
    const modelName = model.name;
    const imgLink = model.preview;
    const gblLink = model.glb;
    const usdzLink = model.usdz;
    const viewerLink = `viewer.html?src=${gblLink}&ios-src=${usdzLink}&name=${modelName}&alias=${modelAlias}`;
    const configLink = `arconfigurator.html?android=${gblLink}&ios=${usdzLink}&name=${modelName}&alias=${modelAlias}`

    if (modelsInfo.find(x => x.name === modelName) === undefined) {
      modelsInfo.push({
        visible: true,
        name: modelName,
        imgLink: imgLink,
        viewerLink: viewerLink,
        configLink: configLink,
        source: model,
      });
    }
  });
}

function drawCardsByModels() {
  if (cards.length > 0) {
    redrawCards();
    return;
  }
  let id = 1;
  const cardsContainer = document.querySelector('#cards-row');
  modelsInfo.forEach(cardData => {
    const key = id++;
    console.log(key);
    cards.push({
      key: key,
      value: cardData
    });
    let card = document.createElement('div');
    card.classList.add('card', 'card-size');
    card.setAttribute("id", key);



    let img = document.createElement('img');
    img.setAttribute("src", cardData.source.preview);
    img.style.height = "200px";
    img.dataset.previewLink = cardData.source.previewLink;
    img.classList.add("img-preview");


    let ifrWrapper = document.createElement('div');
    ifrWrapper.style.height = "200px";
    ifrWrapper.classList.add("ifraime-wrapper");
    ifrWrapper.appendChild(img);

    img.addEventListener("click", LoadIfraime);

    let paddingDiv = document.createElement('div');
    paddingDiv.setAttribute("name", "padding");
    paddingDiv.setAttribute('style', 'padding: 10px;');

    let cardBody = document.createElement('div');
    cardBody.classList.add('card-body', 'card-body-text');

    let title = document.createElement('h4');
    title.classList.add('card-title');
    title.innerHTML = `<b>${cardData.name}</b>`;

    let viewLink = document.createElement('a');
    viewLink.href = cardData.source.previewLink;
    viewLink.classList.add('btn', 'btn-primary', 'd-flex', 'justify-content-center', 'mx-auto', 'mt-2');
    viewLink.textContent = 'Просмотр';

    let arconfiguratorLink = document.createElement('a');
    arconfiguratorLink.href = cardData.configLink;
    arconfiguratorLink.classList.add('justify-content-center');
    arconfiguratorLink.textContent = 'Настройка';

    cardBody.appendChild(title);
    cardBody.appendChild(viewLink);
    cardBody.appendChild(arconfiguratorLink);



    card.appendChild(ifrWrapper);

    // card.appendChild(ifrm);


    card.appendChild(cardBody);
    paddingDiv.appendChild(card);
    cardsContainer.appendChild(paddingDiv);
  });
}

function redrawCards() {
  if (cards.length > 0) {
    const visibleCards = cards.filter(x => x.value.visible);
    if (visibleCards.length === 1) {
      let els = document.getElementsByName("padding");
      els.forEach(el => {
        el.setAttribute('style', 'padding: 0px;');
        el.setAttribute('style', 'margin-top: 10px;');
      });
    }
    else {
      let els = document.getElementsByName("padding");
      els.forEach(el => {
        el.setAttribute('style', 'padding: 10px;');
      });
    }

    cards.forEach(x => {
      let el = document.getElementById(x.key);
      x.value.visible
        ? el.setAttribute('style', 'display: ;')
        : el.setAttribute('style', 'display: none;');
    });
  }
}

window.searchModels = () => {
  const searchInput = document.getElementById('search-input');
  const searchValue = searchInput.value;

  if (searchValue === undefined || searchValue === null || searchValue === '') {
    clearSearchResult();
    return;
  }

  const regex = new RegExp(searchValue, "i");
  modelsInfo.forEach(x => {
    let isMatch = x.name.match(regex);
    x.visible = isMatch ? true : false;
  });

  drawCardsByModels();
}

window.clearSearchResult = () => {
  const searchInput = document.getElementById('search-input');

  modelsInfo.forEach(x => x.visible = true);
  searchInput.value = '';
  drawCardsByModels();
}

window.sendEmail = () => {
  const emailInput = document.getElementById('email-input');
  const value = emailInput.value;

  if (value === undefined || value === null || value === '') {
    emailInput.classList.add('is-invalid');
    createEmailMsg('Вы не указали: "Адрес эл. почты"', ['alert-danger']);
    return;
  }

  if (!validateEmail(value)) {
    emailInput.classList.add('is-invalid');
    createEmailMsg('Не корректно введен: "Адрес эл. почты"', ['alert-danger']);
    return;
  }

  //ToDo использовать smtp для нам отправки уведомления
  createEmailMsg('В ближайшее время наш менеджер с Вами свяжется.', ['alert-primary']);
  emailInput.classList.remove('is-invalid');
}

function createEmailMsg(msg, classList = []) {
  const emailForm = document.getElementById('email-form');
  let emailErrMsg = document.createElement('div');
  emailErrMsg.classList.add('mt-2', 'fade', 'show', 'd-flex', 'alert', 'alert-dismissible');
  if (classList.length > 0) {
    classList.forEach(c => emailErrMsg.classList.add(c))
  }
  let div = document.createElement('div');
  div.innerHTML = msg;
  let button = document.createElement('button');
  button.classList.add('btn-close');
  button.setAttribute('type', 'button');
  button.setAttribute('data-bs-dismiss', 'alert');

  emailErrMsg.appendChild(div);
  emailErrMsg.appendChild(button);
  emailForm.appendChild(emailErrMsg);

  setTimeout(() => {
    emailErrMsg.remove();
  }, 3500);
}

validateEmail = (email) => {
  return email.match(
    /^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/
  );
};
