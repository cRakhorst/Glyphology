let currentPosition = 0; // Global variable to track current glyph position
let totalGlyphCount = 0; // Global variable to track total number of glyphs

function initializeDisplayCanvas() {
  // Initialize left canvas
  const displayCanvas = document.getElementById("display-canvas");
  if (displayCanvas) {
    const rect = displayCanvas.getBoundingClientRect();
    displayCanvas.width = rect.width;
    displayCanvas.height = rect.height;
  }

  // Initialize right canvas
  const displayCanvasRight = document.getElementById("display-canvas-right");
  if (displayCanvasRight) {
    const rect = displayCanvasRight.getBoundingClientRect();
    displayCanvasRight.width = rect.width;
    displayCanvasRight.height = rect.height;
  }

  // Fetch total count first, then load glyphs
  fetchTotalGlyphCount().then(() => {
    fetchAndDisplayBothGlyphs();
  });
}

async function fetchTotalGlyphCount() {
  try {
    const response = await fetch("/api/get-total-glyphs.php", {
      method: "GET",
      credentials: "same-origin",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
      },
    });

    const data = await response.json();
    if (data.success) {
      totalGlyphCount = data.total_count;
      console.log(`Total glyph count: ${totalGlyphCount}`);
    } else {
      console.error("Failed to fetch total glyph count:", data.message);
      totalGlyphCount = 0;
    }
  } catch (error) {
    console.error("Error fetching total glyph count:", error);
    totalGlyphCount = 0;
  }
}

function fetchAndDisplayBothGlyphs() {
  // Fetch left glyph (current position)
  const leftCanvas = document.getElementById("display-canvas");
  if (leftCanvas) {
    const ctx = leftCanvas.getContext("2d");
    fetchGlyphFromPosition(ctx, leftCanvas, currentPosition, "left");
  }

  // Fetch right glyph (current position + 1)
  const rightCanvas = document.getElementById("display-canvas-right");
  if (rightCanvas) {
    const ctx = rightCanvas.getContext("2d");
    fetchGlyphFromPosition(ctx, rightCanvas, currentPosition + 1, "right");
  }
}

function fetchGlyphFromPosition(ctx, canvas, position, side = "left") {
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
      console.log(
        `Response status for ${side} (position ${position}):`,
        response.status
      );

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      return response.text();
    })
    .then((text) => {
      try {
        const data = JSON.parse(text);

        if (data.success && data.components) {
          // Render the glyph on canvas
          renderGlyphComponents(ctx, canvas, data.components);

          // Store current glyph info based on side
          if (side === "left") {
            window.currentGlyphPosition = position;
            window.currentGlyphId = data.glyph_id;

            // Update left page elements
            updateGlyphInfo(data, "");
          } else {
            window.rightGlyphId = data.glyph_id;

            // Update right page elements
            updateGlyphInfo(data, "-right");
          }
        } else {
          console.error(
            `No glyph components to display for ${side}:`,
            data.message
          );
          ctx.clearRect(0, 0, canvas.width, canvas.height);

          // Clear the info and show "no glyph available" message
          if (side === "left") {
            window.currentGlyphId = null;
            showNoGlyphMessage("");
          } else {
            window.rightGlyphId = null;
            showNoGlyphMessage("-right");
          }
        }
      } catch (parseError) {
        console.error(
          `JSON parse error for ${side} (position ${position}):`,
          parseError
        );
        console.error(`Response was:`, text);

        // Clear canvas and show "no glyph available" message on parse error
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        if (side === "left") {
          window.currentGlyphId = null;
          showNoGlyphMessage("");
        } else {
          window.rightGlyphId = null;
          showNoGlyphMessage("-right");
        }
      }
    })
    .catch((error) => {
      console.error(
        `Error fetching glyph components for ${side} (position ${position}):`,
        error
      );

      // Clear canvas and show "no glyph available" message on fetch error
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      if (side === "left") {
        window.currentGlyphId = null;
        showNoGlyphMessage("");
      } else {
        window.rightGlyphId = null;
        showNoGlyphMessage("-right");
      }
    });
}

