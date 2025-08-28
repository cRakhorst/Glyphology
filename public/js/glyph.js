function showBetaTestMessage() {
  document.getElementById("error-message").textContent =
    "Due to the beta testing fase, this feature is currently unavailable. We apologize for the inconvenience.";
  document.getElementById("error-message").style.display = "flex";
  setTimeout(() => {
    document.getElementById("error-message").style.display = "none";
  }, 10000);
}

function initializeDisplayCanvas() {
  const displayCanvas = document.getElementById("display-canvas");
  if (!displayCanvas) return;

  const rect = displayCanvas.getBoundingClientRect();
  displayCanvas.width = rect.width;
  displayCanvas.height = rect.height;

  const ctx = displayCanvas.getContext("2d");

  // Extract glyph ID from current URL and fetch that specific glyph
  fetchAndDisplayGlyphFromUrl(ctx, displayCanvas);
}

function fetchAndDisplayGlyphFromUrl(ctx, canvas) {
  // Extract glyph ID from current URL
  const urlParts = window.location.pathname.split("/");
  const glyphId = urlParts[urlParts.length - 1];

  if (!glyphId || isNaN(glyphId)) {
    console.error("No valid glyph ID found in URL");
    return;
  }

  // Construct API URL - adjust path based on your project structure
  const apiUrl = `/api/show-glyph-from-id.php/${glyphId}`;

  fetch(apiUrl, {
    method: "GET",
    credentials: "same-origin",
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json",
    },
  })
    .then((response) => {
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      return response.text(); // Get as text first to see what we're receiving
    })
    .then((text) => {
      try {
        const data = JSON.parse(text);
        if (data.success && data.components) {
          renderGlyphComponents(ctx, canvas, data.components);
        } else {
          console.error("No glyph components to display:", data.message);
          ctx.clearRect(0, 0, canvas.width, canvas.height);
        }
      } catch (parseError) {
        console.error("JSON parse error:", parseError);
        console.error("Response was:", text);
      }
    })
    .catch((error) => {
      console.error("Error fetching glyph components:", error);
    });
}

function renderGlyphComponents(ctx, canvas, components) {
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  // Separate components by type
  const circles = [];
  const lines = [];
  const curvedLines = [];

  components.forEach((component) => {
    const coords = component.coordinates.split(",").map(parseFloat);

    switch (component.type) {
      case "circle":
        circles.push({
          x: coords[0],
          y: coords[1],
          radius: parseFloat(component.size),
        });
        break;

      case "line":
        lines.push({
          x1: coords[0],
          y1: coords[1],
          x2: coords[2],
          y2: coords[3],
        });
        break;

      case "curved_line":
        curvedLines.push({
          x1: coords[0],
          y1: coords[1],
          x2: coords[2],
          y2: coords[3],
          controlX: coords[4],
          controlY: coords[5],
        });
        break;
    }
  });

  // Draw straight lines
  lines.forEach((line) => {
    ctx.beginPath();
    ctx.moveTo(line.x1, line.y1);
    ctx.lineTo(line.x2, line.y2);
    ctx.strokeStyle = "black";
    ctx.lineWidth = 2;
    ctx.stroke();
  });

  // Draw curved lines
  curvedLines.forEach((line) => {
    ctx.beginPath();
    ctx.moveTo(line.x1, line.y1);
    ctx.quadraticCurveTo(line.controlX, line.controlY, line.x2, line.y2);
    ctx.strokeStyle = "black";
    ctx.lineWidth = 2;
    ctx.stroke();
  });

  // Draw circles
  circles.forEach((circle) => {
    ctx.beginPath();
    ctx.arc(circle.x, circle.y, circle.radius, 0, Math.PI * 2);
    ctx.strokeStyle = "black";
    ctx.lineWidth = 2;
    ctx.stroke();
  });
}

document.addEventListener("DOMContentLoaded", () => {
  setTimeout(initializeDisplayCanvas, 100);
  document.querySelector(".glyphs").addEventListener("click", function () {
    window.location.href = "glyphs";
  });

  document.querySelector(".combos").addEventListener("click", function () {
    showBetaTestMessage();
  });

  document
    .getElementById("heart-icon")
    .addEventListener("click", async function () {
      const heartIcon = this;
      const urlParts = window.location.pathname.split("/");
      const glyphId = urlParts[urlParts.length - 1];

      if (!glyphId || isNaN(glyphId)) {
        console.error("No valid glyph ID found in URL");
        return;
      }

      try {
        const response = await fetch("/api/toggle_glyph_favorite.php", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            glyph_id: glyphId,
          }),
          credentials: "same-origin",
        });

        const data = await response.json();

        if (data.success) {
          // Toggle heart icon
          if (heartIcon.src.endsWith("assets/pictures/heart-filled.png")) {
            heartIcon.src = "assets/pictures/heart-icon.png";
          } else {
            heartIcon.src = "assets/pictures/heart-filled.png";
          }

          // Update likes count if it exists on the page
          const likesElement = document.getElementById("like-count");
          if (likesElement) {
            if (data.likes_count == 1) {
              likesElement.textContent = data.likes_count + " like";
            } else {
              likesElement.textContent = data.likes_count + " likes";
            }
          }
        } else {
          console.error("Failed to toggle favorite:", data.message);
        }
      } catch (error) {
        console.error("Error toggling favorite:", error);
      }
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
