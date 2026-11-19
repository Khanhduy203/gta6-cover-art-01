// Caption state and the bold poster lettering drawn on the cover.
// Lettering uses system sans-serif only — no shipped font files.

var captionState = {
  text: "GOLDEN HOUR",
  subtitle: "MY STORY · SUMMER 2026",
  color: "sunset",   // sunset | white | neon | aqua
  place: "bottom"    // bottom | top
};

var CAPTION_COLORS = {
  sunset: { fill: "#ffd166", fill2: "#ff7a3d", stroke: "#2b0a3d", shadow: "#ff2e88" },
  white:  { fill: "#ffffff", fill2: "#ffe9c9", stroke: "#1c0a2e", shadow: "#ff7a3d" },
  neon:   { fill: "#ff5ec4", fill2: "#ff2e88", stroke: "#16002e", shadow: "#00e5ff" },
  aqua:   { fill: "#7df9ff", fill2: "#2ec5ff", stroke: "#062a3d", shadow: "#ff2e88" }
};

function captionPalette() {
  return CAPTION_COLORS[captionState.color] || CAPTION_COLORS.sunset;
}

function fitCaptionFont(ctx, text, maxWidth, startPx) {
  // Shrink the font until the caption fits the cover width.
  var px = startPx;
  while (px > 24) {
    ctx.font = "900 " + px + "px 'Arial Black', 'Segoe UI', Arial, sans-serif";
    if (ctx.measureText(text).width <= maxWidth) return px;
    px -= 6;
  }
  return px;
}

function drawPosterCaption(ctx, W, H) {
  var text = (captionState.text || "").trim().toUpperCase();
  var sub = (captionState.subtitle || "").trim().toUpperCase();
  if (!text && !sub) return;
  var pal = captionPalette();
  var margin = W * 0.05;
  var maxW = W - margin * 2;

  ctx.save();
  ctx.textAlign = "left";
  ctx.textBaseline = "alphabetic";

  // Lettering follows the cover's short side, so it stays in proportion on
  // square, portrait and wide covers instead of towering over the panels.
  var px = text ? fitCaptionFont(ctx, text, maxW, Math.round(Math.min(W, H) * 0.10)) : 0;
  var subPx = Math.max(18, Math.round(Math.min(W, H) * 0.028));

  // Soft dark scrim behind the caption band: the lettering reads on a calm
  // strip instead of stamping over the faces in the lower panels.
  var bandTop, bandBottom;
  if (captionState.place === "top") {
    bandTop = 0;
    bandBottom = H * 0.06 + px + (sub ? subPx * 2.2 : px * 0.3);
  } else {
    bandTop = H - H * 0.055 - (sub ? px * 0.42 : 0) - px * 1.35;
    bandBottom = H;
  }
  var scrim = ctx.createLinearGradient(0, bandTop, 0, bandBottom);
  if (captionState.place === "top") {
    scrim.addColorStop(0, "rgba(16, 3, 28, 0.55)");
    scrim.addColorStop(1, "rgba(16, 3, 28, 0)");
  } else {
    scrim.addColorStop(0, "rgba(16, 3, 28, 0)");
    scrim.addColorStop(1, "rgba(16, 3, 28, 0.55)");
  }
  ctx.fillStyle = scrim;
  ctx.fillRect(0, Math.max(0, bandTop), W, Math.min(H, bandBottom) - Math.max(0, bandTop));

  if (text) {
    var grad = ctx.createLinearGradient(0, 0, 0, px * 1.2);
    grad.addColorStop(0, pal.fill);
    grad.addColorStop(1, pal.fill2);
    ctx.font = "900 " + px + "px 'Arial Black', 'Segoe UI', Arial, sans-serif";
    ctx.lineJoin = "round";
    ctx.lineWidth = Math.max(3, px * 0.09);
    ctx.strokeStyle = pal.stroke;
    ctx.shadowColor = pal.shadow;
    ctx.shadowBlur = px * 0.22;
    ctx.shadowOffsetY = px * 0.05;
    var capY = captionState.place === "top"
      ? H * 0.06 + px
      : H - H * 0.055 - (sub ? px * 0.42 : 0);
    ctx.strokeText(text, margin, capY);
    ctx.fillStyle = grad;
    ctx.fillText(text, margin, capY);
    ctx.shadowColor = "transparent";
    ctx.shadowBlur = 0;
    ctx.shadowOffsetY = 0;
  }

  if (sub) {
    ctx.font = "700 " + subPx + "px 'Segoe UI', Arial, sans-serif";
    ctx.lineWidth = Math.max(2, subPx * 0.14);
    ctx.strokeStyle = pal.stroke;
    var subY = captionState.place === "top"
      ? H * 0.06 + px + subPx * 1.6
      : H - H * 0.045;
    // A thin neon underline bar under the subtitle.
    var subW = ctx.measureText(sub).width;
    ctx.fillStyle = pal.shadow;
    var barY = subY + subPx * 0.45;
    ctx.fillRect(margin, barY, Math.min(subW, maxW), Math.max(3, subPx * 0.16));
    ctx.strokeText(sub, margin, subY);
    ctx.fillStyle = "#ffffff";
    ctx.fillText(sub, margin, subY);
  }
  ctx.restore();
}
