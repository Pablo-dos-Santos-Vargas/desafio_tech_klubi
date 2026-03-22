import { useMemo, useState, useDeferredValue } from "react";
import carsData from "../data/cars.json";
import type { Car, SearchFilters } from "./types";
import { searchCars, formatBRL } from "./lib/search";
import { CarGrid } from "./components/CarGrid";
import { ChatAssistant } from "./components/ChatAssistant";
import { SearchPanel } from "./components/SearchPanel";

const cars = carsData as Car[];

export default function App() {
  const [filters, setFilters] = useState<SearchFilters>({
    query: "",
    location: "",
    maxPrice: "",
  });
  const deferred = useDeferredValue(filters);

  const outcome = useMemo(() => searchCars(cars, deferred), [deferred]);

  return (
    <div className="app">
      <header className="site-header">
        <a className="site-header__brand" href="/" aria-label="Klubi — início">
          <img className="site-header__logo-img" src="https://assets.klubi.com.br/site/logos/logo-klubi.svg" alt="Klubi" />
        </a>

      </header>

      <header className="hero">
        <p className="hero__eyebrow">Um novo jeito de buscar seu carro</p>
        <h1 className="hero__title">
          Encontre o veículo ideal com <span className="hero__highlight">planejamento</span> e clareza.
        </h1>
        <p className="hero__lead">
          Busque por marca ou modelo, refine por cidade e orçamento. Quando não houver match exato,
          sugerimos alternativas próximas — para você decidir com confiança.
        </p>
      </header>

      <SearchPanel filters={filters} onChange={setFilters} />

      <section className="results" aria-live="polite">
        <OutcomeView outcome={outcome} />
      </section>

      <footer className="footer">
        <span>Site desenvolvido para desafio para entrar no Klubi </span>
      </footer>

      <ChatAssistant cars={cars} />
    </div>
  );
}

function OutcomeView({ outcome }: { outcome: ReturnType<typeof searchCars> }) {
  switch (outcome.kind) {
    case "exact":
      return <CarGrid cars={outcome.cars} />;
    case "price_below_budget":
      return (
        <>
          <ResultBanner type="warning" text={outcome.banner} />
          {outcome.matchedModel.length > 0 && (
            <div className="result-block">
              <h2 className="result-block__title">O modelo que você quer — valor de mercado</h2>
              <p className="result-block__meta">
                A partir de {formatBRL(outcome.minPriceForModel)} no estoque consultado.
              </p>
              <CarGrid cars={outcome.matchedModel} />
            </div>
          )}
          {outcome.cheaperAlternatives.length > 0 && (
            <div className="result-block">
              <h2 className="result-block__title">Dentro do seu teto de preço na região</h2>
              <CarGrid cars={outcome.cheaperAlternatives} />
            </div>
          )}
        </>
      );
    case "wrong_location":
      return (
        <>
          <ResultBanner type="info" text={outcome.banner} />
          {outcome.sameModelElsewhere.length > 0 && (
            <div className="result-block">
              <h2 className="result-block__title">Mesmo modelo em outras cidades</h2>
              <p className="result-block__meta">
                Entrega ou retirada podem ser combinadas com a loja parceira.
              </p>
              <CarGrid cars={outcome.sameModelElsewhere} />
            </div>
          )}
          {outcome.similarInLocation.length > 0 && (
            <div className="result-block">
              <h2 className="result-block__title">Sugestões na cidade que você escolheu</h2>
              <CarGrid cars={outcome.similarInLocation} />
            </div>
          )}
        </>
      );
    case "suggestions":
      return (
        <>
          <ResultBanner type="info" text={outcome.banner} />
          <CarGrid cars={outcome.cars} />
        </>
      );
    case "empty":
      return <ResultBanner type="neutral" text={outcome.banner} />;
    default:
      return null;
  }
}

function ResultBanner({
  type,
  text,
}: {
  type: "success" | "warning" | "info" | "neutral";
  text: string;
}) {
  return (
    <div className={`banner banner--${type}`} role="status">
      {text}
    </div>
  );
}
