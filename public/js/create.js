document.addEventListener("DOMContentLoaded", function () {
  const ghostPicture = document.getElementById("ghost");
  let minutes = 5;

  if (ghostPicture) {
    setTimeout(() => {
      ghostPicture.style.transition = "left 5s linear";
      ghostPicture.style.left = "0";
    }, minutes * 60 * 1000);
  }

  // Navigatie
  document.querySelector(".glyphs").addEventListener("click", function () {
    window.location.href = "glyphs";
  });

  document.querySelector(".combos").addEventListener("click", function () {
    window.location.href = "combos";
  });

  document.getElementById("cross").addEventListener("click", function () {
    document.querySelector(".choose").style.display = "none";
  });

  // Glyph tekenen
  const glyphCanvas = document.getElementById("glyph-canvas");
  if (!glyphCanvas || typeof glyphComponents === "undefined") return;

  const glyphctx = glyphCanvas.getContext("2d");
  glyphctx.clearRect(0, 0, glyphCanvas.width, glyphCanvas.height);

  glyphComponents.forEach((comp) => {
    const coords = parseCoords(comp.coordinates);
    glyphctx.save();
    glyphctx.strokeStyle = "black";
    glyphctx.lineWidth = 2;

    switch (comp.type.toLowerCase()) {
      case "circle":
        glyphctx.beginPath();
        glyphctx.arc(coords.x, coords.y, coords.radius || 20, 0, Math.PI * 2);
        glyphctx.stroke();
        break;
      case "triangle":
        drawTriangle(glyphctx, coords.x, coords.y, coords.size || 40);
        break;
      case "line":
        glyphctx.beginPath();
        glyphctx.moveTo(coords.x1, coords.y1);
        glyphctx.lineTo(coords.x2, coords.y2);
        glyphctx.stroke();
        break;
    }

    glyphctx.restore();
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

  function drawTriangle(glyphctx, x, y, size) {
    const height = (size * Math.sqrt(3)) / 2;
    glyphctx.beginPath();
    glyphctx.moveTo(x, y - height / 2);
    glyphctx.lineTo(x - size / 2, y + height / 2);
    glyphctx.lineTo(x + size / 2, y + height / 2);
    glyphctx.closePath();
    glyphctx.stroke();
  }

  // Setup combo canvas
  const canvas = document.getElementById("combo-canvas");
  const rect = canvas.getBoundingClientRect();
  canvas.width = rect.width;
  canvas.height = rect.height;
  const HANDLE_ANGLE = (-22.5 * Math.PI) / 180;

  const ctx = canvas.getContext("2d");

  let selectedOption = null;
  let activeCircle = null;
  let activeDotIndex = null;
  let draggingLine = null;
  let draggingEndpoint = null;
  let activeLineEndpoint = null; // Nieuw: voor het bijhouden van het actieve lijn-eindpunt

  const center = { x: canvas.width / 2, y: canvas.height / 2 };

  const circles = [
    {
      x: center.x,
      y: center.y,
      radius: 0,
      draggingHandle: false,
      visible: false,
      usedDots: [],
    },
  ];

  const lines = [];

  function isInsideCircle(x, y, cx, cy, radius = 5) {
    return Math.hypot(x - cx, y - cy) < radius;
  }

  function moveLineAndChildren(line, newX, newY) {
    line.x2 = newX;
    line.y2 = newY;

    if (line.attachedCircle) {
      line.attachedCircle.x = newX;
      line.attachedCircle.y = newY;
      updateChildPositions(line.attachedCircle);
    }

    lines.forEach((childLine) => {
      if (childLine.parentLine === line) {
        childLine.x1 = newX;
        childLine.y1 = newY;
      }
    });
  }

  function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    lines.forEach((line) => {
      ctx.beginPath();
      ctx.moveTo(line.x1, line.y1);

      if (line.controlX !== undefined && line.controlY !== undefined) {
        ctx.quadraticCurveTo(line.controlX, line.controlY, line.x2, line.y2);
      } else {
        ctx.lineTo(line.x2, line.y2);
      }

      ctx.strokeStyle = "black";
      ctx.lineWidth = 2;
      ctx.stroke();

      ctx.beginPath();
      ctx.arc(line.x2, line.y2, 5, 0, Math.PI * 2);
      ctx.fillStyle = "blue";
      ctx.fill();
    });

    circles.forEach((circle) => {
      if (circle.radius === 0 && !circle.visible && !circle.used) {
        ctx.beginPath();
        ctx.arc(circle.x, circle.y, 5, 0, Math.PI * 2);
        ctx.fillStyle = "black";
        ctx.fill();
      }

      if (circle.visible) {
        ctx.beginPath();
        ctx.arc(circle.x, circle.y, circle.radius, 0, Math.PI * 2);
        ctx.strokeStyle = "black";
        ctx.lineWidth = 2;
        ctx.stroke();

        const handleX = circle.x + circle.radius * Math.cos(HANDLE_ANGLE);
        const handleY = circle.y + circle.radius * Math.sin(HANDLE_ANGLE);
        ctx.beginPath();
        ctx.arc(handleX, handleY, 6, 0, Math.PI * 2);
        ctx.fillStyle = "blue";
        ctx.fill();

        for (let i = 0; i < 8; i++) {
          if (circle.usedDots.includes(i)) continue;

          const angle = (i * Math.PI) / 4;
          const x = circle.x + circle.radius * Math.cos(angle);
          const y = circle.y + circle.radius * Math.sin(angle);

          ctx.beginPath();
          ctx.arc(x, y, 4, 0, Math.PI * 2);
          ctx.fillStyle = "black";
          ctx.fill();
        }
      }
    });
  }

  document.getElementById("circle").addEventListener("click", function () {
    if (activeCircle) {
      activeCircle.visible = true;
      activeCircle.radius = 30;

      if (activeCircle.isLineEndpoint && activeCircle.connectedLine) {
        activeCircle.connectedLine.x2 = activeCircle.x;
        activeCircle.connectedLine.y2 = activeCircle.y;
      }

      draw();
      activeCircle = null;
      activeDotIndex = null;
    }
    selectedOption = null;
    document.querySelector(".choose").style.display = "none";
  });

  canvas.addEventListener("mousedown", (e) => {
    const rect = canvas.getBoundingClientRect();
    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;

    for (const line of lines) {
      if (isInsideCircle(mouseX, mouseY, line.x2, line.y2, 6)) {
        const circleAtEndpoint = circles.find(
          (circle) =>
            Math.abs(circle.x - line.x2) < 5 && Math.abs(circle.y - line.y2) < 5
        );

        if (e.shiftKey) {
          draggingLine = line;
          draggingEndpoint = "end";

          if (circleAtEndpoint) {
            draggingLine.attachedCircle = circleAtEndpoint;
          } else {
            draggingLine.attachedCircle = null;
          }
        } else if (!circleAtEndpoint) {
          const endpointCircle = {
            x: line.x2,
            y: line.y2,
            radius: 0,
            draggingHandle: false,
            visible: false,
            usedDots: [],
            isLineEndpoint: true,
            connectedLine: line,
          };
          circles.push(endpointCircle);
          activeCircle = endpointCircle;
          activeDotIndex = null;
          document.querySelector(".choose").style.display = "block";
        }

        return;
      }
    }

    for (const circle of circles) {
      if (
        !circle.visible &&
        isInsideCircle(mouseX, mouseY, circle.x, circle.y, 5)
      ) {
        activeCircle = circle;
        activeDotIndex = null;
        document.querySelector(".choose").style.display = "block";
        return;
      }
      if (!circle.visible) continue;

      const handleX = circle.x + circle.radius * Math.cos(HANDLE_ANGLE);
      const handleY = circle.y + circle.radius * Math.sin(HANDLE_ANGLE);

      if (isInsideCircle(mouseX, mouseY, handleX, handleY, 8)) {
        circle.draggingHandle = true;
        return;
      }

      for (let i = 0; i < 8; i++) {
        if (circle.usedDots.includes(i)) continue;

        const angle = (i * Math.PI) / 4;
        const dotX = circle.x + circle.radius * Math.cos(angle);
        const dotY = circle.y + circle.radius * Math.sin(angle);

        if (isInsideCircle(mouseX, mouseY, dotX, dotY, 5)) {
          const newCircle = {
            x: dotX,
            y: dotY,
            radius: 0,
            draggingHandle: false,
            visible: false,
            usedDots: [],
            parent: circle,
            dotIndex: i,
          };
          circles.push(newCircle);
          activeCircle = newCircle;
          activeDotIndex = i;
          circle.usedDots.push(i);
          document.querySelector(".choose").style.display = "block";
          draw();
          return;
        }
      }
    }
  });

  function updateChildPositions(parentCircle) {
    circles.forEach((child) => {
      if (child.parent === parentCircle) {
        const angle = (child.dotIndex * Math.PI) / 4;
        child.x = parentCircle.x + parentCircle.radius * Math.cos(angle);
        child.y = parentCircle.y + parentCircle.radius * Math.sin(angle);

        lines.forEach((line) => {
          if (
            line.fromCircle === child &&
            line.fromDotIndex === child.dotIndex
          ) {
            const angle = (child.dotIndex * Math.PI) / 4;
            line.x1 = child.x + child.radius * Math.cos(angle);
            line.y1 = child.y + child.radius * Math.sin(angle);
          }
        });

        updateChildPositions(child);
      }
    });
  }

  canvas.addEventListener("mousemove", (e) => {
    const rect = canvas.getBoundingClientRect();
    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;

    circles.forEach((circle) => {
      if (!circle.draggingHandle) return;
      const dx = mouseX - circle.x;
      const dy = mouseY - circle.y;
      circle.radius = Math.sqrt(dx * dx + dy * dy);
      updateChildPositions(circle);
      draw();
    });

    if (draggingLine && draggingEndpoint === "end") {
      moveLineAndChildren(draggingLine, mouseX, mouseY);
      draw();
    }
  });

  canvas.addEventListener("mouseup", () => {
    circles.forEach((circle) => (circle.draggingHandle = false));
    draggingLine = null;
    draggingEndpoint = null;
  });

  document.getElementById("line").addEventListener("click", () => {
    if (activeCircle) {
      let angle = 0;
      let startX, startY;
      let parentLine = null;

      if (activeCircle.isLineEndpoint) {
        startX = activeCircle.x;
        startY = activeCircle.y;
        angle = 0;
        parentLine = activeCircle.connectedLine;
      } else {
        angle = activeDotIndex !== null ? (activeDotIndex * Math.PI) / 4 : 0;
        startX = activeCircle.x + activeCircle.radius * Math.cos(angle);
        startY = activeCircle.y + activeCircle.radius * Math.sin(angle);
      }

      const length = 30;
      const endX = startX + length * Math.cos(angle);
      const endY = startY + length * Math.sin(angle);

      const newLine = {
        x1: startX,
        y1: startY,
        x2: endX,
        y2: endY,
        fromCircle: activeCircle,
        fromDotIndex: activeDotIndex,
        parentLine: parentLine,
        children: [],
      };

      if (newLine.fromLine) {
        if (!newLine.fromLine.children) {
          newLine.fromLine.children = [];
        }
        newLine.fromLine.children.push(newLine);
      }

      lines.push(newLine);
      activeCircle.used = true;
      if (activeDotIndex !== null) {
        activeCircle.usedDots.push(activeDotIndex);
      }

      draw();
    }

    activeCircle = null;
    activeDotIndex = null;
    selectedOption = null;
    document.querySelector(".choose").style.display = "none";
  });

  document.getElementById("curved-line").addEventListener("click", () => {
    if (!activeCircle) return;

    let angle = 0;
    let startX, startY;
    let parentLine = null;

    if (activeCircle.isLineEndpoint) {
      startX = activeCircle.x;
      startY = activeCircle.y;
      angle = 0;
      parentLine = activeCircle.connectedLine;
    } else {
      angle = activeDotIndex !== null ? (activeDotIndex * Math.PI) / 4 : 0;
      startX = activeCircle.x + activeCircle.radius * Math.cos(angle);
      startY = activeCircle.y + activeCircle.radius * Math.sin(angle);
    }

    const lineLength = 30;
    const endX = startX + lineLength * Math.cos(angle);
    const endY = startY + lineLength * Math.sin(angle);

    // Curve midden met normale vector
    const midX = (startX + endX) / 2;
    const midY = (startY + endY) / 2;
    const dx = endX - startX;
    const dy = endY - startY;
    const length = Math.sqrt(dx * dx + dy * dy);
    const normX = -dy / length;
    const normY = dx / length;
    const curveHeight = 20;

    const controlX = midX + normX * curveHeight;
    const controlY = midY + normY * curveHeight;

    const newLine = {
      x1: startX,
      y1: startY,
      x2: endX,
      y2: endY,
      controlX: controlX,
      controlY: controlY,
      fromCircle: activeCircle,
      fromDotIndex: activeDotIndex,
      fromLine: parentLine,
      children: [],
    };

    if (newLine.fromLine) {
      newLine.fromLine.children = newLine.fromLine.children || [];
      newLine.fromLine.children.push(newLine);
    }

    activeCircle.used = true;
    if (activeDotIndex !== null) {
      activeCircle.usedDots.push(activeDotIndex);
    }

    lines.push(newLine);
    draw();

    activeCircle = null;
    activeDotIndex = null;
    selectedOption = null;
    activeParentLine = null;
    document.querySelector(".choose").style.display = "none";
  });

  draw();
});
