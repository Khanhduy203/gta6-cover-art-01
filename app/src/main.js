// Wiring: controls, panel list, drag-to-pan, file input and drag-and-drop.

var dragState = null;

function refreshPanelList() {
  var list = document.getElementById("panelList");
  list.innerHTML = "";
  for (var i = 0; i < panelCount(); i++) {
    (function (index) {
      var card = document.createElement("div");
      card.className = "panel-card" + (coverState.selectedPanel === index ? " is-selected" : "");
      var head = document.createElement("div");
      head.className = "panel-card-head";
      var title = document.createElement("span");
      title.textContent = "Panel " + (index + 1);
      var select = document.createElement("select");
      select.setAttribute("aria-label", "Photo for panel " + (index + 1));
      var noneOpt = document.createElement("option");
      noneOpt.value = "-1";
      noneOpt.textContent = "— empty —";
      select.appendChild(noneOpt);
      coverState.photos.forEach(function (p, pi) {
        var opt = document.createElement("option");
        opt.value = String(pi);
        opt.textContent = p.name;
        select.appendChild(opt);
      });
      select.value = String(coverState.panelPhoto[index]);
      select.addEventListener("change", function () {
        coverState.panelPhoto[index] = parseInt(select.value, 10);
        renderPreview();
      });
      head.appendChild(title);
      head.appendChild(select);
      card.appendChild(head);

      var zoomLabel = document.createElement("label");
      zoomLabel.textContent = "Zoom";
      var zoom = document.createElement("input");
      zoom.type = "range";
      zoom.min = "1";
      zoom.max = "3";
      zoom.step = "0.05";
      zoom.value = String(coverState.panelZoom[index]);
      zoom.addEventListener("input", function () {
        coverState.panelZoom[index] = parseFloat(zoom.value);
        renderPreview();
      });
      card.appendChild(zoomLabel);
      card.appendChild(zoom);
      card.addEventListener("click", function () {
        coverState.selectedPanel = index;
        refreshPanelList();
        renderPreview();
      });
      list.appendChild(card);
    })(i);
  }
}

function refreshPhotoStrip() {
  var strip = document.getElementById("photoStrip");
  strip.innerHTML = "";
  coverState.photos.forEach(function (p, pi) {
    var thumb = document.createElement("img");
    thumb.className = "photo-thumb";
    thumb.src = p.url;
    thumb.alt = p.name;
    thumb.title = p.name + " — click to fill the selected panel";
    thumb.addEventListener("click", function () {
      coverState.panelPhoto[coverState.selectedPanel] = pi;
      refreshPanelList();
      renderPreview();
    });
    strip.appendChild(thumb);
  });
}

function refreshAll() {
  refreshPanelList();
  refreshPhotoStrip();
  renderPreview();
}

function canvasPoint(evt) {
  var canvas = document.getElementById("previewCanvas");
  var rect = canvas.getBoundingClientRect();
  return {
    x: (evt.clientX - rect.left) * (canvas.width / rect.width),
    y: (evt.clientY - rect.top) * (canvas.height / rect.height)
  };
}

function bindPreviewDrag() {
  var canvas = document.getElementById("previewCanvas");
  canvas.addEventListener("pointerdown", function (evt) {
    var pt = canvasPoint(evt);
    var hit = hitTestPanel(pt.x, pt.y, canvas.width, canvas.height);
    if (hit < 0) return;
    coverState.selectedPanel = hit;
    refreshPanelList();
    var shift = coverState.panelShift[hit];
    dragState = { panel: hit, lastX: pt.x, lastY: pt.y, shift: shift };
    canvas.setPointerCapture(evt.pointerId);
  });
  canvas.addEventListener("pointermove", function (evt) {
    if (!dragState) return;
    var pt = canvasPoint(evt);
    var rect = panelRectInPixels(coverState.layout, dragState.panel, canvas.width, canvas.height);
    dragState.shift.dx += (pt.x - dragState.lastX) / rect.w;
    dragState.shift.dy += (pt.y - dragState.lastY) / rect.h;
    dragState.shift.dx = Math.max(-0.5, Math.min(0.5, dragState.shift.dx));
    dragState.shift.dy = Math.max(-0.5, Math.min(0.5, dragState.shift.dy));
    dragState.lastX = pt.x;
    dragState.lastY = pt.y;
    renderPreview();
  });
  canvas.addEventListener("pointerup", function () { dragState = null; });
  canvas.addEventListener("pointercancel", function () { dragState = null; });
}

