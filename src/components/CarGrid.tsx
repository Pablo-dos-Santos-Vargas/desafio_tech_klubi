import { useState } from "react";
import type { Car } from "../types";
import { formatBRL } from "../lib/search";
import { CarDetailModal } from "./CarDetailModal";

export function CarGrid({ cars }: { cars: Car[] }) {
  const [detailCar, setDetailCar] = useState<Car | null>(null);

  if (cars.length === 0) return null;
  return (
    <>
      <ul className="car-grid">
        {cars.map((car) => (
          <li key={`${car.Name}-${car.Model}-${car.Location}-${car.Price}`}>
            <article className="car-card">
              <div className="car-card__media">
                <img
                  src={car.Image}
                  alt={`${car.Name} ${car.Model}`}
                  width={600}
                  height={380}
                  loading="lazy"
                  decoding="async"
                />
              </div>
              <div className="car-card__body">
                <p className="car-card__brand">{car.Name}</p>
                <h3 className="car-card__model">{car.Model}</h3>
                <p className="car-card__price">{formatBRL(car.Price)}</p>
                <p className="car-card__loc">{car.Location}</p>
                <button
                  type="button"
                  className="car-card__cta"
                  onClick={() => setDetailCar(car)}
                >
                  Ver detalhes
                </button>
              </div>
            </article>
          </li>
        ))}
      </ul>
      {detailCar ? (
        <CarDetailModal car={detailCar} onClose={() => setDetailCar(null)} />
      ) : null}
    </>
  );
}
