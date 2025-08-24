function showBetaTestMessage() {
  document.getElementById("error-message").textContent =
    "Due to the beta testing fase, this feature is currently unavailable. We apologize for the inconvenience.";
  document.getElementById("error-message").style.display = "flex";
  setTimeout(() => {
    document.getElementById("error-message").style.display = "none";
  }, 10000);
}

document.addEventListener("DOMContentLoaded", function () {
  const ghostPicture = document.getElementById("ghost");
  let minutes = 0.01;

  setTimeout(() => {
    ghostPicture.style.transition = "left 5s linear";
    ghostPicture.style.left = "0";
  }, minutes * 60 * 1000);

  // Handle register form submission
  const registerForm = document.getElementById("register-form");
  const registerButton = document.getElementById("register-button");
  const errorMessage = document.getElementById("error-message");

  registerButton.addEventListener("click", function (e) {
    e.preventDefault();
    const formData = new FormData(registerForm);
    errorMessage.style.display = "none";

    // Disable the button while registering
    registerButton.disabled = true;
    registerButton.textContent = "Creating account...";

    fetch("/api/register", {
      method: "POST",
      body: formData,
    })
      .then((response) => response.json())
      .then((data) => {
        if (data.success) {
          registerForm.reset();
          window.location.href = "glyphs";
        } else {
          errorMessage.textContent =
            data.message || "Registration failed. Please try again.";
          errorMessage.style.display = "block";
        }
      })
      .catch((error) => {
        console.error("Error:", error);
        alert("An error occurred during registration.");
      })
      .finally(() => {
        // Re-enable the button and restore text
        registerButton.disabled = false;
        registerButton.textContent = "Learn magic!";
      });
  });

  const loginForm = document.getElementById("login-form");
  const loginButton = document.getElementById("login-button");

  loginButton.addEventListener("click", function (e) {
    e.preventDefault();
    const formData = new FormData(loginForm);
    errorMessage.style.display = "none";
    loginButton.disabled = true;
    loginButton.textContent = "Logging in...";
    fetch("/api/login", {
      method: "POST",
      body: formData,
    })
      .then((response) => response.json())
      .then((data) => {
        if (data.success) {
          window.location.href = "glyphs"; // Redirect to home page on successful login
        } else {
          errorMessage.textContent =
            data.message || "Login failed. Please try again.";
          errorMessage.style.display = "block";
        }
      })
      .catch((error) => {
        console.error("Error:", error);
        alert("An error occurred during login.");
      })
      .finally(() => {
        loginButton.disabled = false;
        loginButton.textContent = "Learn magic!";
      });
  });

  setTimeout(() => {
    errorMessage.style.display = "none";
  }, 5000);

  document.querySelector(".glyphs").addEventListener("click", function () {
    window.location.href = "login"; // Change to the actual notebook URL
  });

  document.querySelector(".combos").addEventListener("click", function () {
    window.location.href = "login"; // Change to the actual glyphs URL
  });
  //hamburger menu click handler
  const hamburgerMenu = document.querySelector(".hamburger-menu");
  const dropdownContent = document.querySelector(".dropdown-content");
  if (hamburgerMenu && dropdownContent) {
    hamburgerMenu.addEventListener("click", () => {
      dropdownContent.classList.toggle("show");
      hamburgerMenu.classList.toggle("change");
    });
  }

  // show beta message for disabled features
  const disabledFeatures = document.querySelectorAll(".disabled-feature");
  disabledFeatures.forEach((element) => {
    element.addEventListener("click", showBetaTestMessage);
  });

  //close the dropdown if the user clicks outside of it
  window.onclick = function (event) {
    if (
      !event.target.matches(".hamburger-menu") &&
      !event.target.matches(".bar1") &&
      !event.target.matches(".bar2") &&
      !event.target.matches(".bar3")
    ) {
      if (dropdownContent.classList.contains("show")) {
        dropdownContent.classList.remove("show");
        hamburgerMenu.classList.remove("change");
      }
    }
  };
});
