document.addEventListener("DOMContentLoaded", function () {
  const ghostPicture = document.getElementById("ghost");
  let minutes = 5;

  if (ghostPicture) {
    setTimeout(() => {
      ghostPicture.style.transition = "left 5s linear";
      ghostPicture.style.left = "0";
    }, minutes * 60 * 1000);
  }

  // document.querySelector('.arrow').addEventListener('click', function() {
  //     window.location.href = 'login'; // Change to the actual next page URL
  // });

  document.querySelector(".glyphs").addEventListener("click", function () {
    window.location.href = "login"; // Change to the actual notebook URL
  });

  document.querySelector(".combos").addEventListener("click", function () {
    window.location.href = "login"; // Change to the actual glyphs URL
  });
  
  const canvas = document.getElementById("glyph-canvas");
  if (!canvas || typeof glyphComponents === "undefined") return;

  const ctx = canvas.getContext("2d");
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  glyphComponents.forEach((comp) => {
    const coords = parseCoords(comp.coordinates);
    ctx.save();
    ctx.strokeStyle = "black";
    ctx.lineWidth = 2;

    switch (comp.type.toLowerCase()) {
      case "circle":
        ctx.beginPath();
        ctx.arc(coords.x, coords.y, coords.radius || 20, 0, Math.PI * 2);
        ctx.stroke();
        break;
      case "triangle":
        drawTriangle(ctx, coords.x, coords.y, coords.size || 40);
        break;
      case "line":
        ctx.beginPath();
        ctx.moveTo(coords.x1, coords.y1);
        ctx.lineTo(coords.x2, coords.y2);
        ctx.stroke();
        break;
      // voeg extra types toe als je wilt
    }

    ctx.restore();
  });

  function parseCoords(coordStr) {
    const obj = {};
    const parts = coordStr.split(";");
    parts.forEach((part) => {
      const [key, val] = part.split(":").map((p) => p.trim());
      if (key && val) {
        const nums = val.match(/-?\d+(\.\d+)?/g);
        if (!nums) return;
        if (nums.length === 1) obj[key] = parseFloat(nums[0]);
        else if (nums.length === 2) {
          obj[key + "x"] = parseFloat(nums[0]);
          obj[key + "y"] = parseFloat(nums[1]);
          obj.x = parseFloat(nums[0]);
          obj.y = parseFloat(nums[1]);
        }
      }
    });
    return obj;
  }

  function drawTriangle(ctx, x, y, size) {
    const height = (size * Math.sqrt(3)) / 2;
    ctx.beginPath();
    ctx.moveTo(x, y - height / 2);
    ctx.lineTo(x - size / 2, y + height / 2);
    ctx.lineTo(x + size / 2, y + height / 2);
    ctx.closePath();
    ctx.stroke();
  }
});