function updateGlyphInfo(data, suffix) {
  // Update glyph information
  const titleElement = document.getElementById(`glyph-title${suffix}`);
  const inventorElement = document.getElementById(`inventor${suffix}`);
  const descriptionElement = document.getElementById(`description${suffix}`);
  const likesElement = document.getElementById(`like-count${suffix}`);
  const heartIcon = document.getElementById(`heart-icon${suffix}`);

  if (titleElement) titleElement.textContent = data.title || "";
  if (inventorElement)
    inventorElement.textContent = `Created by: ${data.username || ""}`;
  if (descriptionElement)
    descriptionElement.textContent = data.description || "";

  // Update likes count
  if (likesElement) {
    const likesText =
      data.likes === 1 ? `${data.likes} like` : `${data.likes} likes`;
    likesElement.textContent = likesText;
  }

  // Update heart icon (you'll need to add is_favorited to your PHP response)
  if (heartIcon) {
    heartIcon.src = data.is_favorited
      ? "/assets/pictures/heart-filled.png"
      : "/assets/pictures/heart-icon.png";
  }
}

function showNoGlyphMessage(suffix) {
  const titleElement = document.getElementById(`glyph-title${suffix}`);
  const inventorElement = document.getElementById(`inventor${suffix}`);
  const descriptionElement = document.getElementById(`description${suffix}`);
  const likesElement = document.getElementById(`like-count${suffix}`);

  if (titleElement) titleElement.textContent = "No glyph available";
  if (inventorElement) inventorElement.textContent = "Created by: none";
  if (descriptionElement)
    descriptionElement.textContent =
      "There are no more glyphs to display at this position. Try navigating back or create your own glyph to add to the collection!";
  if (likesElement) likesElement.textContent = "0 likes";
}

function clearGlyphInfo(suffix) {
  const titleElement = document.getElementById(`glyph-title${suffix}`);
  const inventorElement = document.getElementById(`inventor${suffix}`);
  const descriptionElement = document.getElementById(`description${suffix}`);
  const likesElement = document.getElementById(`like-count${suffix}`);

  if (titleElement) titleElement.textContent = "";
  if (inventorElement) inventorElement.textContent = "";
  if (descriptionElement) descriptionElement.textContent = "";
  if (likesElement) likesElement.textContent = "";
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
async function toggleGlyphFavorite(heartIcon, glyphId, likeCountElementId) {
  if (!glyphId) {
    console.error("No glyph ID available");
    return;
  }

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
      const likesElement = document.getElementById(likeCountElementId);
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
}

document.addEventListener("DOMContentLoaded", () => {
  setTimeout(initializeDisplayCanvas, 100);

  // Left heart icon click handler
  document
    .getElementById("heart-icon")
    .addEventListener("click", async function () {
      // Only allow liking if there's a valid glyph
      if (window.currentGlyphId) {
        await toggleGlyphFavorite(this, window.currentGlyphId, "like-count");
      }
    });

  // Right heart icon click handler
  const rightHeartIcon = document.getElementById("heart-icon-right");
  if (rightHeartIcon) {
    rightHeartIcon.addEventListener("click", async function () {
      // Only allow liking if there's a valid glyph
      if (window.rightGlyphId) {
        await toggleGlyphFavorite(
          this,
          window.rightGlyphId,
          "like-count-right"
        );
      }
    });
  }

  // Add navigation functionality
  const backArrow = document.querySelector(".back-arrow");
  const forwardArrow = document.querySelector(".forward-arrow");

  if (backArrow) {
    backArrow.addEventListener("click", () => {
      if (currentPosition > 0) {
        currentPosition -= 2;
        fetchAndDisplayBothGlyphs();
        updateNavigationState();
      }
    });
  }

  if (forwardArrow) {
    forwardArrow.addEventListener("click", () => {
      // Check if we can move forward (ensure we don't go beyond available glyphs)
      if (currentPosition + 2 < totalGlyphCount) {
        currentPosition += 2;
        fetchAndDisplayBothGlyphs();
        updateNavigationState();
      }
    });
  }
});