function bindControls() {
  document.querySelectorAll(".layout-btn").forEach(function (btn) {
    btn.addEventListener("click", function () {
      document.querySelectorAll(".layout-btn").forEach(function (b) { b.classList.remove("is-active"); });
      btn.classList.add("is-active");
      setLayout(btn.getAttribute("data-layout"));
      refreshAll();
    });
  });

  document.querySelectorAll(".size-chip").forEach(function (chip) {
    chip.addEventListener("click", function () {
      document.querySelectorAll(".size-chip").forEach(function (c) { c.classList.remove("is-active"); });
      chip.classList.add("is-active");
      coverState.sizeKey = chip.getAttribute("data-size");
      renderPreview();
    });
  });

  document.getElementById("fillAllBtn").addEventListener("click", function () {
    if (!coverState.photos.length) return;
    fillAllPanelsWithPhoto(coverState.selectedPanel >= 0
      ? coverState.panelPhoto[coverState.selectedPanel]
      : 0);
    // If the selected panel was empty, fall back to the first photo.
    for (var i = 0; i < panelCount(); i++) {
      if (coverState.panelPhoto[i] < 0) coverState.panelPhoto[i] = 0;
    }
    refreshAll();
  });

  var input = document.getElementById("photoInput");
  input.addEventListener("change", function () {
    var files = Array.prototype.slice.call(input.files || []);
    Promise.all(files.map(loadPhotoFile)).then(function () {
      resetPanelTransforms();
      refreshAll();
    });
    input.value = "";
  });

  var dropZone = document.getElementById("dropZone");
  dropZone.addEventListener("dragover", function (evt) {
    evt.preventDefault();
    dropZone.classList.add("drag-over");
  });
  dropZone.addEventListener("dragleave", function () { dropZone.classList.remove("drag-over"); });
  dropZone.addEventListener("drop", function (evt) {
    evt.preventDefault();
    dropZone.classList.remove("drag-over");
    var files = Array.prototype.slice.call(evt.dataTransfer.files || [])
      .filter(function (f) { return f.type.indexOf("image/") === 0; });
    Promise.all(files.map(loadPhotoFile)).then(function () {
      resetPanelTransforms();
      refreshAll();
    });
  });

  document.getElementById("captionInput").addEventListener("input", function (evt) {
    captionState.text = evt.target.value;
    renderPreview();
  });
  document.getElementById("subtitleInput").addEventListener("input", function (evt) {
    captionState.subtitle = evt.target.value;
    renderPreview();
  });
  document.getElementById("captionColor").addEventListener("change", function (evt) {
    captionState.color = evt.target.value;
    renderPreview();
  });
  document.getElementById("captionPlace").addEventListener("change", function (evt) {
    captionState.place = evt.target.value;
    renderPreview();
  });
  document.getElementById("gradeRange").addEventListener("input", function (evt) {
    coverState.grade = parseInt(evt.target.value, 10) / 100;
    renderPreview();
  });
  document.getElementById("grainRange").addEventListener("input", function (evt) {
    coverState.grain = parseInt(evt.target.value, 10) / 100;
    renderPreview();
  });

  var statusEl = document.getElementById("exportStatus");
  document.getElementById("exportBtn").addEventListener("click", function () { exportCoverPNG(statusEl); });
  document.getElementById("exportBtn2").addEventListener("click", function () { exportCoverPNG(statusEl); });
}

function bootSunsetPoster() {
  bindControls();
  bindPreviewDrag();
  resetPanelTransforms();
  renderPreview();
  loadSamplePhotos(function () {
    if (maybeShowCoverOnly()) return;
    refreshAll();
  });
  // Cover-only screenshot mode must also render once the samples arrive;
  // if samples failed, still show the frame immediately.
  if (new URLSearchParams(window.location.search).get("shot") === "export") {
    setTimeout(function () {
      if (!document.getElementById("coverStage")) maybeShowCoverOnly();
    }, 800);
  }
}

document.addEventListener("DOMContentLoaded", bootSunsetPoster);
