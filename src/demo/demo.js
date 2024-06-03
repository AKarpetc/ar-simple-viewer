let cards = [];
let typesInfo = [];
let modelsInfo = [];

window.onload = async (_) => {
  typesInfo = await fetchByKey('types');
  enrichModels(await fetchByKey('data'));
  drawCategoriesFilter();
  drawCardsByModels();
}

function createLiElement(dropdownMenu, type, allCount = null) {
  var newLi = document.createElement('li');
  var newA = document.createElement('a');
  type.type === 'allCategories' 
    ? newA.classList.add('disabled', 'dropdown-item') 
    : newA.classList.add('dropdown-item');
  newA.href = '#';
  var formCheckDiv = document.createElement('div');
  formCheckDiv.className = 'form-check';
  var inputCheckbox = document.createElement('input');
  inputCheckbox.className = 'form-check-input';
  inputCheckbox.type = 'checkbox';
  inputCheckbox.addEventListener('change', function(event) {
    type['active'] = event.target.checked;
    window.searchModels();
  });
  var label = document.createElement('label');
  label.className = 'form-check-label';
  label.textContent = allCount === null 
    ? type.name 
    : `${type.name} (${allCount})`;
  formCheckDiv.appendChild(inputCheckbox);
  formCheckDiv.appendChild(label);
  newA.appendChild(formCheckDiv);
  newLi.appendChild(newA);
  dropdownMenu.appendChild(newLi);
}

function createDividerLiElement(dropdownMenu) {
  var newLi = document.createElement('li');
  var hr = document.createElement('hr');
  hr.classList.add('dropdown-divider');
  newLi.appendChild(hr);
  dropdownMenu.appendChild(newLi);
}

function drawCategoriesFilter() {
  const dropdownMenu = document.getElementById('dropdown-menu');
  const allCategories = {name: 'Категории', type: 'allCategories'};
  createLiElement(dropdownMenu, allCategories, modelsInfo.length);
  createDividerLiElement(dropdownMenu);
  typesInfo.forEach(x => {
    const allCount = modelsInfo.filter(y => y.type === x).length;
    createLiElement(dropdownMenu, x, allCount);
  });
  typesInfo.push(allCategories);
}

async function fetchByKey(key) {
  let result;

  await fetch(window.location.origin + '/models/getModels.json')
    .then(response => response.json())
    .then(responce => {
      result = responce[key];
    })
    .catch(error => {
      console.error('Ошибка загрузки моделей:', error);
    });

  return result;
}

function loadIfraime() {
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
        type: typesInfo.find(x => x.type === model.type),
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

    img.addEventListener("click", loadIfraime);

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

    card.appendChild(cardBody);
    paddingDiv.appendChild(card);
    cardsContainer.appendChild(paddingDiv);
  });
}

function redrawCards() {
  if (cards.length > 0) {
    cards.forEach(x => {
      let el = document.getElementById(x.key);
      if (x.value.visible) {
        el.setAttribute('style', 'display: ;');
        el.parentElement.setAttribute('style', 'padding: 10px;');
      } else {
        el.setAttribute('style', 'display: none;');
        el.parentElement.setAttribute('style', 'padding: 0px;');
      }
    });
  }
}

window.searchModels = () => {
  const searchInput = document.getElementById('search-input');
  const searchValue = searchInput.value;
  const activeTypes = typesInfo.filter(x => x.active);

  const motValidSeachValue = searchValue === undefined || searchValue === null || searchValue === ''

  if (motValidSeachValue && activeTypes.length === 0) {
    clearSearchResult();
    return;
  }

  const regex = new RegExp(searchValue, "i");
  modelsInfo.forEach(x => {
    let isMatch = activeTypes.length > 0 
      ? !motValidSeachValue 
        ? x.name.match(regex) && activeTypes.includes(x.type) 
        : activeTypes.includes(x.type) 
      : x.name.match(regex);
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
