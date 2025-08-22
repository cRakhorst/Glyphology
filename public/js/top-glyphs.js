function initializeDisplayCanvas() {
  const displayCanvas = document.getElementById("display-canvas");
  if (!displayCanvas) return;

  const rect = displayCanvas.getBoundingClientRect();
  displayCanvas.width = rect.width;
  displayCanvas.height = rect.height;

  const ctx = displayCanvas.getContext("2d");

  fetchAndDisplayTopGlyph(ctx, displayCanvas);
}

function fetchAndDisplayTopGlyph(ctx, canvas) {
  // Default to position 0 (first/top glyph)
  fetchGlyphFromPosition(ctx, canvas, $position = 0);
}

function fetchGlyphFromPosition(ctx, canvas, position) {
  // Fetch glyph from specific position in the array
  const apiUrl = `/api/get-glyph-from-position.php?position=${position}`;

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
      return response.json();
    })
    .then((data) => {
      console.log('Received data:', data); // Log the data after parsing
      if (data.success && data.components) {
        // Render the glyph on canvas
        renderGlyphComponents(ctx, canvas, data.components);

        // Store current position for other functions to use
        window.currentGlyphPosition = position;
        window.currentGlyphId = data.glyph_id;

        // Update glyph information
        document.getElementById("glyph-title").textContent = data.title;
        document.getElementById(
          "inventor"
        ).textContent = `Created by: ${data.username}`;
        document.getElementById("description").textContent = data.description;

        // Update likes count
        const likesElement = document.getElementById("like-count");
        if (likesElement) {
          const likesText =
            data.likes === 1 ? `${data.likes} like` : `${data.likes} likes`;
          likesElement.textContent = likesText;
        }

        // Update heart icon
        const heartIcon = document.getElementById("heart-icon");
        if (heartIcon) {
          heartIcon.src = data.is_favorited
            ? "/assets/pictures/heart-filled.png"
            : "/assets/pictures/heart-icon.png";
        }
      } else {
        console.error("No glyph components to display:", data.message);
        ctx.clearRect(0, 0, canvas.width, canvas.height);
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

  document
    .getElementById("heart-icon")
    .addEventListener("click", async function () {
      const heartIcon = this;

      // Get the glyph ID from our stored window variable
      if (!window.currentGlyphId) {
        console.error("No current glyph ID available");
        return;
      }

      const glyphId = window.currentGlyphId;

      try {
        const toggleResponse = await fetch("/api/toggle_glyph_favorite.php", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            glyph_id: glyphId,
          }),
          credentials: "same-origin",
        });

        const data = await toggleResponse.json();

        if (data.success) {
          // Toggle heart icon
          if (heartIcon.src.endsWith("/assets/pictures/heart-filled.png")) {
            heartIcon.src = "/assets/pictures/heart-icon.png";
          } else {
            heartIcon.src = "/assets/pictures/heart-filled.png";
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
});
