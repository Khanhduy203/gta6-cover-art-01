// The cover renderer: draws the whole poster onto any canvas context.
// Sunset sky, glowing sun, photo panels, neon grade, grain, bold caption.

function drawSunsetSky(ctx, W, H) {
  var sky = ctx.createLinearGradient(0, 0, 0, H);
  sky.addColorStop(0.00, "#2b0a4d");
  sky.addColorStop(0.35, "#7a1038");
  sky.addColorStop(0.62, "#e83e2e");
  sky.addColorStop(0.85, "#ff8c2e");
  sky.addColorStop(1.00, "#ffc46b");
  ctx.fillStyle = sky;
  ctx.fillRect(0, 0, W, H);

  // Low glowing sun, half-hidden behind the panels.
  var sunR = W * 0.16;
  var sunX = W * 0.78, sunY = H * 0.30;
  var glow = ctx.createRadialGradient(sunX, sunY, sunR * 0.2, sunX, sunY, sunR * 2.4);
  glow.addColorStop(0, "rgba(255, 220, 130, 0.85)");
  glow.addColorStop(0.4, "rgba(255, 140, 60, 0.35)");
  glow.addColorStop(1, "rgba(255, 140, 60, 0)");
  ctx.fillStyle = glow;
  ctx.fillRect(sunX - sunR * 2.4, sunY - sunR * 2.4, sunR * 4.8, sunR * 4.8);
  var disc = ctx.createLinearGradient(sunX, sunY - sunR, sunX, sunY + sunR);
  disc.addColorStop(0, "#fff3b0");
  disc.addColorStop(1, "#ff7a3d");
  ctx.fillStyle = disc;
  ctx.beginPath();
  ctx.arc(sunX, sunY, sunR, 0, Math.PI * 2);
  ctx.fill();
}

function drawPhotoIntoPanel(ctx, img, rect, shift, zoom) {
  // Cover-fit the photo into the panel, then pan by shift and scale by zoom.
  var scale = Math.max(rect.w / img.width, rect.h / img.height) * zoom;
  var dw = img.width * scale, dh = img.height * scale;
  var dx = rect.x + (rect.w - dw) / 2 + shift.dx * rect.w;
  var dy = rect.y + (rect.h - dh) / 2 + shift.dy * rect.h;
  ctx.save();
  ctx.beginPath();
  ctx.rect(rect.x, rect.y, rect.w, rect.h);
  ctx.clip();
  ctx.drawImage(img, dx, dy, dw, dh);
  // Warm the photo toward the sunset palette.
  ctx.globalCompositeOperation = "overlay";
  var warm = ctx.createLinearGradient(rect.x, rect.y, rect.x, rect.y + rect.h);
  warm.addColorStop(0, "rgba(255, 120, 60, 0.10)");
  warm.addColorStop(1, "rgba(120, 40, 160, 0.14)");
  ctx.fillStyle = warm;
  ctx.fillRect(rect.x, rect.y, rect.w, rect.h);
  ctx.restore();
}

function drawEmptyPanel(ctx, rect, index) {
  ctx.save();
  ctx.beginPath();
  ctx.rect(rect.x, rect.y, rect.w, rect.h);
  ctx.clip();
  var g = ctx.createLinearGradient(rect.x, rect.y, rect.x + rect.w, rect.y + rect.h);
  g.addColorStop(0, "#3a1650");
  g.addColorStop(1, "#1c0a2e");
  ctx.fillStyle = g;
  ctx.fillRect(rect.x, rect.y, rect.w, rect.h);
  ctx.fillStyle = "rgba(255,255,255,0.65)";
  ctx.font = "700 " + Math.max(16, Math.round(rect.w * 0.06)) + "px 'Segoe UI', Arial, sans-serif";
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillText("PANEL " + (index + 1) + " — ADD A PHOTO", rect.x + rect.w / 2, rect.y + rect.h / 2);
  ctx.restore();
}

function drawNeonGrade(ctx, W, H, strength) {
  if (strength <= 0) return;
  ctx.save();
  ctx.globalCompositeOperation = "soft-light";
  var g = ctx.createLinearGradient(0, 0, W, H);
  g.addColorStop(0, "rgba(255, 90, 40, " + (0.55 * strength) + ")");
  g.addColorStop(0.5, "rgba(255, 46, 136, " + (0.35 * strength) + ")");
  g.addColorStop(1, "rgba(46, 197, 255, " + (0.45 * strength) + ")");
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, W, H);
  ctx.restore();

  // Vignette to pull the eye to the middle.
  var v = ctx.createRadialGradient(W / 2, H / 2, Math.min(W, H) * 0.35, W / 2, H / 2, Math.max(W, H) * 0.75);
  v.addColorStop(0, "rgba(0,0,0,0)");
  v.addColorStop(1, "rgba(10, 2, 24, " + (0.35 * strength) + ")");
  ctx.fillStyle = v;
  ctx.fillRect(0, 0, W, H);
}

function drawFilmGrain(ctx, W, H, amount) {
  if (amount <= 0) return;
  var step = Math.max(3, Math.round(W / 240));
  ctx.save();
  for (var y = 0; y < H; y += step) {
    for (var x = 0; x < W; x += step) {
      var v = Math.floor(Math.random() * 255);
      ctx.fillStyle = "rgba(" + v + "," + v + "," + v + "," + (amount * 0.05) + ")";
      ctx.fillRect(x, y, step, step);
    }
  }
  ctx.restore();
}

function drawCover(ctx, W, H) {
  drawSunsetSky(ctx, W, H);
  var gutter = Math.max(4, Math.round(W * 0.012));
  var rects = PANEL_LAYOUTS[coverState.layout];
  for (var i = 0; i < rects.length; i++) {
    var r = panelRectInPixels(coverState.layout, i, W, H);
    var inner = { x: r.x + gutter / 2, y: r.y + gutter / 2, w: r.w - gutter, h: r.h - gutter };
    var photoIndex = coverState.panelPhoto[i];
    var photo = photoIndex >= 0 ? coverState.photos[photoIndex] : null;
    if (photo && photo.img) {
      drawPhotoIntoPanel(ctx, photo.img, inner, coverState.panelShift[i], coverState.panelZoom[i]);
    } else {
      drawEmptyPanel(ctx, inner, i);
    }
    // Crisp white poster frame around each panel.
    ctx.strokeStyle = "rgba(255,255,255,0.92)";
    ctx.lineWidth = Math.max(2, W * 0.004);
    ctx.strokeRect(inner.x, inner.y, inner.w, inner.h);
  }
  drawNeonGrade(ctx, W, H, coverState.grade);
  drawFilmGrain(ctx, W, H, coverState.grain);
  drawPosterCaption(ctx, W, H);
}

function renderPreview() {
  var canvas = document.getElementById("previewCanvas");
  if (!canvas) return;
  var size = EXPORT_SIZES[coverState.sizeKey];
  canvas.width = size.w;
  canvas.height = size.h;
  var ctx = canvas.getContext("2d");
  drawCover(ctx, size.w, size.h);
}
