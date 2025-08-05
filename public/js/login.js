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

  setTimeout(() => {
    errorMessage.style.display = "none";
  }, 5000);

  document.querySelector(".glyphs").addEventListener("click", function () {
    window.location.href = "login"; // Change to the actual notebook URL
  });

  document.querySelector(".combos").addEventListener("click", function () {
    window.location.href = "login"; // Change to the actual glyphs URL
  });
});
