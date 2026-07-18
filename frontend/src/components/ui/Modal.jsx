import { useEffect } from "react";

export default function Modal({ open, onClose, title, children, size = "md" }) {
  useEffect(() => {
    if (!open) return undefined;

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    const onKeyDown = (event) => {
      if (event.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKeyDown);

    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", onKeyDown);
    };
  }, [open, onClose]);

  if (!open) return null;

  const sizes = {
    sm: "max-w-md",
    md: "max-w-lg",
    lg: "max-w-2xl",
  };

  return (
    <div className="app-modal-backdrop" onClick={onClose} role="dialog" aria-modal="true">
      <div
        className={`app-modal ${sizes[size]}`}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="app-modal-header">
          <h2 className="app-modal-title">{title}</h2>
          <button
            onClick={onClose}
            className="app-modal-close touch-target"
            type="button"
            aria-label="Close"
          >
            ✕
          </button>
        </div>
        <div className="app-modal-body">{children}</div>
      </div>
    </div>
  );
}
