"use client";
import React from "react";
import { ModalDialog } from "@/components/ds/Modal";
import { Button } from "@/components/ds/Button";
import { Badge } from "@/components/ds/Badge";
import { Tabs } from "@/components/ds/Tabs";
import { CagViewport } from "@/components/CagViewport";
import { schemaJson } from "@/lib/dataPrompt";
import { useApp } from "@/state/AppState";

const inputStyle: React.CSSProperties = {
  width: "100%",
  background: "var(--background)",
  border: "var(--border-width) solid var(--border)",
  borderRadius: "var(--radius-md)",
  padding: "10px 12px",
  font: "400 13px var(--font-sans)",
  color: "var(--foreground)",
  outline: "none",
};

const textareaStyle: React.CSSProperties = {
  width: "100%",
  resize: "vertical",
  background: "var(--background)",
  border: "var(--border-width) solid var(--border)",
  borderRadius: "var(--radius-md)",
  padding: "12px",
  font: "400 12px/1.5 var(--font-mono)",
  color: "var(--foreground)",
  outline: "none",
};

const hint: React.CSSProperties = {
  font: "400 12px/1.5 var(--font-sans)",
  color: "var(--muted-foreground)",
};

const capLabel: React.CSSProperties = {
  font: "600 10px var(--font-mono)",
  letterSpacing: ".06em",
  textTransform: "uppercase",
  color: "var(--muted-foreground)",
};

