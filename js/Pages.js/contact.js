const form = document.getElementById("contact-form");
const name = document.getElementById("your-name");
const email = document.getElementById("your-email");
const subject = document.getElementById("your-subject");
const message = document.getElementById("your-message");
const errorMsg = document.querySelector(".error-message");

const isEmailValid = (email) => {
  const re =
    /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
  return re.test(String(email).toLowerCase());
};

const validateInputs = () => {
  let isValid = true;
  const nameValue = name.value.trim();
  const emailValue = email.value.trim();
  const subjectValue = subject.value.trim();
  const messageValue = message.value.trim();

  if (nameValue.length < 6) {
    setError(name, "Navnet må være på over 5 karakterer");
    isValid = false;
  } else {
    setSuccess(name);
  }

  if (emailValue === "") {
    setError(email, "Email er påkrevd");
    isValid = false;
  } else if (!isEmailValid(emailValue)) {
    setError(email, "Skriv inn en ekte email adresse");
    isValid = false;
  } else {
    setSuccess(email);
  }

  if (subjectValue.length < 6) {
    setError(subject, "Emnet må være på over 15 karakterer");
    isValid = false;
  } else {
    setSuccess(subject);
  }

  if (messageValue.length < 6) {
    setError(message, "Meldingen må være på over 25 karakterer");
    isValid = false;
  } else {
    setSuccess(message);
  }

  return isValid;
};

const setError = (element, message) => {
  const inputControl = element.parentElement;
  const errorMessage = inputControl.querySelector(".form-error");
  errorMessage.innerText = message;
};

const setSuccess = (element) => {
  const inputControl = element.parentElement;
  const errorMessage = inputControl.querySelector(".form-error");

  errorMessage.innerText = "";
  inputControl.classList.add("success");
  inputControl.classList.remove("form-error");
};

const formSubmissionHandler = (event) => {
  event.preventDefault();

  if (validateInputs()) {
    const formElement = event.target;
    const { action, method } = formElement;
    const body = new FormData(formElement);

    fetch(action, { method, body })
      .then(async (response) => {
        let payload = {};
        try {
          payload = await response.json();
        } catch {
          payload = { message: "Ukjent feil fra server." };
        }

        if (!response.ok) {
          throw new Error(
            payload.message || `Feil ved innsending (${response.status}).`,
          );
        }

        return payload;
      })
      .then((response) => {
        if (response.status === "mail_sent") {
          form.innerHTML = `<p class="success-form-message message-container">Meldingen din er mottatt, jeg prøver å svare innen 24timer :)</p>
            <a href="/contact/" class="new-contact-submission">Ønsker du å sende en ny melding?</a>`;
          form.reset();
        } else {
          errorMsg.innerHTML += `<p class="error-form-message message-container">${response.message}</p>`;
        }
      })
      .catch((error) => {
        errorMsg.innerHTML = `<p class="error-form-message message-container">${error.message}</p>`;
      });
  }
};

form.addEventListener("submit", formSubmissionHandler);
