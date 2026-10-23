export interface CertData {
  name: string;
  eventTitle: string;
  certNo: string;
  issuedAt: string;
  organizer: string;
  dateText: string;
  templateId: string;
}

const W = 1600;
const H = 1131;

const INK = "#16233F";
const NAVY = "#17306E";
const GOLD = "#B8912F";
const PAPER = "#FCFAF4";
const SEAL = "#9E2B25";

const serif = '"Songti SC", "Noto Serif SC", "STSong", Georgia, serif';
const sans = '"PingFang SC", "Microsoft YaHei", "Segoe UI", sans-serif';

function setFont(ctx: CanvasRenderingContext2D, size: number, family = sans, weight = "400") {
  ctx.font = `${weight} ${size}px ${family}`;
}

function centerText(
  ctx: CanvasRenderingContext2D,
  text: string,
  x: number,
  y: number,
  size: number,
  color: string,
  family = serif,
  weight = "400",
) {
  ctx.save();
  setFont(ctx, size, family, weight);
  ctx.fillStyle = color;
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillText(text, x, y);
  ctx.restore();
}

function wrapLines(
  ctx: CanvasRenderingContext2D,
  text: string,
  maxWidth: number,
  size: number,
  family = sans,
): string[] {
  ctx.save();
  setFont(ctx, size, family);
  const chars = Array.from(text);
  const lines: string[] = [];
  let line = "";
  chars.forEach((ch) => {
    const test = line + ch;
    if (ctx.measureText(test).width > maxWidth && line) {
      lines.push(line);
      line = ch;
    } else {
      line = test;
    }
  });
  if (line) lines.push(line);
  ctx.restore();
  return lines;
}

function drawFrame(ctx: CanvasRenderingContext2D) {
  ctx.save();
  ctx.strokeStyle = GOLD;
  ctx.lineWidth = 3;
  ctx.strokeRect(46, 46, W - 92, H - 92);
  ctx.globalAlpha = 0.5;
  ctx.lineWidth = 1;
  ctx.strokeRect(62, 62, W - 124, H - 124);
  ctx.globalAlpha = 1;

  const corners: [number, number, number, number][] = [
    [46, 46, 1, 1],
    [W - 46, 46, -1, 1],
    [46, H - 46, 1, -1],
    [W - 46, H - 46, -1, -1],
  ];
  ctx.lineWidth = 5;
  corners.forEach(([x, y, dx, dy]) => {
    ctx.beginPath();
    ctx.moveTo(x + 34 * dx, y);
    ctx.lineTo(x, y);
    ctx.lineTo(x, y + 34 * dy);
    ctx.stroke();
  });
  ctx.restore();
}

function drawSeal(ctx: CanvasRenderingContext2D, cx: number, cy: number, scale = 1) {
  ctx.save();
  ctx.translate(cx, cy);
  ctx.rotate(-0.14);
  ctx.scale(scale, scale);
  ctx.globalAlpha = 0.82;
  ctx.strokeStyle = SEAL;
  ctx.lineWidth = 4;
  ctx.beginPath();
  ctx.arc(0, 0, 88, 0, Math.PI * 2);
  ctx.stroke();
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  ctx.arc(0, 0, 78, 0, Math.PI * 2);
  ctx.stroke();

  const ring = "会务通会务管理中心 · 证书专用章";
  ctx.fillStyle = SEAL;
  setFont(ctx, 15, sans, "500");
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  const chars = Array.from(ring);
  const start = -Math.PI * 0.78;
  const step = (Math.PI * 1.56) / (chars.length - 1);
  chars.forEach((ch, i) => {
    const a = start + step * i;
    ctx.save();
    ctx.translate(Math.sin(a) * 65, -Math.cos(a) * 65);
    ctx.rotate(a);
    ctx.fillText(ch, 0, 0);
    ctx.restore();
  });

  // star
  ctx.beginPath();
  const R = 22;
  for (let i = 0; i < 10; i++) {
    const r = i % 2 === 0 ? R : R * 0.42;
    const a = (Math.PI / 5) * i - Math.PI / 2;
    const x = Math.cos(a) * r;
    const y = Math.sin(a) * r;
    i === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y);
  }
  ctx.closePath();
  ctx.fill();

  ctx.globalAlpha = 0.62;
  setFont(ctx, 14, sans, "500");
  ctx.fillText("MEETINGFLOW", 0, 46);
  ctx.restore();
}

