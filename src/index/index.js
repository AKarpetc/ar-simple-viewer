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
  const container = document.querySelector('#cards-row');
  container.replaceChildren();
  modelsInfo.filter(x => x.visible).forEach(cardData => {
    let card = document.createElement('div');
    card.classList.add('card', 'card-size');
    let img = document.createElement('img');
    img.src = cardData.imgLink;
    img.classList.add('card-img-top');
    img.alt = cardData.name;
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
    container.appendChild(card);
  });
}

window.searchModels = () => {
  const container = document.getElementById('search-input');
  const searchValue = container.value;

  if (searchValue === undefined || searchValue === null || searchValue === '') return;

  modelsInfo.forEach(x => {
    let isMatch = x.name.match(container.value);
    x.visible = isMatch ? true : false;
  });

  drawCardsByModels();
}

window.clearSearchResult = () => {
  const container = document.getElementById('search-input');
  modelsInfo.forEach(x => x.visible = true);
  container.value = '';
  drawCardsByModels();
}
