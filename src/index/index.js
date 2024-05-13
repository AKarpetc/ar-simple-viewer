let modelsInfo = [];

window.onload = async (_) => {
  enrichModels(await fetchModels());
  drawCardsByModels();
}

async function fetchModels() {
  let models = [];
  const regexModel = /\/models\//;

  await fetch(window.location.origin + '/models/')
    .then(response => response.text())
    .then(html => {
      const parser = new DOMParser();
      const doc = parser.parseFromString(html, 'text/html');
      const links = doc.querySelectorAll('a[href]');

      links.forEach(link => {
        const url = new URL(link.href);
        if (url.pathname.match(regexModel)) {
          let pathParts = url.pathname.split('/')
            .filter(x => x !== '');
          const modelName = pathParts[1];
          if (!models.includes(modelName)) {
            models.push(pathParts[1]);
          }
        }
      });
    })
    .catch(error => {
      console.error('Ошибка загрузки моделей:', error);
    });

  return models;
}

function enrichModels(models) {
  models.forEach(modelName => {
    const imgLink = `./models/${modelName}/img/${modelName}.jpg`;
    const gblLink = `./models/${modelName}/glb/${modelName}.glb`;
    const usdzLink = `./models/${modelName}/usdz/${modelName}.usdz`;
    const viewerLink = `viewer.html?src=${gblLink}&ios-src=${usdzLink}&name=${modelName}`;
    const configLink = `arconfigurator.html?android=${gblLink}&ios=${usdzLink}&name=${modelName}`

    if (modelsInfo.find(x => x.name === modelName) === undefined) {
      modelsInfo.push({
        visible: true,
        name: modelName,
        imgLink: imgLink,
        viewerLink: viewerLink,
        configLink: configLink
      });
    }
  });
}

function drawCardsByModels() {
  const cardsContainer = document.querySelector('#cards-row');
  cardsContainer.replaceChildren();
  modelsInfo.filter(x => x.visible).forEach(cardData => {
    let card = document.createElement('div');
    card.classList.add('card', 'card-size');
    let img = document.createElement('img');
    img.setAttribute('style', 'cursor: pointer;');
    img.onclick = () => window.open(cardData.viewerLink, '_self');
    img.src = cardData.imgLink;
    img.classList.add('card-img-top');
    img.alt = cardData.name;
    let paddingDiv = document.createElement('div');
    paddingDiv.setAttribute('style', 'padding: 10px;')
    let cardBody = document.createElement('div');
    cardBody.classList.add('card-body', 'card-body-text');
    let title = document.createElement('h4');
    title.classList.add('card-title');
    title.innerHTML = `<b>${cardData.name}</b>`;
    let viewerLink = document.createElement('a');
    viewerLink.href = cardData.viewerLink;
    viewerLink.classList.add('btn', 'btn-success', 'd-flex', 'justify-content-center', 'mx-auto');
    viewerLink.textContent = 'Просмотр';
    let arconfiguratorLink = document.createElement('a');
    arconfiguratorLink.href = cardData.configLink;
    arconfiguratorLink.classList.add('btn', 'btn-primary', 'd-flex', 'justify-content-center', 'mx-auto', 'mt-2');
    arconfiguratorLink.textContent = 'Настройки';

    cardBody.appendChild(title);
    cardBody.appendChild(viewerLink);
    cardBody.appendChild(arconfiguratorLink);
    card.appendChild(img);
    card.appendChild(cardBody);
    paddingDiv.appendChild(card);
    cardsContainer.appendChild(paddingDiv);
  });
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
