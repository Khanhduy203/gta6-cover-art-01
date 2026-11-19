// Panel layouts, photo library and per-panel transforms.
// State lives here; cover.js reads it to draw, main.js wires the UI.

var PANEL_LAYOUTS = {
  hero: [
    { x: 0.00, y: 0.00, w: 1.00, h: 0.62 },
    { x: 0.00, y: 0.64, w: 0.49, h: 0.36 },
    { x: 0.51, y: 0.64, w: 0.49, h: 0.36 }
  ],
  quad: [
    { x: 0.00, y: 0.00, w: 0.49, h: 0.49 },
    { x: 0.51, y: 0.00, w: 0.49, h: 0.49 },
    { x: 0.00, y: 0.51, w: 0.49, h: 0.49 },
    { x: 0.51, y: 0.51, w: 0.49, h: 0.49 }
  ],
  strip: [
    { x: 0.00, y: 0.00, w: 0.62, h: 1.00 },
    { x: 0.64, y: 0.00, w: 0.36, h: 0.49 },
    { x: 0.64, y: 0.51, w: 0.36, h: 0.49 }
  ],
  trio: [
    { x: 0.00, y: 0.00, w: 0.33, h: 1.00 },
    { x: 0.335, y: 0.00, w: 0.33, h: 1.00 },
    { x: 0.67, y: 0.00, w: 0.33, h: 1.00 }
  ]
};

var EXPORT_SIZES = {
  "1080x1080": { w: 1080, h: 1080, label: "Square" },
  "1080x1350": { w: 1080, h: 1350, label: "Portrait" },
  "1920x1080": { w: 1920, h: 1080, label: "Wide" }
};

var coverState = {
  layout: "hero",
  sizeKey: "1080x1080",
  photos: [],          // { name, img, url }
  panelPhoto: [],      // photo index per panel, -1 = empty
  panelShift: [],      // { dx, dy } in panel fractions, -0.5..0.5
  panelZoom: [],       // 1.0 = cover-fit, up to 3
  selectedPanel: 0,
  grade: 0.7,
  grain: 0.25
};

function panelCount() {
  return PANEL_LAYOUTS[coverState.layout].length;
}

function resetPanelTransforms() {
  var n = panelCount();
  coverState.panelPhoto = [];
  coverState.panelShift = [];
  coverState.panelZoom = [];
  for (var i = 0; i < n; i++) {
    coverState.panelPhoto.push(coverState.photos.length ? 0 : -1);
    coverState.panelShift.push({ dx: 0, dy: 0 });
    coverState.panelZoom.push(1);
  }
  if (coverState.selectedPanel >= n) coverState.selectedPanel = 0;
}

function setLayout(name) {
  if (!PANEL_LAYOUTS[name]) return;
  coverState.layout = name;
  resetPanelTransforms();
}

function fillAllPanelsWithPhoto(photoIndex) {
  for (var i = 0; i < panelCount(); i++) {
    coverState.panelPhoto[i] = photoIndex;
  }
}

function loadPhotoFile(file) {
  return new Promise(function (resolve, reject) {
    var reader = new FileReader();
    reader.onload = function () {
      var img = new Image();
      img.onload = function () {
        coverState.photos.push({ name: file.name || "photo", img: img, url: reader.result });
        resolve();
      };
      img.onerror = reject;
      img.src = reader.result;
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

function loadSamplePhotos(onDone) {
  // Bundled sample photos, free to use, so the editor is never empty.
  // Loaded one after another in a fixed order: the hero panel is always
  // the boulevard, the lower panels always the pier.
  var samples = [
    { name: "Boulevard", url: "samples/boulevard.jpg" },
    { name: "Pier", url: "samples/pier.jpg" }
  ];
  var next = 0;
  function loadNext() {
    if (next >= samples.length) {
      resetPanelTransforms();
      // Default spread: hero gets the boulevard, lower panels the pier.
      if (coverState.photos.length > 1 && panelCount() >= 3) {
        coverState.panelPhoto[1] = 1;
        coverState.panelPhoto[2] = 1;
      }
      if (onDone) onDone();
      return;
    }
    var s = samples[next++];
    var img = new Image();
    img.onload = function () {
      coverState.photos.push({ name: s.name, img: img, url: s.url });
      loadNext();
    };
    img.onerror = loadNext;
    img.src = s.url;
  }
  loadNext();
}

function panelRectInPixels(layoutName, index, W, H) {
  var r = PANEL_LAYOUTS[layoutName][index];
  return { x: r.x * W, y: r.y * H, w: r.w * W, h: r.h * H };
}

// Which panel (if any) contains canvas point px, py, in preview-canvas pixels.
function hitTestPanel(px, py, canvasW, canvasH) {
  var rects = PANEL_LAYOUTS[coverState.layout];
  for (var i = rects.length - 1; i >= 0; i--) {
    var r = rects[i];
    if (px >= r.x * canvasW && px <= (r.x + r.w) * canvasW &&
        py >= r.y * canvasH && py <= (r.y + r.h) * canvasH) {
      return i;
    }
  }
  return -1;
}
