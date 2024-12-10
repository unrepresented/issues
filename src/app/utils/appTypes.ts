export interface Profile {
  public_key: string;
  ranking: number;
  imbalance: number;
  plus_code?: string;
  plot_id?: string;
  height?: number;
  error?: string;
}

export interface GraphNode {
  id: number;
  label: string;
  plusCode?: string;
  catchment?: string;
  group?: number;
  neighbors?: GraphNode[];
  links?: GraphLink[];
  pubkey: string;
  ranking: number;
}

export interface GraphLink {
  source: number;
  target: number;
  value: number;
}

export interface Graph {
  public_key: string;
  graph?: string;
  nodes?: GraphNode[];
  links?: GraphLink[];
  plot_id?: string;
  height?: number;
}

export interface PlotHeader {
  previous: string;
  hash_list_root: string;
  time: number;
  target: string;
  thread_work: string;
  nonce: number;
  height: number;
  representation_count: number;
}

export interface PlotIdHeaderPair {
  plot_id: string;
  header: PlotHeader;
}

export interface Plot {
  header: PlotHeader;
  representations: Representation[];
}

export interface Representation {
  time: number;
  nonce?: number;
  by?: string;
  for: string;
  memo: string;
  series?: number;
  signature?: string;
}
