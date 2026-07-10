// cag-viewport — a self-contained 3D shot-angle viewport (Three.js, lazy-loaded).
// Attributes: az el dist lens roll (numbers), subj ("person"|"object"),
// camview ("orbit"|"top"|"side"|"pov"). Reads ds-a CSS tokens for theming.
(function () {
  var THREE_LOCAL = "./three.min.js";
  var THREE_CDN = "https://cdnjs.cloudflare.com/ajax/libs/three.js/r128/three.min.js";
  var _p = null;
  function inject(src) {
    return new Promise(function (res, rej) {
      var s = document.createElement("script");
      s.src = src;
      s.onload = function () { window.THREE ? res(window.THREE) : rej(new Error("no-three")); };
      s.onerror = function () { rej(new Error("load " + src)); };
      document.head.appendChild(s);
    });
  }
  function loadThree() {
    if (window.THREE) return Promise.resolve(window.THREE);
    if (_p) return _p;
    _p = inject(THREE_LOCAL).catch(function () { return inject(THREE_CDN); });
    return _p;
  }
  var D2R = Math.PI / 180;

  class CagViewport extends HTMLElement {
    static get observedAttributes() { return ["az", "el", "dist", "lens", "roll", "subj", "camview"]; }
    connectedCallback() {
      if (this._mounted) return; this._mounted = true;
      this.style.display = "block"; this.style.position = "relative"; this.style.overflow = "hidden";
      var self = this;
      loadThree().then(function (T) {
        if (!self._mounted) return;
        self._T = T; self._build(); self._update(); self._resize(); self._render();
        self._ro = new ResizeObserver(function () { self._resize(); self._render(); });
        self._ro.observe(self);
      }).catch(function () {
        self.innerHTML = '<div style="width:100%;height:100%;display:grid;place-items:center;font:600 10px monospace;color:#999">3D tak tersedia</div>';
      });
    }
    disconnectedCallback() { this._dispose(); this._mounted = false; }
    attributeChangedCallback() { if (this._T && this._scene) { this._update(); this._render(); } }

    _c(name, fb) { try { var v = getComputedStyle(this).getPropertyValue(name).trim(); return v || fb; } catch (e) { return fb; } }
    _rgb(name, fb) {
      try {
        var raw = getComputedStyle(this).getPropertyValue(name).trim();
        if (!raw) return fb;
        var cv = document.createElement("canvas"); cv.width = cv.height = 1;
        var ctx = cv.getContext("2d");
        ctx.fillStyle = "rgb(0,0,0)";
        ctx.fillStyle = raw;
        ctx.fillRect(0, 0, 1, 1);
        var d = ctx.getImageData(0, 0, 1, 1).data;
        return "rgb(" + d[0] + "," + d[1] + "," + d[2] + ")";
      } catch (e) { return fb; }
    }
    _num(a, d) { var v = parseFloat(this.getAttribute(a)); return isFinite(v) ? v : d; }

    _build() {
      var T = this._T;
      var bg = this._rgb("--card", "rgb(250,249,245)"), gridc = this._rgb("--muted-foreground", "rgb(120,116,106)"), fg = this._rgb("--foreground", "rgb(26,25,21)");
      var r = new T.WebGLRenderer({ antialias: true, alpha: true, preserveDrawingBuffer: true });
      r.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
      this.appendChild(r.domElement);
      r.domElement.style.display = "block"; r.domElement.style.width = "100%"; r.domElement.style.height = "100%";
      r.setClearColor(new T.Color(bg), 1);
      this._r = r;
      var scene = new T.Scene(); this._scene = scene;
      scene.add(new T.AmbientLight(0xffffff, 0.7));
      var dl = new T.DirectionalLight(0xffffff, 0.5); dl.position.set(4, 9, 6); scene.add(dl);
      var grid = new T.GridHelper(8, 8, new T.Color(gridc), new T.Color(gridc));
      grid.material.opacity = 0.32; grid.material.transparent = true; scene.add(grid);
      this._subjMat = new T.MeshStandardMaterial({ color: new T.Color(fg), roughness: 0.85, metalness: 0.0 });
      this._subjGroup = new T.Group(); scene.add(this._subjGroup);
      this._shotGroup = new T.Group(); scene.add(this._shotGroup);
      this._persp = new T.PerspectiveCamera(45, 1, 0.1, 200);
      this._ortho = new T.OrthographicCamera(-4, 4, 4, -4, 0.01, 200);
      this._shotCam = new T.PerspectiveCamera(40, 16 / 9, 0.05, 200);
      this._viewAz = 42; this._viewEl = 24; this._viewDist = 6; this._userZoomed = false;
      this._bindDrag();
    }

    _buildSubject() {
      var T = this._T, g = this._subjGroup;
      while (g.children.length) g.remove(g.children[0]);
      var subj = this.getAttribute("subj") || "person";
      if (subj === "object") {
        var ped = new T.Mesh(new T.CylinderGeometry(0.42, 0.5, 0.3, 24), new T.MeshStandardMaterial({ color: new T.Color(this._rgb("--border", "rgb(219,215,203)")), roughness: 1 }));
        ped.position.y = 0.15; g.add(ped);
        var box = new T.Mesh(new T.BoxGeometry(0.6, 0.7, 0.6), this._subjMat); box.position.y = 0.65; g.add(box);
        this._ty = 0.7;
      } else {
        var body = new T.Mesh(new T.CylinderGeometry(0.16, 0.22, 1.05, 20), this._subjMat); body.position.y = 0.85; g.add(body);
        var head = new T.Mesh(new T.SphereGeometry(0.18, 20, 16), this._subjMat); head.position.y = 1.6; g.add(head);
        this._ty = 1.0;
      }
    }

    _update() {
      var T = this._T; if (!T) return;
      if (this.getAttribute("subj") !== this._lastSubj) { this._buildSubject(); this._lastSubj = this.getAttribute("subj"); }
      var az = this._num("az", 30), el = this._num("el", 4), dist = Math.max(0.5, this._num("dist", 3)), lens = Math.max(8, this._num("lens", 50)), roll = this._num("roll", 0);
      var ty = this._ty || 1.0, target = new T.Vector3(0, ty, 0);
      var azR = az * D2R, elR = el * D2R;
      var camPos = new T.Vector3(Math.sin(azR) * Math.cos(elR) * dist, ty + Math.sin(elR) * dist, Math.cos(azR) * Math.cos(elR) * dist);
      this._camPos = camPos; this._target = target; this._dist = dist;
      if (!this._userZoomed) this._viewDist = Math.max(4.8, dist * 1.4 + 1.8);
      var vfovR = 2 * Math.atan(24 / (2 * lens));
      var accent = new T.Color(this._rgb("--primary", "rgb(217,119,87)"));

      var g = this._shotGroup; while (g.children.length) g.remove(g.children[0]);
      var marker = new T.Mesh(new T.SphereGeometry(0.1, 14, 12), new T.MeshBasicMaterial({ color: accent }));
      marker.position.copy(camPos); g.add(marker);

      var fwd = target.clone().sub(camPos).normalize();
      var wup = Math.abs(fwd.y) > 0.95 ? new T.Vector3(0, 0, 1) : new T.Vector3(0, 1, 0);
      var right = new T.Vector3().crossVectors(fwd, wup).normalize();
      var up = new T.Vector3().crossVectors(right, fwd).normalize();
      if (roll) { var rr = roll * D2R, ca = Math.cos(rr), sa = Math.sin(rr); var nr = right.clone().multiplyScalar(ca).add(up.clone().multiplyScalar(sa)); var nu = up.clone().multiplyScalar(ca).sub(right.clone().multiplyScalar(sa)); right = nr; up = nu; }
      var L = dist * 0.9, hh = Math.tan(vfovR / 2) * L, hw = hh * (16 / 9);
      var center = camPos.clone().add(fwd.clone().multiplyScalar(L));
      var c1 = center.clone().add(right.clone().multiplyScalar(hw)).add(up.clone().multiplyScalar(hh));
      var c2 = center.clone().add(right.clone().multiplyScalar(hw)).add(up.clone().multiplyScalar(-hh));
      var c3 = center.clone().add(right.clone().multiplyScalar(-hw)).add(up.clone().multiplyScalar(-hh));
      var c4 = center.clone().add(right.clone().multiplyScalar(-hw)).add(up.clone().multiplyScalar(hh));
      var pts = [camPos, c1, camPos, c2, camPos, c3, camPos, c4, c1, c2, c2, c3, c3, c4, c4, c1];
      g.add(new T.LineSegments(new T.BufferGeometry().setFromPoints(pts), new T.LineBasicMaterial({ color: accent })));

      var R = Math.max(0.001, Math.cos(elR) * dist), rp = [], i;
      for (i = 0; i <= 64; i++) { var a = i / 64 * Math.PI * 2; rp.push(new T.Vector3(Math.sin(a) * R, 0.02, Math.cos(a) * R)); }
      var ringMat = new T.LineBasicMaterial({ color: accent, transparent: true, opacity: 0.4 });
      g.add(new T.Line(new T.BufferGeometry().setFromPoints(rp), ringMat));
      g.add(new T.Line(new T.BufferGeometry().setFromPoints([new T.Vector3(0, 0.02, 0), new T.Vector3(camPos.x, 0.02, camPos.z)]), ringMat));

      this._shotCam.fov = vfovR * 180 / Math.PI; this._shotCam.position.copy(camPos); this._shotCam.up.copy(up); this._shotCam.lookAt(target); this._shotCam.updateProjectionMatrix();
    }

    _setOrtho(H) { var w = this.clientWidth || 300, h = this.clientHeight || 200, as = w / Math.max(1, h); this._ortho.left = -H * as; this._ortho.right = H * as; this._ortho.top = H; this._ortho.bottom = -H; this._ortho.near = 0.01; this._ortho.far = 200; this._ortho.updateProjectionMatrix(); }
    _viewCam() {
      var T = this._T, cv = this.getAttribute("camview") || "orbit", t = this._target || new T.Vector3(0, 1, 0), dist = this._dist || 3;
      if (cv === "pov") return this._shotCam;
      if (cv === "top") { this._ortho.position.set(0, 12, 0); this._ortho.up.set(0, 0, -1); this._ortho.lookAt(0, 0, 0); this._setOrtho(Math.max(3.8, dist * 0.75)); return this._ortho; }
      if (cv === "side") { this._ortho.position.set(11, t.y, 0.001); this._ortho.up.set(0, 1, 0); this._ortho.lookAt(t); this._setOrtho(Math.max(3.2, dist * 0.72)); return this._ortho; }
      var azR = this._viewAz * D2R, elR = this._viewEl * D2R, d = this._viewDist;
      this._persp.position.set(t.x + Math.sin(azR) * Math.cos(elR) * d, t.y + Math.sin(elR) * d, t.z + Math.cos(azR) * Math.cos(elR) * d);
      this._persp.up.set(0, 1, 0); this._persp.lookAt(t); return this._persp;
    }
    _resize() { if (!this._r) return; var w = this.clientWidth || 300, h = this.clientHeight || 200; this._r.setSize(w, h, false); this._persp.aspect = w / Math.max(1, h); this._persp.updateProjectionMatrix(); }
    _render() { if (this._r && this._scene) this._r.render(this._scene, this._viewCam()); }

    _bindDrag() {
      var self = this, el = this._r.domElement, drag = false, px = 0, py = 0;
      el.style.touchAction = "none";
      var isOrbit = function () { return (self.getAttribute("camview") || "orbit") === "orbit"; };
      el.style.cursor = isOrbit() ? "grab" : "default";
      el.addEventListener("pointerdown", function (e) { if (!isOrbit()) return; drag = true; px = e.clientX; py = e.clientY; try { el.setPointerCapture(e.pointerId); } catch (x) {} el.style.cursor = "grabbing"; });
      el.addEventListener("pointermove", function (e) { if (!drag) return; var dx = e.clientX - px, dy = e.clientY - py; px = e.clientX; py = e.clientY; self._viewAz -= dx * 0.4; self._viewEl = Math.max(-80, Math.min(82, self._viewEl + dy * 0.35)); self._render(); });
      el.addEventListener("pointerup", function () { drag = false; el.style.cursor = isOrbit() ? "grab" : "default"; });
      el.addEventListener("wheel", function (e) { if (!isOrbit()) return; e.preventDefault(); self._userZoomed = true; self._viewDist = Math.max(2.6, Math.min(18, self._viewDist * (1 + e.deltaY * 0.001))); self._render(); }, { passive: false });
    }
    _dispose() {
      try {
        if (this._ro) this._ro.disconnect();
        if (this._r) { this._r.dispose(); if (this._r.forceContextLoss) this._r.forceContextLoss(); if (this._r.domElement && this._r.domElement.parentNode) this._r.domElement.parentNode.removeChild(this._r.domElement); }
      } catch (e) {}
      this._scene = null; this._r = null;
    }
  }
  if (!customElements.get("cag-viewport")) customElements.define("cag-viewport", CagViewport);
})();
