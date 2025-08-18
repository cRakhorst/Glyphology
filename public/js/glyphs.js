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

  // Helper function to constrain a point to canvas boundaries
  function constrainToCanvas(x, y) {
    return {
      x: Math.min(Math.max(x, 0), canvas.width),
      y: Math.min(Math.max(y, 0), canvas.height),
    };
  }

  let selectedOption = null;
  let activeCircle = null;
  let activeDotIndex = null;
  let draggingLine = null;
  let draggingEndpoint = null;
  let activeLineEndpoint = null;
  let draggingControlPoint = null;

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
    // Constrain the endpoint to canvas boundaries
    const constrained = constrainToCanvas(newX, newY);
    line.x2 = constrained.x;
    line.y2 = constrained.y;

    if (line.attachedCircle && line.attachedCircle.parentLine === line) {
      // if the circle is visible, calculate the new position based of the line direction
      if (line.attachedCircle.visible && line.attachedCircle.radius > 0) {
        const dx = line.x2 - line.x1;
        const dy = line.y2 - line.y1;
        const length = Math.sqrt(dx * dx + dy * dy);
        const unitX = dx / length;
        const unitY = dy / length;

        const circlePos = constrainToCanvas(
          line.x2 + unitX * line.attachedCircle.radius,
          line.y2 + unitY * line.attachedCircle.radius
        );
        line.attachedCircle.x = circlePos.x;
        line.attachedCircle.y = circlePos.y;

        // update the line endpoint to the edge of the circle
        line.x2 = line.attachedCircle.x - unitX * line.attachedCircle.radius;
        line.y2 = line.attachedCircle.y - unitY * line.attachedCircle.radius;
      } else {
        // if the circle isn't visible, move it relative to the new position
        const circlePos = constrainToCanvas(newX, newY);
        line.attachedCircle.x = circlePos.x;
        line.attachedCircle.y = circlePos.y;
      }
      updateChildPositions(line.attachedCircle);
    }

    lines.forEach((childLine) => {
      if (childLine.parentLine === line) {
        if (line.attachedCircle && line.attachedCircle.visible) {
          // if the parent component is a circle, the start point for the new line is on the circle edge
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
        // Draw control point
        ctx.beginPath();
        ctx.arc(line.controlX, line.controlY, 5, 0, Math.PI * 2);
        ctx.fillStyle = "red";
        ctx.fill();

        // Draw guide lines to control point
        ctx.beginPath();
        ctx.moveTo(line.x1, line.y1);
        ctx.lineTo(line.controlX, line.controlY);
        ctx.moveTo(line.x2, line.y2);
        ctx.lineTo(line.controlX, line.controlY);
        ctx.setLineDash([5, 5]);
        ctx.strokeStyle = "rgba(0, 0, 0, 0.3)";
        ctx.stroke();
        ctx.setLineDash([]);

        // Draw the curve
        ctx.beginPath();
        ctx.moveTo(line.x1, line.y1);
        ctx.quadraticCurveTo(line.controlX, line.controlY, line.x2, line.y2);
        ctx.strokeStyle = "black";
        ctx.lineWidth = 2;
        ctx.stroke();
      } else {
        ctx.lineTo(line.x2, line.y2);
        ctx.strokeStyle = "black";
        ctx.lineWidth = 2;
        ctx.stroke();
      }

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
      // is the circle on a line endpoint
      if (activeCircle.isLineEndpoint && !activeCircle.visible) {
        // Check if this line endpoint already has an element attached
        if (
          activeCircle.connectedLine &&
          activeCircle.connectedLine.hasAttachedElement
        ) {
          // Don't allow adding another element
          activeCircle = null;
          activeDotIndex = null;
          selectedOption = null;
          document.querySelector(".choose").style.display = "none";
          return;
        }

        const radius = 30;
        const dx =
          activeCircle.connectedLine.x2 - activeCircle.connectedLine.x1;
        const dy =
          activeCircle.connectedLine.y2 - activeCircle.connectedLine.y1;
        const length = Math.sqrt(dx * dx + dy * dy);
        const unitX = dx / length;
        const unitY = dy / length;

        // calculate the center of the circle to the radius if it's on a line endpoint
        const circleX = activeCircle.connectedLine.x2 + unitX * radius;
        const circleY = activeCircle.connectedLine.y2 + unitY * radius;

        activeCircle.x = circleX;
        activeCircle.y = circleY;
        activeCircle.radius = radius;
        activeCircle.visible = true;

        // move the line endpoint to the edge of the circle
        activeCircle.connectedLine.x2 = circleX - unitX * radius;
        activeCircle.connectedLine.y2 = circleY - unitY * radius;

        // Mark the parent line as having an attached element
        if (activeCircle.connectedLine) {
          activeCircle.connectedLine.hasAttachedElement = true;
        }
      } else if (!activeCircle.visible) {
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

    // check first for line endpoints or cirle handles, the blue dots have priority
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
        } else if (!circleAtEndpoint && !line.attachedCircle) {
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
        } else if (line.attachedCircle && !line.attachedCircle.visible) {
          // if the circle is already on the line endpoint, just select it
          activeCircle = line.attachedCircle;
          activeDotIndex = null;
          document.querySelector(".choose").style.display = "block";
          draw();
        }
        return;
      }
    }

    // Check for control points
    for (const line of lines) {
      if (line.controlX !== undefined && line.controlY !== undefined) {
        if (isInsideCircle(mouseX, mouseY, line.controlX, line.controlY, 5)) {
          draggingControlPoint = line;
          return;
        }
      }
    }

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

      // Only set up line dragging if specifically clicking on the endpoint
      const isEndpoint = lines.some(
        (line) =>
          isInsideCircle(mouseX, mouseY, line.x2, line.y2, 6) &&
          line.attachedCircle === circle
      );

      if (isEndpoint) {
        const parentLine = lines.find((line) => line.attachedCircle === circle);
        if (parentLine) {
          draggingLine = parentLine;
          draggingEndpoint = "end";
          return;
        }
      }
    }

    // check for black dots, aka component places
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

      // Update line endpoint if this circle is attached to a line
      if (circle.connectedLine) {
        const line = circle.connectedLine;
        const linedx = line.x2 - line.x1;
        const linedy = line.y2 - line.y1;
        const lineLength = Math.sqrt(linedx * linedx + linedy * linedy);

        if (lineLength > 0) {
          const unitX = linedx / lineLength;
          const unitY = linedy / lineLength;

          // Update line endpoint to be on the circle's edge
          line.x2 = circle.x - unitX * circle.radius;
          line.y2 = circle.y - unitY * circle.radius;
        }
      }

      updateChildPositions(circle);
      draw();
    });

    if (draggingLine && draggingEndpoint === "end") {
      const constrainedPoint = constrainToCanvas(mouseX, mouseY);
      moveLineAndChildren(draggingLine, constrainedPoint.x, constrainedPoint.y);
      draw();
    }

    if (draggingControlPoint) {
      const constrainedPoint = constrainToCanvas(mouseX, mouseY);
      draggingControlPoint.controlX = constrainedPoint.x;
      draggingControlPoint.controlY = constrainedPoint.y;
      draw();
    }
  });

  canvas.addEventListener("mouseup", () => {
    circles.forEach((circle) => (circle.draggingHandle = false));
    draggingLine = null;
    draggingEndpoint = null;
    draggingControlPoint = null;
  });

  document.getElementById("line").addEventListener("click", () => {
    if (activeCircle) {
      let angle = 0;
      let startX, startY;
      let parentLine = null;

      if (activeCircle.isLineEndpoint) {
        // Check if this line endpoint already has an element attached
        if (
          activeCircle.connectedLine &&
          activeCircle.connectedLine.hasAttachedElement
        ) {
          // Don't allow adding another element
          activeCircle = null;
          activeDotIndex = null;
          selectedOption = null;
          document.querySelector(".choose").style.display = "none";
          return;
        }

        startX = activeCircle.x;
        startY = activeCircle.y;
        angle = 0;
        parentLine = activeCircle.connectedLine;
      } else {
        angle = activeDotIndex !== null ? (activeDotIndex * Math.PI) / 8 : 0;
        startX = activeCircle.x + activeCircle.radius * Math.cos(angle);
        startY = activeCircle.y + activeCircle.radius * Math.sin(angle);
      }

      let length = 30;
      let endX = startX + length * Math.cos(angle);
      let endY = startY + length * Math.sin(angle);

      // Check if the line endpoint would go outside canvas and adjust length if needed
      const maxLength = calculateMaxLineLength(startX, startY, angle);
      if (length > maxLength) {
        length = Math.max(maxLength, 10); // Minimum length of 10 pixels
        endX = startX + length * Math.cos(angle);
        endY = startY + length * Math.sin(angle);
      }

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

      // Mark the parent line as having an attached element
      if (parentLine) {
        parentLine.hasAttachedElement = true;
      }

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
      // Check if this line endpoint already has an element attached
      if (
        activeCircle.connectedLine &&
        activeCircle.connectedLine.hasAttachedElement
      ) {
        // Don't allow adding another element
        activeCircle = null;
        activeDotIndex = null;
        selectedOption = null;
        document.querySelector(".choose").style.display = "none";
        return;
      }

      startX = activeCircle.x;
      startY = activeCircle.y;
      angle = 0;
      parentLine = activeCircle.connectedLine;
    } else {
      angle = activeDotIndex !== null ? (activeDotIndex * Math.PI) / 8 : 0;
      startX = activeCircle.x + activeCircle.radius * Math.cos(angle);
      startY = activeCircle.y + activeCircle.radius * Math.sin(angle);
    }

    let lineLength = 30;
    let endX = startX + lineLength * Math.cos(angle);
    let endY = startY + lineLength * Math.sin(angle);

    // Check if the line endpoint would go outside canvas and adjust length if needed
    const maxLength = calculateMaxLineLength(startX, startY, angle);
    if (lineLength > maxLength) {
      lineLength = Math.max(maxLength, 10); // Minimum length of 10 pixels
      endX = startX + lineLength * Math.cos(angle);
      endY = startY + lineLength * Math.sin(angle);
    }

    const midX = (startX + endX) / 2;
    const midY = (startY + endY) / 2;
    const dx = endX - startX;
    const dy = endY - startY;
    const length = Math.sqrt(dx * dx + dy * dy);
    const normX = -dy / length;
    const normY = dx / length;
    const curveHeight = 20;

    let controlX = midX + normX * curveHeight;
    let controlY = midY + normY * curveHeight;

    // Constrain control point to canvas
    const constrainedControl = constrainToCanvas(controlX, controlY);
    controlX = constrainedControl.x;
    controlY = constrainedControl.y;

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

    // Mark the parent line as having an attached element
    if (parentLine) {
      parentLine.hasAttachedElement = true;
    }

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

  // Add this helper function to calculate maximum line length
  function calculateMaxLineLength(startX, startY, angle) {
    const cosAngle = Math.cos(angle);
    const sinAngle = Math.sin(angle);

    let maxLength = Infinity;

    // Check collision with right edge
    if (cosAngle > 0) {
      maxLength = Math.min(maxLength, (canvas.width - startX) / cosAngle);
    }

    // Check collision with left edge
    if (cosAngle < 0) {
      maxLength = Math.min(maxLength, -startX / cosAngle);
    }

    // Check collision with bottom edge
    if (sinAngle > 0) {
      maxLength = Math.min(maxLength, (canvas.height - startY) / sinAngle);
    }

    // Check collision with top edge
    if (sinAngle < 0) {
      maxLength = Math.min(maxLength, -startY / sinAngle);
    }

    return Math.max(0, maxLength - 5); // Subtract 5 pixels for padding
  }

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

  // functions for saving glyphs

  function saveGlyph() {
    const title = document.getElementById("title").value.trim();
    const description = document
      .getElementById("description-custom")
      .value.trim();

    // validation
    if (!title) {
      removeErrorMessage();
      document.getElementById("error-message").textContent =
        "Title is required";
      return;
    }

    if (!description) {
      removeErrorMessage();
      document.getElementById("error-message").textContent =
        "Description is required";
      return;
    }

    const components = [];

    // add circles to the components array
    circles.forEach((circle, index) => {
      if (circle.visible && circle.radius > 0) {
        components.push({
          type: "circle",
          size: circle.radius.toString(),
          coordinates: `${circle.x},${circle.y}`,
        });
      }
    });

    // add lines to the components array
    lines.forEach((line, index) => {
      if (line.controlX !== undefined && line.controlY !== undefined) {
        components.push({
          type: "curved_line",
          size: "0", // for lines there is no size
          coordinates: `${line.x1},${line.y1},${line.x2},${line.y2},${line.controlX},${line.controlY}`,
        });
      } else {
        components.push({
          type: "line",
          size: "0",
          coordinates: `${line.x1},${line.y1},${line.x2},${line.y2}`,
        });
      }
    });

    // Check if canvas is empty
    if (components.length === 0) {
      removeErrorMessage();
      document.getElementById("error-message").textContent =
        "Can't save a glyph with no components";
      return;
    }

    // sending data to the server ↓↓↓
    const data = {
      title: title,
      description: description,
      components: components,
    };

    console.log("Sending data:", data);

    fetch("api/save_glyph", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
      credentials: "same-origin", // this includes session data and cookie data
    })
      .then((response) => {
        console.log("Response status:", response.status);
        return response.json();
      })
      .then((result) => {
        console.log("Response data:", result);

        if (result.success) {
          // Success - hide confirmation div and reset canvas
          document.querySelector(".done-creating").style.display = "none";

          circles.length = 1; // keep the center dot
          circles[0] = {
            x: center.x,
            y: center.y,
            radius: 0,
            draggingHandle: false,
            visible: false,
            usedDots: [],
          };
          lines.length = 0;

          // Reset input fields
          document.getElementById("title").value = "";
          document.getElementById("description-custom").value = "";
          document.getElementById("characters").textContent = "0/30";
          document.getElementById("characters-description").textContent =
            "0/150";

          draw();

          // show succes message and send the user to their glyph
          alert("Glyph succesfully saved!");
        } else {
          removeErrorMessage();
          document.getElementById("error-message").textContent =
            result.message || "An unexpected error has occurred";

          // Log debug info if available
          if (result.debug) {
            console.error("Debug info:", result.debug);
          }
        }
      })
      .catch((error) => {
        console.error("Error saving glyph:", error);
        removeErrorMessage();
        document.getElementById("error-message").textContent =
          "saving error: " +
          error.message +
          ". Please message me on Discord if this keeps happening.";
      });
  }
});
