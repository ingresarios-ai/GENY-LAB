export interface Category {
  id: string;
  icon: string;
  label: string;
  hint: string;
}

export interface Currency {
  id: string;
  name: string;
  symbol: string;
  flag: string;
  locale: string;
}

export interface Recommendation {
  title: string;
  instruments: string[];
  desc: string;
  highlight: string;
}

export interface Projection {
  label: string;
  years: number;
  val: number;
  invested: number;
}
