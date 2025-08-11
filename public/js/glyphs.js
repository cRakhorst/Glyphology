document.addEventListener("DOMContentLoaded", function () {
  const ghostPicture = document.getElementById("ghost");
  let minutes = 5;

  if (ghostPicture) {
    setTimeout(() => {
      ghostPicture.style.transition = "left 5s linear";
      ghostPicture.style.left = "0";
    }, minutes * 60 * 1000);
  }

  const errorMessage = document.getElementById("error-message");
  function removeErrorMessage() {
    errorMessage.style.display = "flex";
    document.querySelector(".done-creating").style.display = "none";
    setTimeout(() => {
      errorMessage.style.display = "none";
    }, 5000);
  }

  document.querySelector(".glyphs").addEventListener("click", function () {
    window.location.href = "create";
  });

  document.querySelector(".combos").addEventListener("click", function () {
    window.location.href = "combos";
  });

  document
    .querySelector(".forward-arrow")
    .addEventListener("click", function () {
      document.querySelector(".done-creating").style.display = "flex";
    });

  document.getElementById("done").addEventListener("click", function () {
    saveGlyph();
  });

  document.getElementById("not-done").addEventListener("click", function () {
    document.querySelector(".done-creating").style.display = "none";
  });

  document.getElementById("cross").addEventListener("click", function () {
    document.querySelector(".choose").style.display = "none";
    if (activeCircle) {
      if (activeCircle.isLineEndpoint && !activeCircle.visible) {
        if (activeCircle.connectedLine) {
          activeCircle.connectedLine.attachedCircle = null;
        }
        const idx = circles.indexOf(activeCircle);
        if (idx > -1) circles.splice(idx, 1);
      }
      activeCircle = null;
      activeDotIndex = null;
      selectedOption = null;
    }
  });

  const canvas = document.getElementById("combo-canvas");
  const rect = canvas.getBoundingClientRect();
  canvas.width = rect.width;
  canvas.height = rect.height;
  const HANDLE_ANGLE = (-12.25 * Math.PI) / 180;

  const ctx = canvas.getContext("2d");

  let selectedOption = null;
  let activeCircle = null;
  let activeDotIndex = null;
  let draggingLine = null;
  let draggingEndpoint = null;
  let activeLineEndpoint = null;

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

    if (line.attachedCircle && line.attachedCircle.parentLine === line) {
      // Als de cirkel zichtbaar is, bereken de nieuwe positie op basis van de lijnrichting
      if (line.attachedCircle.visible && line.attachedCircle.radius > 0) {
        const dx = line.x2 - line.x1;
        const dy = line.y2 - line.y1;
        const length = Math.sqrt(dx * dx + dy * dy);
        const unitX = dx / length;
        const unitY = dy / length;

        // Plaats de cirkel op radius afstand voorbij het lijn-eindpunt
        line.attachedCircle.x = line.x2 + unitX * line.attachedCircle.radius;
        line.attachedCircle.y = line.y2 + unitY * line.attachedCircle.radius;

        // Update het lijn-eindpunt naar de rand van de cirkel
        line.x2 = line.attachedCircle.x - unitX * line.attachedCircle.radius;
        line.y2 = line.attachedCircle.y - unitY * line.attachedCircle.radius;
      } else {
        // Als de cirkel nog niet zichtbaar is, beweeg gewoon mee
        line.attachedCircle.x = newX;
        line.attachedCircle.y = newY;
      }

      updateChildPositions(line.attachedCircle);
    }

    lines.forEach((childLine) => {
      if (childLine.parentLine === line) {
        if (line.attachedCircle && line.attachedCircle.visible) {
          // Als er een zichtbare cirkel is, start de nieuwe lijn vanaf de cirkelrand
          childLine.x1 = line.x2;
          childLine.y1 = line.y2;
        } else {
          childLine.x1 = newX;
          childLine.y1 = newY;
        }
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

        for (let i = 0; i < 16; i++) {
          const angle = (i * Math.PI) / 8;
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
      // Als het een lijn-eindpunt is en er nog geen cirkel is, maak dan een cirkel
      if (activeCircle.isLineEndpoint && !activeCircle.visible) {
        const radius = 30;
        const dx =
          activeCircle.connectedLine.x2 - activeCircle.connectedLine.x1;
        const dy =
          activeCircle.connectedLine.y2 - activeCircle.connectedLine.y1;
        const length = Math.sqrt(dx * dx + dy * dy);
        const unitX = dx / length;
        const unitY = dy / length;

        // Bepaal middenpunt van cirkel op radius afstand voorbij het lijn-eindpunt
        const circleX = activeCircle.connectedLine.x2 + unitX * radius;
        const circleY = activeCircle.connectedLine.y2 + unitY * radius;

        // Update de cirkel eigenschappen
        activeCircle.x = circleX;
        activeCircle.y = circleY;
        activeCircle.radius = radius;
        activeCircle.visible = true;

        // Verplaats het lijn-eindpunt naar de rand van de cirkel
        activeCircle.connectedLine.x2 = circleX - unitX * radius;
        activeCircle.connectedLine.y2 = circleY - unitY * radius;
      } else if (!activeCircle.visible) {
        // Normale cirkel maken
        activeCircle.visible = true;
        activeCircle.radius = 30;
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

    // Check EERST voor lijn-eindpunten (blauwe stippen hebben hoogste prioriteit)
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
          }
        } else if (!circleAtEndpoint) {
          // Maak alleen een onzichtbare placeholder cirkel en toon het keuzemenu
          const endpointCircle = {
            x: line.x2,
            y: line.y2,
            radius: 0,
            draggingHandle: false,
            visible: false,
            usedDots: [],
            isLineEndpoint: true,
            connectedLine: line,
            parentLine: line,
          };

          circles.push(endpointCircle);
          line.attachedCircle = endpointCircle;
          activeCircle = endpointCircle;
          activeDotIndex = null;
          document.querySelector(".choose").style.display = "block";
          draw();
        }

        return;
      }
    }

    // Dan check voor zichtbare cirkels (handvat en dots)
    for (const circle of circles) {
      if (!circle.visible) continue;

      const handleX = circle.x + circle.radius * Math.cos(HANDLE_ANGLE);
      const handleY = circle.y + circle.radius * Math.sin(HANDLE_ANGLE);

      if (isInsideCircle(mouseX, mouseY, handleX, handleY, 8)) {
        circle.draggingHandle = true;
        return;
      }

      for (let i = 0; i < 16; i++) {
        const angle = (i * Math.PI) / 8;
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
          document.querySelector(".choose").style.display = "block";
          draw();
          return;
        }
      }

      // Check of we de cirkel zelf willen verslepen bij Shift+klik
      if (
        e.shiftKey &&
        isInsideCircle(mouseX, mouseY, circle.x, circle.y, circle.radius)
      ) {
        // Zoek de parent line van deze cirkel
        const parentLine = lines.find((line) => line.attachedCircle === circle);
        if (parentLine) {
          draggingLine = parentLine;
          draggingEndpoint = "end";
        }
        return;
      }
    }

    // Als laatste check voor onzichtbare cirkels (zwarte stipjes)
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
    }
  });

  function updateChildPositions(parentCircle) {
    circles.forEach((child) => {
      if (child.parent === parentCircle) {
        const angle = (child.dotIndex * Math.PI) / 8;
        child.x = parentCircle.x + parentCircle.radius * Math.cos(angle);
        child.y = parentCircle.y + parentCircle.radius * Math.sin(angle);

        lines.forEach((line) => {
          if (
            line.fromCircle === child &&
            line.fromDotIndex === child.dotIndex
          ) {
            const angle = (child.dotIndex * Math.PI) / 8;
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
      // Update de lijn positie en alle gekoppelde elementen
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
        angle = activeDotIndex !== null ? (activeDotIndex * Math.PI) / 8 : 0;
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
      angle = activeDotIndex !== null ? (activeDotIndex * Math.PI) / 8 : 0;
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

  document.getElementById("title").addEventListener("input", function () {
    if (this.value.length >= 30) {
      this.value = this.value.slice(0, 30);
    }
    document.getElementById(
      "characters"
    ).textContent = `${this.value.length}/30`;
  });

  document
    .getElementById("description-custom")
    .addEventListener("input", function () {
      if (this.value.length >= 150) {
        this.value = this.value.slice(0, 150);
      }
      document.getElementById(
        "characters-description"
      ).textContent = `${this.value.length}/150`;
    });

  // functions for updating database

  function serializeCanvasData() {
    const components = [];
    let componentId = 1;

    // Serialiseer alle cirkels
    circles.forEach((circle, index) => {
      if (circle.visible || circle.used) {
        components.push({
          component_id: componentId++,
          type: "circle",
          size: circle.radius.toString(),
          coordinates: `${circle.x},${circle.y}`,
        });
      }
    });

    // Serialiseer alle lijnen
    lines.forEach((line, index) => {
      const lineType =
        line.controlX !== undefined && line.controlY !== undefined
          ? "curved_line"
          : "straight_line";
      let coordinates;

      if (lineType === "curved_line") {
        coordinates = `${line.x1},${line.y1},${line.x2},${line.y2},${line.controlX},${line.controlY}`;
      } else {
        coordinates = `${line.x1},${line.y1},${line.x2},${line.y2}`;
      }

      components.push({
        component_id: componentId++,
        type: lineType,
        size: "2", // line width
        coordinates: coordinates,
      });
    });

    return components;
  }

  async function saveGlyph() {
    const title = document.getElementById("title").value.trim();
    const description = document
      .getElementById("description-custom")
      .value.trim();

    // Validatie
    if (!title) {
      errorMessage.textContent = "Please enter a title";
      removeErrorMessage();
      return;
    }

    if (!description) {
      errorMessage.textContent = "Please enter a description";
      removeErrorMessage();
      return;
    }

    // Check of er daadwerkelijk content is om op te slaan
    const hasVisibleContent =
      circles.some((circle) => circle.visible || circle.used) ||
      lines.length > 0;
    if (!hasVisibleContent) {
      errorMessage.textContent = "please draw something before you upload it";
      removeErrorMessage();
      return;
    }

    // Serialiseer canvas data
    const components = serializeCanvasData();

    if (components.length === 0) {
      errorMessage.textContent = "There is no content to save";
      removeErrorMessage();
      return;
    }

    // Prepareer data voor verzending
    const glyphData = {
      title: title,
      description: description,
      components: components,
    };

    try {
      // Verstuur naar server
      const response = await fetch("save_glyph.php", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(glyphData),
      });

      const result = await response.json();
      console.log(result);

      if (result.success) {
        alert("Glyph succesvol opgeslagen!");
        // Optioneel: redirect naar overzichtspagina of reset canvas
        // window.location.href = "glyphs";

        // Of reset het canvas voor een nieuwe creatie
        resetCanvas();
      } else {
        alert("Fout bij opslaan: " + (result.error || "Onbekende fout"));
      }
    } catch (error) {
      console.error("Error saving glyph:", error);
    }
  }

  function resetCanvas() {
    circles.length = 0;
    lines.length = 0;

    // Reset naar beginpositie met één centrum cirkel
    circles.push({
      x: center.x,
      y: center.y,
      radius: 0,
      draggingHandle: false,
      visible: false,
      usedDots: [],
    });

    // Reset form velden
    document.getElementById("title").value = "";
    document.getElementById("description-custom").value = "";
    document.getElementById("characters").textContent = "0/30";
    document.getElementById("characters-description").textContent = "0/150";

    // Verberg menu's
    document.querySelector(".done-creating").style.display = "none";
    document.querySelector(".choose").style.display = "none";

    // Reset actieve elementen
    activeCircle = null;
    activeDotIndex = null;
    selectedOption = null;

    // Herteken canvas
    draw();
  }
});