function drawClassic(ctx: CanvasRenderingContext2D, d: CertData) {
  ctx.fillStyle = PAPER;
  ctx.fillRect(0, 0, W, H);

  drawFrame(ctx);

  centerText(ctx, d.organizer, W / 2, 142, 22, GOLD, sans);
  ctx.fillStyle = GOLD;
  ctx.fillRect(W / 2 - 46, 168, 92, 1);

  centerText(ctx, "参 会 证 书", W / 2, 288, 88, INK, serif);
  centerText(ctx, "CERTIFICATE  OF  ATTENDANCE", W / 2, 355, 17, "#8C7B52", sans);

  centerText(ctx, "兹 证 明", W / 2, 458, 24, "#5A6478", sans);

  centerText(ctx, d.name, W / 2, 558, 66, NAVY, serif);
  ctx.strokeStyle = "rgba(184,145,47,0.55)";
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(W / 2 - 170, 606);
  ctx.lineTo(W / 2 + 170, 606);
  ctx.stroke();

  const bodySize = 28;
  centerText(ctx, `于 ${d.dateText} 参加`, W / 2, 668, bodySize, "#3C4658", sans);

  const lines = wrapLines(ctx, `「${d.eventTitle}」`, 1080, 34);
  lines.forEach((l, i) => {
    centerText(ctx, l, W / 2, 724 + i * 46, 34, NAVY, serif);
  });
  const afterY = 724 + lines.length * 46;
  centerText(ctx, "并完成全部议程，特此证明。", W / 2, afterY + 18, bodySize, "#3C4658", sans);

  ctx.save();
  ctx.strokeStyle = "rgba(22,35,63,0.18)";
  ctx.beginPath();
  ctx.moveTo(150, H - 210);
  ctx.lineTo(430, H - 210);
  ctx.moveTo(W - 430, H - 210);
  ctx.lineTo(W - 150, H - 210);
  ctx.stroke();
  ctx.restore();

  ctx.save();
  setFont(ctx, 15, sans);
  ctx.fillStyle = "#6B7280";
  ctx.textAlign = "left";
  ctx.fillText(`证书编号  ${d.certNo}`, 150, H - 180);
  ctx.fillText(`签发日期  ${d.issuedAt}`, 150, H - 150);
  ctx.textAlign = "right";
  ctx.fillText("可在会务通证书中心在线验真", W - 150, H - 150);
  ctx.restore();

  drawSeal(ctx, W - 290, H - 285, 0.92);
  centerText(ctx, d.organizer, W - 290, H - 152, 19, "#4A5468", sans);
}

function drawModern(ctx: CanvasRenderingContext2D, d: CertData) {
  ctx.fillStyle = "#FFFFFF";
  ctx.fillRect(0, 0, W, H);
  ctx.fillStyle = NAVY;
  ctx.fillRect(0, 0, 268, H);

  ctx.save();
  ctx.translate(134, H / 2);
  ctx.rotate(-Math.PI / 2);
  ctx.fillStyle = "rgba(255,255,255,0.95)";
  setFont(ctx, 46, serif);
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillText("会 务 通", 0, -8);
  ctx.fillStyle = "rgba(255,255,255,0.5)";
  setFont(ctx, 15, sans);
  ctx.fillText("M E E T I N G F L O W", 0, 40);
  ctx.restore();

  ctx.strokeStyle = GOLD;
  ctx.lineWidth = 2;
  ctx.strokeRect(268, 0, W - 268, H);

  ctx.fillStyle = GOLD;
  ctx.fillRect(360, 132, 54, 5);

  ctx.save();
  setFont(ctx, 17, sans, "500");
  ctx.fillStyle = "#8C7B52";
  ctx.fillText("CERTIFICATE OF ATTENDANCE", 360, 196);
  ctx.restore();

  centerText(ctx, "参会证明", 360, 262, 58, INK, serif);
  ctx.textAlign = "left";

  ctx.save();
  setFont(ctx, 24, sans);
  ctx.fillStyle = "#5A6478";
  ctx.fillText("兹证明", 360, 392);
  ctx.restore();

  ctx.save();
  setFont(ctx, 74, serif);
  ctx.fillStyle = NAVY;
  ctx.textAlign = "left";
  ctx.fillText(d.name, 360, 490);
  ctx.restore();

  ctx.fillStyle = GOLD;
  ctx.fillRect(360, 526, 118, 2);

  const lines = wrapLines(ctx, `${d.dateText} 参加「${d.eventTitle}」，`, 880, 30);
  ctx.save();
  setFont(ctx, 30, sans);
  ctx.fillStyle = "#3C4658";
  ctx.textAlign = "left";
  lines.forEach((l, i) => ctx.fillText(l, 360, 600 + i * 48));
  ctx.fillText("完成全部议程，特此证明。", 360, 600 + lines.length * 48 + 12);
  ctx.restore();

  ctx.save();
  setFont(ctx, 15, sans);
  ctx.fillStyle = "#6B7280";
  ctx.fillText(`证书编号  ${d.certNo}`, 360, H - 118);
  ctx.fillText(`签发日期  ${d.issuedAt}`, 360, H - 88);
  ctx.restore();

  drawSeal(ctx, W - 250, H - 220, 0.86);
}

