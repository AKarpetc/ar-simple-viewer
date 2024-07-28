const dialogContainer = document.getElementById('dialog-container');
const dialogTitle = document.getElementById('dialog-title');
const openDialogButton = document.getElementById('open-dialog');
const dialogText = document.getElementById('dialog-text');
const openDialogButton2 = document.getElementById('open-dialog2');
const closeDialogButton = document.getElementById('close-dialog');
const cancelDialogButton = document.getElementById('cancel-dialog');
const confirmDialogButton = document.getElementById('confirm-dialog');
const dialogInput = document.getElementById('dialog-input');

function openDialog(x) {
    switch (x.srcElement.id) {
        case "open-dialog2":
            dialogTitle.innerHTML = "Тариф Pro";
            dialogText.innerHTML = "Тариф Pro - включает Lite и позволяет задействовать всю мощь XR технологии. <br> Из преимуществ: <br> - ежемесечно бесплатно выдается 10 жетонов на создание моделей по Вашим фото. Если модели не создаются то жетоны сгорают. Если моделей больше 10 в мес. оплата по тарифу Lite за модель. <br> - скидка не более 15% на просмотры относительно тарифа Lite. <br> - конфигуратор 3D просмотра (обсуждается индивидуально). <br> - кастомизация с XR (обсуждается индивидуально).";
            break;
        case "open-dialog":
            dialogTitle.innerHTML = "Тариф Lite";
            dialogText.innerHTML = "Тариф Lite - предлагает решение проверенное временем за меньшие деньги. <br> Из преимуществ: <br> - менее затратное изготовление моделей по Вашим фото, одна модель - один платеж от 3 000<sup>₽</sup> в зависимости от сложности. <br> - последущая оплата за клик т.е за фактическое взаимодействие пользователя с 3D моделью (не менее 7<sup>₽</sup> за клик). <br> - статистика по просмотрам моделей. <br> - экспорт созданных 3D моделей. <br> - высокая скорость загрузки 3D моделей для просмотра."
            break;
    }

    dialogTitle.value = x.srcElement.id

    dialogContainer.classList.remove('hidden');
}

function closeDialog() {
    dialogContainer.classList.add('hidden');
}

openDialogButton.addEventListener('click', x => openDialog(x));
openDialogButton2.addEventListener('click', x => openDialog(x));
closeDialogButton.addEventListener('click', closeDialog);
cancelDialogButton.addEventListener('click', closeDialog);

confirmDialogButton.addEventListener('click', () => {
    const userInput = dialogInput.value;
    // ToDo validate and use smtp server where send button with email or phone value
    if (userInput) {

    } else {

    }
    closeDialog();
});
