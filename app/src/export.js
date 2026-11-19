// Export: render the cover at the chosen post size and download it as a PNG.
// Also powers the full-screen cover view (?shot=export) used for screenshots.

function exportFileName() {
  var size = EXPORT_SIZES[coverState.sizeKey];
  var slug = (captionState.text || "cover").trim().toLowerCase()
    .replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "") || "cover";
  return "sunset-poster-" + slug + "-" + size.w + "x" + size.h + ".png";
}

function renderExportCanvas() {
  var size = EXPORT_SIZES[coverState.sizeKey];
  var canvas = document.createElement("canvas");
  canvas.width = size.w;
  canvas.height = size.h;
  drawCover(canvas.getContext("2d"), size.w, size.h);
  return canvas;
}

function exportCoverPNG(statusEl) {
  var canvas = renderExportCanvas();
  canvas.toBlob(function (blob) {
    if (!blob) {
      if (statusEl) statusEl.textContent = "Export failed — please try again.";
      return;
    }
    var url = URL.createObjectURL(blob);
    var a = document.createElement("a");
    a.href = url;
    a.download = exportFileName();
    document.body.appendChild(a);
    a.click();
    a.remove();
    setTimeout(function () { URL.revokeObjectURL(url); }, 5000);
    var size = EXPORT_SIZES[coverState.sizeKey];
    if (statusEl) {
      statusEl.textContent = "Exported " + size.w + " × " + size.h + " PNG — check your downloads.";
    }
  }, "image/png");
}

// Full-screen cover view for screenshots: ?shot=export renders the finished
// cover edge-to-edge with no editor chrome around it.
function maybeShowCoverOnly() {
  var params = new URLSearchParams(window.location.search);
  if (params.get("shot") !== "export" && params.get("demo") !== "cover") return false;
  var sizeKey = params.get("size");
  if (sizeKey && EXPORT_SIZES[sizeKey]) coverState.sizeKey = sizeKey;
  document.body.classList.add("cover-only");
  var stage = document.createElement("div");
  stage.id = "coverStage";
  var canvas = renderExportCanvas();
  canvas.id = "coverCanvas";
  stage.appendChild(canvas);
  document.body.appendChild(stage);
  return true;
}
