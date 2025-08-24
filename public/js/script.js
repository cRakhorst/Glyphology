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

  document.querySelector(".arrow").addEventListener("click", function () {
    window.location.href = "login"; // Change to the actual next page URL
  });

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
