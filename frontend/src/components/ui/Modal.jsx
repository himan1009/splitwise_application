import { useEffect } from "react";
import { createPortal } from "react-dom";

export default function Modal({ open, onClose, title, children, size = "md" }) {
  useEffect(() => {
    if (!open) return undefined;

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    document.body.classList.add("modal-open");

    const onKeyDown = (event) => {
      if (event.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKeyDown);

    return () => {
      document.body.style.overflow = previousOverflow;
      document.body.classList.remove("modal-open");
      window.removeEventListener("keydown", onKeyDown);
    };
  }, [open, onClose]);

  useEffect(() => {
    if (!open || !window.visualViewport) return undefined;

    const viewport = window.visualViewport;

    const syncModalHeight = () => {
      const maxHeight = `${Math.round(viewport.height * 0.92)}px`;
      document.querySelectorAll(".app-modal").forEach((modal) => {
        modal.style.maxHeight = maxHeight;
      });
    };

    syncModalHeight();
    viewport.addEventListener("resize", syncModalHeight);
    viewport.addEventListener("scroll", syncModalHeight);

    return () => {
      viewport.removeEventListener("resize", syncModalHeight);
      viewport.removeEventListener("scroll", syncModalHeight);
      document.querySelectorAll(".app-modal").forEach((modal) => {
        modal.style.maxHeight = "";
      });
    };
  }, [open]);

  if (!open) return null;

  const sizes = {
    sm: "max-w-md",
    md: "max-w-lg",
    lg: "max-w-2xl",
  };

  return createPortal(
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
    </div>,
    document.body
  );
}