function drawMinimal(ctx: CanvasRenderingContext2D, d: CertData) {
  ctx.fillStyle = "#FDFCF8";
  ctx.fillRect(0, 0, W, H);
  ctx.strokeStyle = "rgba(22,35,63,0.55)";
  ctx.lineWidth = 1.2;
  ctx.strokeRect(70, 70, W - 140, H - 140);

  centerText(ctx, d.organizer, W / 2, 168, 19, "#6B7280", sans);
  centerText(ctx, "CERTIFICATE", W / 2, 268, 16, GOLD, sans);
  centerText(ctx, "参 会 证 明", W / 2, 360, 62, INK, serif);

  centerText(ctx, d.name, W / 2, 520, 60, NAVY, serif);
  ctx.strokeStyle = "rgba(22,35,63,0.25)";
  ctx.beginPath();
  ctx.moveTo(W / 2 - 200, 568);
  ctx.lineTo(W / 2 + 200, 568);
  ctx.stroke();

  const lines = wrapLines(ctx, `${d.dateText} 参加「${d.eventTitle}」`, 1000, 27);
  ctx.save();
  ctx.textAlign = "center";
  setFont(ctx, 27, sans);
  ctx.fillStyle = "#3C4658";
  lines.forEach((l, i) => ctx.fillText(l, W / 2, 640 + i * 44));
  ctx.fillText("完成全部议程，特此证明。", W / 2, 640 + lines.length * 44 + 10);
  ctx.restore();

  ctx.save();
  setFont(ctx, 14, sans);
  ctx.fillStyle = "#7A7F8A";
  ctx.textAlign = "center";
  ctx.fillText(`${d.certNo}   ·   ${d.issuedAt}`, W / 2, H - 190);
  ctx.fillText("本证书由会务通会务系统签发，可在线上验真", W / 2, H - 162);
  ctx.restore();

  ctx.strokeStyle = "rgba(22,35,63,0.25)";
  ctx.beginPath();
  ctx.moveTo(W - 430, H - 250);
  ctx.lineTo(W - 210, H - 250);
  ctx.stroke();
  centerText(ctx, "主办方签发", W - 320, H - 222, 15, "#7A7F8A", sans);
}

export function drawCertificate(canvas: HTMLCanvasElement, d: CertData) {
  canvas.width = W;
  canvas.height = H;
  const ctx = canvas.getContext("2d");
  if (!ctx) return;
  ctx.clearRect(0, 0, W, H);
  ctx.textBaseline = "alphabetic";

  if (d.templateId === "tpl-modern") drawModern(ctx, d);
  else if (d.templateId === "tpl-minimal") drawMinimal(ctx, d);
  else drawClassic(ctx, d);
}

export function certificateDataUrl(d: CertData) {
  const canvas = document.createElement("canvas");
  drawCertificate(canvas, d);
  return canvas.toDataURL("image/png");
}

export function downloadCertificate(d: CertData) {
  const url = certificateDataUrl(d);
  const a = document.createElement("a");
  a.href = url;
  a.download = `参会证书-${d.name}-${d.certNo}.png`;
  document.body.appendChild(a);
  a.click();
  a.remove();
}

export function printCertificate(d: CertData) {
  const url = certificateDataUrl(d);
  const win = window.open("", "_blank", "width=1100,height=820");
  if (!win) return;
  win.document.write(
    `<html><head><title>${d.name} · 参会证书</title><style>@page{size:A4 landscape;margin:0}body{margin:0;display:flex;align-items:center;justify-content:center;background:#fff}img{width:100%;max-width:100%;display:block}</style></head><body><img src="${url}" onload="window.focus();window.print();" /></body></html>`,
  );
  win.document.close();
}