function ImportModal() {
  const app = useApp();
  const tab = app.importTab;
  return (
    <ModalDialog
      open={app.importOpen}
      onClose={app.closeImport}
      title="Impor data prompt · Import"
      width="min(660px,94vw)"
      height="min(580px,88vh)"
    >
      <Tabs
        tabs={[
          { key: "paste", label: "Tempel JSON" },
          { key: "file", label: "Unggah .json" },
          { key: "youtube", label: "YouTube" },
          { key: "photo", label: "Foto" },
        ]}
        value={tab}
        onChange={app.setImportTab}
      />

      {tab === "paste" ? (
        <div style={{ paddingTop: 16, display: "flex", flexDirection: "column", gap: 10 }}>
          <div style={hint}>
            Tempel JSON hasil dari AI Anda (skema camera-angle-guide/v2). · Paste the JSON your AI returned.
          </div>
          <textarea
            value={app.pasteText}
            onChange={(e) => app.setPasteText(e.target.value)}
            placeholder={'{ "scenes": [ { "frames": [ ... ] } ] }'}
            style={{ ...textareaStyle, height: 210 }}
          />
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
            <Button variant="primary" size="sm" onClick={app.doParsePaste}>
              Parse &amp; tambahkan · Add
            </Button>
            <Button variant="ghost" size="sm" onClick={app.fillSamplePaste}>
              Isi contoh · Sample
            </Button>
            <Button variant="ghost" size="sm" onClick={app.openSchema}>
              Lihat skema
            </Button>
          </div>
        </div>
      ) : null}

      {tab === "file" ? (
        <div style={{ paddingTop: 16, display: "flex", flexDirection: "column", gap: 12 }}>
          <div style={hint}>
            Unggah file .json (ekspor dari Camera Angle Guide Pro atau hasil AI). · Upload a .json file.
          </div>
          <label
            style={{
              border: "var(--border-width) dashed var(--border)",
              borderRadius: "var(--radius-md)",
              padding: "34px 20px",
              textAlign: "center",
              cursor: "pointer",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              gap: 8,
            }}
          >
            <div
              style={{
                width: 44,
                height: 44,
                borderRadius: "var(--radius-md)",
                border: "var(--border-width) solid var(--border)",
                display: "grid",
                placeItems: "center",
                font: "700 18px var(--font-mono)",
                color: "var(--primary)",
              }}
            >
              ≡
            </div>
            <div style={{ font: "700 13px var(--font-sans)", color: "var(--foreground)" }}>
              Pilih file .json · Choose a .json file
            </div>
            <div style={{ font: "400 11px var(--font-mono)", color: "var(--muted-foreground)" }}>
              JSON · camera-angle-guide/v2
            </div>
            <input type="file" accept=".json,application/json" onChange={app.onFileTab} style={{ display: "none" }} />
          </label>
          {app.fileName ? (
            <div style={{ font: "500 12px var(--font-mono)", color: "var(--foreground)" }}>File: {app.fileName}</div>
          ) : null}
        </div>
      ) : null}

      {tab === "youtube" ? (
        <div style={{ paddingTop: 16, display: "flex", flexDirection: "column", gap: 10 }}>
          <div style={hint}>
            AI menonton video, screenshot tiap perpindahan scene, lalu hasilkan JSON per scene. · The AI watches the
            video, screenshots each scene cut, returns per-scene JSON.
          </div>
          <input
            type="text"
            value={app.ytUrl}
            onChange={(e) => app.setYtUrl(e.target.value)}
            placeholder="https://youtu.be/…"
            style={inputStyle}
          />
          <div>
            <Button variant="outline" size="sm" icon="{ }" onClick={app.copyYt}>
              Salin prompt + skema · Copy prompt
            </Button>
          </div>
          <div style={{ ...capLabel, marginTop: 2 }}>Tempel JSON balikan AI · Paste AI&apos;s JSON</div>
          <textarea
            value={app.ytJson}
            onChange={(e) => app.setYtJson(e.target.value)}
            placeholder={'{ "scenes": [ ... ] }'}
            style={{ ...textareaStyle, height: 130 }}
          />
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
            <Button variant="primary" size="sm" onClick={app.doParseYt}>
              Parse &amp; tambahkan
            </Button>
            <Button variant="ghost" size="sm" onClick={app.fillSampleYt}>
              Isi contoh
            </Button>
          </div>
        </div>
      ) : null}

      {tab === "photo" ? (
        <div style={{ paddingTop: 16, display: "flex", flexDirection: "column", gap: 10 }}>
          <div style={hint}>
            Kirim foto ke AI, minta JSON angle-nya, lalu tempel di bawah. · Send the photo to your AI, ask for its angle
            JSON, paste below.
          </div>
          <label
            style={{
              border: "var(--border-width) dashed var(--border)",
              borderRadius: "var(--radius-md)",
              padding: 18,
              textAlign: "center",
              cursor: "pointer",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              gap: 8,
            }}
          >
            {app.photoDataUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={app.photoDataUrl}
                alt="preview"
                style={{
                  maxHeight: 120,
                  maxWidth: "100%",
                  borderRadius: "var(--radius-sm)",
                  border: "var(--border-width) solid var(--border)",
                }}
              />
            ) : (
              <div
                style={{
                  width: 44,
                  height: 44,
                  borderRadius: "var(--radius-md)",
                  border: "var(--border-width) solid var(--border)",
                  display: "grid",
                  placeItems: "center",
                  font: "700 18px var(--font-mono)",
                  color: "var(--primary)",
                }}
              >
                ▢
              </div>
            )}
            <div style={{ font: "700 13px var(--font-sans)", color: "var(--foreground)" }}>
              Pilih foto / gambar referensi · Choose a reference image
            </div>
            <input type="file" accept="image/*" onChange={app.onPhotoTab} style={{ display: "none" }} />
          </label>
          <div>
            <Button variant="outline" size="sm" icon="{ }" onClick={app.copyPhoto}>
              Salin prompt + skema · Copy prompt
            </Button>
          </div>
          <div style={{ ...capLabel, marginTop: 2 }}>Tempel JSON balikan AI · Paste AI&apos;s JSON</div>
          <textarea
            value={app.photoJson}
            onChange={(e) => app.setPhotoJson(e.target.value)}
            placeholder={'{ "frames": [ ... ] }'}
            style={{ ...textareaStyle, height: 110 }}
          />
          <div>
            <Button variant="primary" size="sm" onClick={app.doParsePhoto}>
              Parse &amp; tambahkan
            </Button>
          </div>
        </div>
      ) : null}

      {app.ioMsg ? (
        <div
          style={{
            marginTop: 14,
            padding: "9px 12px",
            borderRadius: "var(--radius-md)",
            border: `var(--border-width) solid ${app.ioOk ? "var(--border)" : "var(--destructive)"}`,
            background: "var(--muted)",
            font: "600 11px var(--font-mono)",
            color: app.ioOk ? "var(--foreground)" : "var(--destructive)",
          }}
        >
          {app.ioMsg}
        </div>
      ) : null}
    </ModalDialog>
  );
}

