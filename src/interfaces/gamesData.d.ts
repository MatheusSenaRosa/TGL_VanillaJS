export interface IGamesData {
  min_cart_value: number;
  types: Type[];
}

export interface Type {
  type: string;
  description: string;
  range: number;
  price: number;
  min_and_max_number: number;
  color: string;
}

export interface ICart {
  type: string;
  color: string;
  price: number;
  numbers: string[];
}
