import sessionUtils from "../common/utils/sessionUtils.js";
import smtpUtils from "../common/utils/smtpUtils.js";

const key = 'localId';
window.onload = async () => {
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
        console.error(err);
    }

    // Функции валидации и отправки формы
    function validateContactForm(nameInput, contactInput, consentCheckbox, submitButtons, consentContainer) {
        function validateInput(input) {
            let errorMessage = input.nextElementSibling;
            if (!errorMessage || !errorMessage.classList.contains("error-message")) {
                errorMessage = document.createElement("div");
                errorMessage.classList.add("error-message");
                input.parentNode.appendChild(errorMessage);
            }

            if (input.value.trim() === "") {
                errorMessage.textContent = "Это поле обязательно для заполнения";
                input.classList.add("is-invalid");
                return false;
            } else {
                errorMessage.textContent = "";
                input.classList.remove("is-invalid");
                return true;
            }
        }

        function validateContact(input) {
            let errorMessage = input.nextElementSibling;
            if (!errorMessage || !errorMessage.classList.contains("error-message")) {
                errorMessage = document.createElement("div");
                errorMessage.classList.add("error-message");
                input.parentNode.appendChild(errorMessage);
            }

            const value = input.value.trim();
            const emailPattern = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
            const phonePattern = /^(\+7|8)?[\s-]?\(?\d{3}\)?[\s-]?\d{3}[\s-]?\d{2}[\s-]?\d{2}$/;

            if (!emailPattern.test(value) && !phonePattern.test(value)) {
                errorMessage.textContent = "Введите корректный телефон или email";
                input.classList.add("is-invalid");
                return false;
            } else {
                errorMessage.textContent = "";
                input.classList.remove("is-invalid");
                return true;
            }
        }

        function validateCheckbox(checkbox) {
            let errorMessage = consentContainer.nextElementSibling;

            if (errorMessage && errorMessage.classList.contains("error-message")) {
                errorMessage.remove();
            }

            if (!checkbox.checked) {
                errorMessage = document.createElement("div");
                errorMessage.classList.add("error-message", "alert", "alert-danger", "mt-3");
                errorMessage.textContent = "Вы должны дать согласие на обработку персональных данных";
                consentContainer.parentNode.insertBefore(errorMessage, consentContainer.nextSibling);
                return false;
            }
            return true;
        }

        function validateForm(event) {
            event.preventDefault();
            const isNameValid = validateInput(nameInput);
            const isContactValid = validateContact(contactInput);
            const isConsentGiven = validateCheckbox(consentCheckbox);
            const consentTarif = document.getElementById("modal-formGroupExampleInput3");


            if (isNameValid && isContactValid && isConsentGiven) {
                smtpUtils.send({
                    name: nameInput.value,
                    contact: contactInput.value,
                    agreement: consentCheckbox.checked,
                    tarif: consentTarif.value
                }, 'Заявка с главной страницы')
                .then(() => {
                    // Создаём Bootstrap-стильное уведомление
                    let successMessage = document.createElement("div");
                    successMessage.classList.add("alert", "alert-success", "mt-3");
                    successMessage.textContent = "Ваше сообщение успешно отправлено!";
            
                    // Вставляем сообщение после контейнера формы
                    consentContainer.parentNode.insertBefore(successMessage, consentContainer.nextSibling);
            
                    // Удаляем сообщение через 3 секунды
                    setTimeout(() => {
                        successMessage.remove();
                    }, 3000);
            
                    // Очищаем поля формы
                    nameInput.value = "";
                    contactInput.value = "";
                    nameInput.classList.remove("is-invalid");
                    contactInput.classList.remove("is-invalid");
            
                    // Удаляем сообщения об ошибках
                    document.querySelectorAll(".error-message").forEach(error => error.remove());
                })
                .catch(() => {
                    console.error("Ошибка при отправке сообщения.");
                });
            }
            

        }

        submitButtons.forEach(button => {
            button.addEventListener("click", validateForm);
        });
    }

    const nameInput = document.getElementById("formGroupExampleInput");
    const contactInput = document.getElementById("formGroupExampleInput2");
    const consentCheckbox = document.getElementById("flexCheckChecked2");
    const consentContainer = consentCheckbox.closest(".all-form-check");
    const submitButtons = document.querySelectorAll(".empty-send-btn");

    const nameInput2 = document.getElementById("modal-formGroupExampleInput");
    const contactInput2 = document.getElementById("modal-formGroupExampleInput2");
    const consentCheckbox2 = document.getElementById("modal-flexCheckChecked2");
    const consentTarif = document.getElementById("modal-formGroupExampleInput3");
    const consentContainer2 = consentCheckbox2.closest(".modal-form-check");
    const submitButtons2 = document.querySelectorAll(".modal-btn");

    validateContactForm(nameInput, contactInput, consentCheckbox, submitButtons, consentContainer);
    validateContactForm(nameInput2, contactInput2, consentCheckbox2, submitButtons2, consentContainer2);
};
