import type { SearchFilters } from "../types";


type Props = {
  filters: SearchFilters;
  onChange: (f: SearchFilters) => void;
};

export function SearchPanel({ filters, onChange }: Props) {
  return (
    <div className="search-panel">
      <form
        className="search-form"
        onSubmit={(e) => e.preventDefault()}
        aria-label="Buscar veículos"
      >
        <div className="search-form__row">
          <label className="field">
            <span className="field__label">Marca ou modelo</span>
            <input
              type="search"
              name="query"
              autoComplete="off"
              placeholder="Ex.: BYD Dolphin, Corolla…"
              value={filters.query}
              onChange={(e) => onChange({ ...filters, query: e.target.value })}
            />
          </label>
          <label className="field">
            <span className="field__label">Cidade</span>
            <input
              type="text"
              name="location"
              placeholder="Ex.: São Paulo"
              value={filters.location}
              onChange={(e) => onChange({ ...filters, location: e.target.value })}
            />
          </label>
          <label className="field">
            <span className="field__label">Preço máximo (R$)</span>
            <input
              type="text"
              inputMode="numeric"
              name="maxPrice"
              placeholder="Ex.: 100000"
              value={filters.maxPrice}
              onChange={(e) => onChange({ ...filters, maxPrice: e.target.value })}
            />
          </label>
        </div>
      </form>

    </div>
  );
}
