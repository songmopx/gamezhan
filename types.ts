
export enum SelectionMode {
  NUMERIC = 'NUMERIC',
  OPTIONS = 'OPTIONS',
  DIVINATION = 'DIVINATION'
}

export interface HistoryItem {
  id: string;
  timestamp: number;
  mode: SelectionMode;
  result: string | number;
  millisecondSeed: number;
  insight?: string;
  thought?: string; // What the user was thinking
  guaName?: string; // Zhou Yi Gua Name
  binaryCode?: string; // 6-bit string
  activeLine?: number; // 1-6
}

export interface RandomConfig {
  min: number;
  max: number;
  options: string[];
}
