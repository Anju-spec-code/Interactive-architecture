(function() {
  const SVG_NS = "http://www.w3.org/2000/svg";
  const W = 1600, H = 900; // viewBox

  const stage = document.getElementById("stage");

  // Build base SVG
  const svg = el("svg", { viewBox:`0 0 ${W} ${H}`, tabindex:"0", id:"diagram-svg" });
  stage.appendChild(svg);

  // Grid (toggle via diagram.showGrid)
  const grid = el("g", { id:"grid", class: diagram.showGrid ? "" : "hidden" });
  for (let x=0; x<=W; x+=40) grid.appendChild(el("line", { x1:x, y1:0, x2:x, y2:H, class:"grid" }));
  for (let y=0; y<=H; y+=40) grid.appendChild(el("line", { x1:0, y1:y, x2:W, y2:y, class:"grid" }));
  svg.appendChild(grid);

  // Defs: arrow markers
  const defs = el("defs", {});
  defs.appendChild(marker("arrow", "#64748B"));
  svg.appendChild(defs);

  // Panels (groups)
  const gPanels = el("g");
  diagram.groups.forEach(g => {
    const panel = el("rect", { x:g.x, y:g.y, width:g.w, height:g.h, class:"panel" });
    gPanels.appendChild(panel);
    // Title chip
    const chipW = Math.max(90, g.label.length * 7.5);
    const chip = el("rect", { x:g.x+14, y:g.y+12, width:chipW, height:22, class:"badge" });
    const chipT = el("text", { x:g.x+14+10, y:g.y+12+15, class:"badge-text" });
    chipT.textContent = g.label;
    gPanels.appendChild(chip);
    gPanels.appendChild(chipT);
  });
  svg.appendChild(gPanels);

  // Edges layer under nodes for clean overlaps
  const gEdges = el("g");
  svg.appendChild(gEdges);

  // Nodes
  const gNodes = el("g");
  diagram.nodes.forEach(n => {
    const nGroup = el("g", { "data-id": n.id, class:"node-group" });
    const rect = el("rect", {
      x:n.x, y:n.y, width:n.w, height:n.h,
      class: "node" + (n.link ? " interactive" : "")
    });
    nGroup.appendChild(rect);
    // Title
    const title = el("text", { x:n.x+14, y:n.y+26, class:"node-title" });
    title.textContent = n.label;
    nGroup.appendChild(title);
    // Sub
    if (n.sub) {
      const sub = el("text", { x:n.x+14, y:n.y+n.h-14, class:"node-sub" });
      sub.textContent = n.sub;
      nGroup.appendChild(sub);
    }
    // Click
    if (n.link) {
      nGroup.style.cursor = "pointer";
      nGroup.addEventListener("click", () => window.open(n.link, "_blank"));
    }
    gNodes.appendChild(nGroup);
  });
  svg.appendChild(gNodes);

  // Draw edges AFTER nodes are measured (we have positions); orthogonal elbow
  diagram.edges.forEach(e => {
    const s = centerOf(e.from), t = centerOf(e.to);
    const pathD = orthPath(s, t, e);
    const path = el("path", {
      d: pathD,
      class: "edge" + (e.animated ? " animated" : ""),
      "marker-end": "url(#arrow)"
    });
    gEdges.appendChild(path);

    // Edge label at mid point
    if (e.label) {
      const mid = midpointOnPath(path, 0.5);
      const label = el("text", { x: mid.x, y: mid.y - 6, class:"edge-label", "text-anchor":"middle" });
      label.textContent = e.label;
      gEdges.appendChild(label);
    }
  });

  // Title/subtitle/footer
  document.getElementById("diagram-title").textContent = diagram.title || "";
  document.getElementById("diagram-subtitle").textContent = diagram.subtitle || "";
  document.getElementById("footer-note").textContent = diagram.footer || "";

  // Pan/zoom
  const panzoom = svgPanZoom(svg, { controlIconsEnabled: true, fit:true, center:true, minZoom:0.5, maxZoom:6 });

  // Buttons
  document.getElementById("reset-view").onclick = () => { panzoom.resetZoom(); panzoom.center(); panzoom.fit(); };
  document.getElementById("toggle-theme").onclick = () => {
    const root = document.documentElement;
    root.setAttribute("data-theme", root.getAttribute("data-theme")==="dark" ? "light" : "dark");
  };
  document.getElementById("export-svg").onclick = () => downloadSVG();
  document.getElementById("export-png").onclick = () => downloadPNG();

  /* ---------- helpers ---------- */
  function el(tag, attrs) {
    const x = document.createElementNS(SVG_NS, tag);
    for (const k in attrs) x.setAttribute(k, attrs[k]);
    return x;
  }
  function marker(id, color) {
    const m = el("marker", { id, viewBox:"0 0 10 10", refX:"9.5", refY:"5", markerWidth:"8", markerHeight:"8", orient:"auto-start-reverse" });
    const p = el("path", { d:"M 0 0 L 10 5 L 0 10 z", fill: color });
    m.appendChild(p);
    return m;
  }
  function centerOf(nodeId) {
    const n = diagram.nodes.find(n => n.id === nodeId);
    return { x: n.x + n.w/2, y: n.y + n.h/2, w:n.w, h:n.h };
  }
  // Simple orthogonal path: horizontal → vertical with a mild radius
  function orthPath(s, t, e = {}) {
  // e.route: 'hv' (default) or 'vh'
  // e.vx / e.vy: optional elbow coordinates
  const route = e.route || 'hv';

  if (route === 'vh') {
    const vy = e.vy ?? (s.y + t.y) / 2;
    return `M ${s.x} ${s.y}
            L ${s.x} ${vy-10}
            C ${s.x} ${vy-4} ${s.x} ${vy-4} ${s.x+4} ${vy}
            L ${t.x-4} ${vy}
            C ${t.x-4} ${vy} ${t.x} ${vy} ${t.x} ${vy+4}
            L ${t.x} ${t.y}`;
  } else {
    const vx = e.vx ?? (s.x + t.x) / 2;
    return `M ${s.x} ${s.y}
            L ${vx-10} ${s.y}
            C ${vx-4} ${s.y} ${vx-4} ${s.y} ${vx} ${s.y+4}
            L ${vx} ${t.y-4}
            C ${vx} ${t.y-4} ${vx} ${t.y} ${vx+4} ${t.y}
            L ${t.x} ${t.y}`;
  }
}

  function pathLength(path) { return path.getTotalLength(); }
  function pointAt(path, t) { return path.getPointAtLength(pathLength(path)*t); }
  function midpointOnPath(path, t) { const p = pointAt(path, t); return { x:p.x, y:p.y }; }

  function downloadSVG() {
    const clone = svg.cloneNode(true);
    clone.removeAttribute("style");
    const s = new XMLSerializer().serializeToString(clone);
    const blob = new Blob([s], { type: "image/svg+xml;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    triggerDownload(url, (diagram.title || "diagram") + ".svg");
  }

  function downloadPNG() {
    const clone = svg.cloneNode(true);
    const s = new XMLSerializer().serializeToString(clone);
    const svg64 = btoa(unescape(encodeURIComponent(s)));
    const image64 = "data:image/svg+xml;base64," + svg64;

    const img = new Image();
    img.onload = function() {
      const scale = 2; // export @2x
      const canvas = document.createElement("canvas");
      canvas.width = W * scale; canvas.height = H * scale;
      const ctx = canvas.getContext("2d");
      ctx.fillStyle = getComputedStyle(document.documentElement).getPropertyValue("--bg").trim() || "#ffffff";
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
      canvas.toBlob(blob => triggerDownload(URL.createObjectURL(blob), (diagram.title || "diagram") + ".png"));
    };
    img.src = image64;
  }
  function triggerDownload(url, filename) {
    const a = document.createElement("a");
    a.href = url; a.download = filename; a.click();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  }

  // Keyboard helpers
  document.addEventListener("keydown", (e) => {
    if (e.key === "g") grid.classList.toggle("hidden");
    if (e.key === "0") { panzoom.resetZoom(); panzoom.center(); panzoom.fit(); }
    if (e.key === "1") panzoom.zoomIn();
    if (e.key === "2") panzoom.zoomOut();
  });
})();