function SchemaModal() {
  const app = useApp();
  return (
    <ModalDialog
      open={app.schemaOpen}
      onClose={app.closeSchema}
      title="Skema JSON · Schema"
      width="min(660px,94vw)"
      height="min(600px,90vh)"
    >
      <div style={{ ...hint, marginBottom: 12 }}>
        Berikan skema ini ke AI Anda bersama foto/video. Template lengkap — AI cukup mengisi field yang terlihat. · Hand
        this schema to your AI with the photo/video; the template is complete, the AI fills only what it sees.
      </div>
      <div
        style={{
          display: "inline-flex",
          gap: 4,
          padding: 3,
          background: "var(--muted)",
          borderRadius: "var(--radius-pill)",
          marginBottom: 12,
        }}
      >
        <Button variant={app.schemaMode === "full" ? "primary" : "ghost"} size="sm" onClick={() => app.setSchemaMode("full")}>
          Lengkap · Full
        </Button>
        <Button
          variant={app.schemaMode === "simplified" ? "primary" : "ghost"}
          size="sm"
          onClick={() => app.setSchemaMode("simplified")}
        >
          Ringkas · Simplified
        </Button>
      </div>
      <pre
        style={{
          margin: "0 0 14px",
          background: "var(--muted)",
          border: "var(--border-width) solid var(--border)",
          borderRadius: "var(--radius-md)",
          padding: 14,
          height: 300,
          overflow: "auto",
          font: "400 11px/1.55 var(--font-mono)",
          color: "var(--foreground)",
          whiteSpace: "pre",
        }}
      >
        {schemaJson(app.schemaMode)}
      </pre>
      <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
        <Button variant="primary" size="sm" onClick={app.downloadSchema}>
          Unduh .json · Download
        </Button>
        <Button variant="outline" size="sm" onClick={app.copySchemaPrompt}>
          Salin prompt + skema · Copy prompt
        </Button>
      </div>
    </ModalDialog>
  );
}

function ApplyModal() {
  const app = useApp();
  return (
    <ModalDialog
      open={app.applyOpen}
      onClose={app.closeApply}
      title="Terapkan ke proyek · Apply"
      width="min(520px,94vw)"
      height="min(440px,86vh)"
    >
      <div style={{ font: "400 13px/1.5 var(--font-sans)", color: "var(--muted-foreground)", marginBottom: 16 }}>
        <b style={{ color: "var(--foreground)" }}>{app.applyCount}</b> data prompt akan diterapkan ke proyek Camera Angle
        Guide Pro. · will be applied to your project.
      </div>
      <div style={{ display: "flex", gap: 8, marginBottom: 16 }}>
        <Button variant={app.applyMode === "merge" ? "primary" : "outline"} size="sm" onClick={() => app.setApplyMode("merge")}>
          Gabung ke scene · Merge
        </Button>
        <Button variant={app.applyMode === "new" ? "primary" : "outline"} size="sm" onClick={() => app.setApplyMode("new")}>
          Buat scene baru · New
        </Button>
      </div>
      {app.applyMode === "merge" ? (
        <>
          <div style={{ ...capLabel, marginBottom: 6 }}>Scene tujuan · Target scene</div>
          <select
            value={app.applySceneId}
            onChange={(e) => app.setApplyScene(e.target.value)}
            style={{ ...inputStyle, marginBottom: 4 }}
          >
            {app.scenesForApply.map((s) => (
              <option key={s.id} value={s.id}>
                {s.name}
              </option>
            ))}
          </select>
        </>
      ) : (
        <div style={hint}>
          Setiap scene pada data prompt akan ditambahkan sebagai scene baru. · Each data-prompt scene is appended as a new
          scene.
        </div>
      )}
      <div style={{ display: "flex", gap: 8, marginTop: 22 }}>
        <Button variant="primary" size="sm" onClick={app.confirmApply}>
          Terapkan · Apply
        </Button>
        <Button variant="ghost" size="sm" onClick={app.closeApply}>
          Batal · Cancel
        </Button>
      </div>
    </ModalDialog>
  );
}

function EditModal() {
  const app = useApp();
  return (
    <ModalDialog
      open={app.editOpen}
      onClose={app.closeEdit}
      title="Edit data prompt"
      width="min(480px,94vw)"
      height="min(360px,82vh)"
    >
      <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
        <div>
          <div style={{ ...capLabel, marginBottom: 6 }}>Nama · Name</div>
          <input type="text" value={app.editName} onChange={(e) => app.setEditName(e.target.value)} style={inputStyle} />
        </div>
        <div>
          <div style={{ ...capLabel, marginBottom: 6 }}>Label EN</div>
          <input type="text" value={app.editEn} onChange={(e) => app.setEditEn(e.target.value)} style={inputStyle} />
        </div>
        <div style={{ display: "flex", gap: 8, marginTop: 6 }}>
          <Button variant="primary" size="sm" onClick={app.saveEdit}>
            Simpan · Save
          </Button>
          <Button variant="ghost" size="sm" onClick={app.closeEdit}>
            Batal
          </Button>
        </div>
      </div>
    </ModalDialog>
  );
}

