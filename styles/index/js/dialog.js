let messages = [];
const successTimeOut = 1500;
const dialogContainer = document.getElementById('dialog-container');
const dialogTitle = document.getElementById('dialog-title');
const openDialogButton = document.getElementById('open-dialog');
const dialogText = document.getElementById('dialog-text');
const openDialogButton2 = document.getElementById('open-dialog2');
const closeDialogButton = document.getElementById('close-dialog');
const cancelDialogButton = document.getElementById('cancel-dialog');
const confirmDialogButton = document.getElementById('confirm-dialog');
const confirmDialogButton2 = document.getElementById('confirm-dialog2');
const dialogInput = document.getElementById('dialog-input');
const dialogInput2 = document.getElementById('dialog-input2');

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

confirmDialogButton2.addEventListener('click', () => {
    trySend(dialogInput2.value, 'email-form2');
});

confirmDialogButton.addEventListener('click', () => {
    trySend(dialogInput.value, 'email-form');
});

function trySend(userInput, formId, value = '') {
    // ToDo validate and use smtp server where send button with email or phone value
    console.log(userInput)
    if (userInput && validateEmail(userInput)) {
        messages.forEach(x => x?.remove());
        messages = [];
        createEmailMsg(formId, 'В ближайшее время наш менеджер с Вами свяжется.', successTimeOut);
        setTimeout(() => {
            closeDialog();
        }, successTimeOut);
    }
    else {
        createEmailMsg(formId, 'Ошибка emeil адреса.', 3500, true);
    }
}

function createEmailMsg(formId, msg, timeOut, isError = false) {
    const emailForm = document.getElementById(formId);
    let emailErrMsg = document.createElement('div');
    emailErrMsg.classList.add('mt-2', 'fade', 'show', 'd-flex', 'alert', 'alert-dismissible');
    let div = document.createElement('div');
    div.innerHTML = msg;
    div.style.setProperty("color", isError ? "red" : "#57ca67");

    messages.push(emailErrMsg);

    emailErrMsg.appendChild(div);
    emailForm.appendChild(emailErrMsg);

    setTimeout(() => {
        emailErrMsg.remove();
    }, timeOut);
}

function validateEmail(email) {
    return email.match(
        /^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/
    );
};
