export type Car = {
  Name: string;
  Model: string;
  Image: string;
  Price: number;
  Location: string;
};

export type SearchFilters = {
  query: string;
  location: string;
  maxPrice: string;
};

export type SearchOutcome =
  | {
      kind: "exact";
      cars: Car[];
      banner?: string;
    }
  | {
      kind: "price_below_budget";
      matchedModel: Car[];
      cheaperAlternatives: Car[];
      minPriceForModel: number;
      banner: string;
    }
  | {
      kind: "wrong_location";
      sameModelElsewhere: Car[];
      similarInLocation: Car[];
      banner: string;
    }
  | {
      kind: "suggestions";
      cars: Car[];
      banner: string;
    }
  | {
      kind: "empty";
      banner: string;
    };
