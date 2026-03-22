import { useEffect } from "react";
import { createPortal } from "react-dom";
import type { Car } from "../types";
import { formatBRL } from "../lib/search";

export function CarDetailModal({ car, onClose }: { car: Car; onClose: () => void }) {
  useEffect(() => {
    const esc = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    document.addEventListener("keydown", esc);
    const { overflow } = document.body.style;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", esc);
      document.body.style.overflow = overflow;
    };
  }, [onClose]);

  const title = `${car.Name} ${car.Model}`;

  return createPortal(
    <div
      className="car-modal-overlay"
      role="dialog"
      aria-modal="true"
      aria-labelledby="car-modal-title"
      onClick={onClose}
    >
      <div className="car-modal-panel" onClick={(e) => e.stopPropagation()}>
        <button
          type="button"
          className="car-modal__close"
          onClick={onClose}
          aria-label="Fechar"
        >
          ×
        </button>
        <div className="car-modal__media">
          <img src={car.Image} alt={title} width={800} height={500} />
        </div>
        <div className="car-modal__body">
          <p className="car-modal__brand">{car.Name}</p>
          <h2 id="car-modal-title" className="car-modal__title">
            {car.Model}
          </h2>
          <p className="car-modal__price">{formatBRL(car.Price)}</p>
          <p className="car-modal__loc">
            <span className="car-modal__loc-label">Localização</span>
            {car.Location}
          </p>
          <div className="car-modal__actions">
            <a
              className="car-modal__cta-primary"
              href={"https://klubi.com.br/consorcio/auto"}
              target="_blank"
              rel="noopener noreferrer"
            >
              Fazer consórcio no Klubi
            </a>
            <button type="button" className="car-modal__cta-secondary" onClick={onClose}>
              Fechar
            </button>
          </div>
        </div>
      </div>
    </div>,
    document.body
  );
}