function panelLabel(text: string, accent = false): React.CSSProperties {
  return {
    position: "absolute",
    top: 6,
    left: 8,
    zIndex: 2,
    font: "700 8px var(--font-mono)",
    letterSpacing: ".07em",
    textTransform: "uppercase",
    color: accent ? "var(--primary)" : "var(--muted-foreground)",
    background: "var(--card)",
    border: `var(--border-width) solid ${accent ? "var(--primary)" : "var(--border)"}`,
    borderRadius: "var(--radius-sm)",
    padding: "2px 6px",
  };
}

function View3dModal() {
  const app = useApp();
  const c = app.cur3d;
  const frames = app.activeEntry ? app.activeEntry.framesRaw : [];
  const cell: React.CSSProperties = {
    position: "relative",
    border: "var(--border-width) solid var(--border)",
    borderRadius: "var(--radius-md)",
    overflow: "hidden",
    background: "var(--muted)",
  };
  const vp: React.CSSProperties = { display: "block", width: "100%", height: "100%" };
  return (
    <ModalDialog
      open={app.view3dOpen}
      onClose={app.closeView3d}
      title="Pratinjau 3D · 3D preview"
      width="min(940px,95vw)"
      height="min(660px,90vh)"
    >
      {app.hasCur3d ? (
        <>
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap", alignItems: "center", marginBottom: 12 }}>
            <span
              style={{
                font: "600 10px var(--font-mono)",
                letterSpacing: ".05em",
                textTransform: "uppercase",
                color: "var(--subtle-foreground)",
              }}
            >
              Frame
            </span>
            {frames.map((fr, i) => {
              const on = i === app.view3dFrame;
              return (
                <button
                  key={i}
                  onClick={() => app.setView3dFrame(i)}
                  style={{
                    border: `var(--border-width) solid ${on ? "var(--primary)" : "var(--border)"}`,
                    background: on ? "var(--primary-soft)" : "transparent",
                    color: on ? "var(--primary)" : "var(--foreground)",
                    borderRadius: "var(--radius-pill)",
                    padding: "5px 12px",
                    font: "600 11px var(--font-sans)",
                    cursor: "pointer",
                  }}
                >
                  {fr.label}
                </button>
              );
            })}
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gridTemplateRows: "210px 210px", gap: 10 }}>
            <div style={cell}>
              <span style={panelLabel("Perspektif")}>Perspektif</span>
              <CagViewport camview="orbit" az={c.az} el={c.el} dist={c.dist} lens={c.lens} roll={c.roll} subj={c.subj} style={vp} />
            </div>
            <div style={cell}>
              <span style={panelLabel("Atas · Top")}>Atas · Top</span>
              <CagViewport camview="top" az={c.az} el={c.el} dist={c.dist} lens={c.lens} roll={c.roll} subj={c.subj} style={vp} />
            </div>
            <div style={cell}>
              <span style={panelLabel("Samping · Side")}>Samping · Side</span>
              <CagViewport camview="side" az={c.az} el={c.el} dist={c.dist} lens={c.lens} roll={c.roll} subj={c.subj} style={vp} />
            </div>
            <div style={cell}>
              <span style={panelLabel("POV kamera", true)}>POV kamera</span>
              <CagViewport camview="pov" az={c.az} el={c.el} dist={c.dist} lens={c.lens} roll={c.roll} subj={c.subj} style={vp} />
            </div>
          </div>
          <div style={{ marginTop: 12, font: "600 11px var(--font-mono)", color: "var(--muted-foreground)" }}>
            {c.angle} · {c.shot} · {c.lens}mm · {c.movement}
          </div>
        </>
      ) : null}
    </ModalDialog>
  );
}

function Toast() {
  const app = useApp();
  if (!app.toast) return null;
  return (
    <div
      style={{
        position: "fixed",
        bottom: 20,
        left: "50%",
        transform: "translateX(-50%)",
        background: "var(--foreground)",
        color: "var(--card)",
        padding: "10px 18px",
        borderRadius: "var(--radius-pill)",
        font: "600 12px var(--font-sans)",
        zIndex: 60,
        boxShadow: "var(--elevation-modal)",
        animation: "ds-ovin var(--motion) var(--ease)",
      }}
    >
      {app.toast}
    </div>
  );
}

export function GlobalModals() {
  return (
    <>
      <ImportModal />
      <SchemaModal />
      <ApplyModal />
      <EditModal />
      <View3dModal />
      <Toast />
    </>
  );
}
