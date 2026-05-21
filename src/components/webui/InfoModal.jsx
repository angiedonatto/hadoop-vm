import { useState } from "react";

export function InfoModal({ title, children, onClose }) {
  return (
    <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.45)", zIndex: 9999, display: "flex", alignItems: "center", justifyContent: "center" }} onClick={onClose}>
      <div style={{ background: "#fff", borderRadius: 6, padding: "24px 28px", maxWidth: 540, width: "90%", boxShadow: "0 8px 32px rgba(0,0,0,0.18)", fontFamily: "Verdana, Geneva, sans-serif", fontSize: 13, color: "#333", maxHeight: "80vh", overflow: "auto" }} onClick={e => e.stopPropagation()}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14, borderBottom: "2px solid #0b7285", paddingBottom: 8 }}>
          <span style={{ fontWeight: 700, fontSize: 15, color: "#0b7285" }}>{title}</span>
          <button onClick={onClose} style={{ background: "none", border: "none", fontSize: 20, cursor: "pointer", color: "#888", lineHeight: 1 }}>×</button>
        </div>
        <div style={{ lineHeight: 1.75, fontSize: 12.5 }}>{children}</div>
      </div>
    </div>
  );
}

export function InfoBtn({ title, children }) {
  const [open, setOpen] = useState(false);
  return (
    <>
      <button onClick={() => setOpen(true)} title="¿Qué es esto?" style={{ background: "#e8f4f8", border: "1px solid #0b7285", borderRadius: "50%", width: 17, height: 17, fontSize: 10, cursor: "pointer", color: "#0b7285", fontWeight: 700, lineHeight: "15px", padding: 0, marginLeft: 6, flexShrink: 0 }}>?</button>
      {open && <InfoModal title={title} onClose={() => setOpen(false)}>{children}</InfoModal>}
    </>
  );
}
