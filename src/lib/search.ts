import type { Car, SearchFilters, SearchOutcome } from "../types";

function normalize(s: string): string {
  return s
    .toLowerCase()
    .normalize("NFD")
    .replace(/\p{M}/gu, "")
    .trim();
}

function matchesQuery(car: Car, q: string): boolean {
  if (!q) return true;
  const n = normalize(q);
  const brand = normalize(car.Name);
  const model = normalize(car.Model);
  const full = `${brand} ${model}`;
  return (
    full.includes(n) ||
    brand.includes(n) ||
    model.includes(n) ||
    n.split(/\s+/).every((w) => w.length > 0 && (brand.includes(w) || model.includes(w) || full.includes(w)))
  );
}

function matchesLocation(car: Car, loc: string): boolean {
  if (!loc) return true;
  return normalize(car.Location).includes(normalize(loc));
}

function parseMaxPrice(raw: string): number | undefined {
  const digits = raw.replace(/\D/g, "");
  if (!digits) return undefined;
  const n = Number(digits);
  return Number.isFinite(n) ? n : undefined;
}

function carsMatchingModel(cars: Car[], query: string): Car[] {
  if (!query.trim()) return [];
  return cars.filter((c) => matchesQuery(c, query));
}

function relevanceScore(car: Car, query: string, loc: string, maxP?: number): number {
  const q = normalize(query);
  const l = normalize(loc);
  const full = `${normalize(car.Name)} ${normalize(car.Model)}`;
  const last = q.split(/\s+/).pop() ?? "";
  const qPts =
    !q ? 0 : (full === q || full.startsWith(q) ? 10 : 0) + (normalize(car.Model) === last ? 5 : 0);
  const locPts = l && normalize(car.Location).includes(l) ? 3 : 0;
  const pricePts = maxP === undefined ? 0 : -Math.abs(car.Price - maxP) / 100000;
  return qPts + locPts + pricePts;
}

function sortByRelevance(cars: Car[], query: string, loc: string, maxP?: number): Car[] {
  return [...cars].sort(
    (a, b) => relevanceScore(b, query, loc, maxP) - relevanceScore(a, query, loc, maxP)
  );
}

export function searchCars(allCars: Car[], filters: SearchFilters): SearchOutcome {
  const query = filters.query.trim();
  const location = filters.location.trim();
  const maxPrice = parseMaxPrice(filters.maxPrice);

  const baseFiltered = allCars.filter(
    (c) => matchesQuery(c, query) && matchesLocation(c, location)
  );

  const withinBudget = (c: Car) =>
    maxPrice === undefined ? true : c.Price <= maxPrice;

  const exact = baseFiltered.filter(withinBudget);

  if (exact.length > 0) {
    return {
      kind: "exact",
      cars: sortByRelevance(exact, query, location, maxPrice),
    };
  }

  const modelMatches = carsMatchingModel(allCars, query);

  if (modelMatches.length > 0 && location && maxPrice !== undefined) {
    const inCity = modelMatches.filter((c) => matchesLocation(c, location));
    const tooExpensive = inCity.filter((c) => c.Price > maxPrice);
    if (inCity.length > 0 && tooExpensive.length === inCity.length) {
      const minP = Math.min(...inCity.map((c) => c.Price));
      const cheaper = allCars
        .filter((c) => c.Price <= maxPrice && matchesLocation(c, location))
        .filter((c) => !modelMatches.some((m) => m.Name === c.Name && m.Model === c.Model))
        .slice(0, 6);
      return {
        kind: "price_below_budget",
        matchedModel: sortByRelevance(inCity, query, location),
        cheaperAlternatives: sortByRelevance(cheaper, "", location, maxPrice),
        minPriceForModel: minP,
        banner:
          "Não há esse modelo dentro do seu teto de preço na cidade — mostramos o veículo no valor real e opções na faixa que você definiu.",
      };
    }
  }

  // Model exists but not in selected city
  if (modelMatches.length > 0 && location) {
    const inCity = modelMatches.filter((c) => matchesLocation(c, location));
    if (inCity.length === 0) {
      const elsewhere = sortByRelevance(
        maxPrice !== undefined ? modelMatches.filter((c) => c.Price <= maxPrice) : modelMatches,
        query,
        ""
      );
      const similarInLoc = allCars
        .filter((c) => matchesLocation(c, location))
        .filter((c) => (maxPrice === undefined ? true : c.Price <= maxPrice))
        .filter((c) => !modelMatches.some((m) => m.Name === c.Name && m.Model === c.Model))
        .slice(0, 6);
      const banner =
        elsewhere.length === 0 && maxPrice !== undefined
          ? "Esse modelo não está na cidade selecionada e não há unidades dentro do teto em outras localidades — confira opções na sua região."
          : "Esse modelo não está disponível na cidade filtrada — veja onde encontramos e sugestões parecidas na sua região.";
      return {
        kind: "wrong_location",
        sameModelElsewhere: elsewhere,
        similarInLocation: sortByRelevance(similarInLoc, "", location, maxPrice),
        banner,
      };
    }
  }

  // Relaxed: any match on query without location/price
  const relaxed = allCars.filter((c) => matchesQuery(c, query));
  const relaxedBudget =
    maxPrice !== undefined ? relaxed.filter(withinBudget) : relaxed;

  if (relaxedBudget.length > 0) {
    return {
      kind: "suggestions",
      cars: sortByRelevance(relaxedBudget, query, location, maxPrice),
      banner:
        location || maxPrice !== undefined
          ? "Ajustamos filtros para mostrar o que mais se aproxima do que você busca."
          : "Resultados com base na sua busca.",
    };
  }

  if (relaxed.length > 0 && maxPrice !== undefined) {
    return {
      kind: "price_below_budget",
      matchedModel: [],
      cheaperAlternatives: sortByRelevance(
        allCars.filter((c) => c.Price <= maxPrice).slice(0, 8),
        "",
        location,
        maxPrice
      ),
      minPriceForModel: Math.min(...relaxed.map((c) => c.Price)),
      banner: "Nenhum resultado dentro do orçamento com esse termo — veja opções na sua faixa de preço.",
    };
  }

  return {
    kind: "empty",
    banner:
      "Não encontramos veículos com esses critérios. Tente outro modelo, cidade ou aumente o teto de preço.",
  };
}

export function formatBRL(value: number): string {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
    maximumFractionDigits: 0,
  }).format(value);
}
