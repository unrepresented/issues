import { createContext } from 'react';
import {
  Plot,
  PlotIdHeaderPair,
  Graph,
  Representation,
  Profile,
} from '../utils/appTypes';

interface AppState {
  publicKeys: string[];
  setPublicKeys: (keys: string[]) => void;
  selectedKeyIndex: number;
  selectedKey: string;
  setSelectedKey: (key: string) => void;
  requestTipHeader: () => void;
  tipHeader?: PlotIdHeaderPair;
  setTipHeader: (tipHeader: PlotIdHeaderPair) => void;
  requestPlotByHeight: (height: number) => void;
  requestPlotById: (plot_id: string) => void;
  currentPlot?: Plot | null;
  setCurrentPlot: (currentPlot: Plot) => void;
  genesisPlot?: Plot | null;
  setGenesisPlot: (genesisPlot: Plot) => void;
  requestProfile: (publicKeyB64: string) => void;
  profile: (publicKeyB64: string) => Profile | null | undefined;
  requestGraph: (publicKeyB64: string) => void;
  graph: (pubKey: string) => Graph | null | undefined;
  setGraph: (ranking: Graph) => void;
  requestRepresentation: (representation_id: string) => void;
  getRepresentationByID: (
    representation_id: string,
  ) => Representation | null | undefined;
  setRepresentationByID: (
    representation_id: string,
    representation: Representation,
  ) => void;
  requestPkRepresentations: (publicKeyB64: string) => void;
  pkRepresentations: (pubKey: string) => Representation[];
  setPkRepresentations: (
    publicKey: string,
    representations?: Representation[] | undefined,
  ) => void;
  pushRepresentation: (
    to: string,
    memo: string,
    passphrase: string,
    selectedKeyIndex: number,
  ) => Promise<void>;

  requestPendingRepresentations: (publicKeyB64: string) => void;
  pendingRepresentations: Representation[];
  setPendingRepresentations: (txns: Representation[]) => void;
  selectedNode: string;
  setSelectedNode: (node: string) => void;
  colorScheme: 'light' | 'dark';
}

export const AppContext = createContext<AppState>({
  publicKeys: [],
  setPublicKeys: () => {},
  selectedKeyIndex: 0,
  selectedKey: '',
  setSelectedKey: () => {},
  tipHeader: undefined,
  requestTipHeader: () => {},
  setTipHeader: () => {},
  requestPlotById: (plot_id: string) => {},
  requestPlotByHeight: (height: number) => {},
  currentPlot: undefined,
  setCurrentPlot: (currentPlot: Plot) => {},
  genesisPlot: undefined,
  setGenesisPlot: (genesisPlot: Plot) => {},
  requestProfile: (publicKeyB64: string) => {},
  profile: () => null,
  requestGraph: (publicKeyB64: string) => {},
  graph: () => null,
  setGraph: () => {},
  requestRepresentation: (representation_id: string) => {},
  getRepresentationByID: (representation_id: string) => null,
  setRepresentationByID: (
    representation_id: string,
    representation: Representation,
  ) => {},
  pkRepresentations: () => [],
  requestPkRepresentations: (publicKeyB64: string) => {},
  setPkRepresentations: () => {},
  requestPendingRepresentations: () => {},
  pendingRepresentations: [],
  setPendingRepresentations: () => {},
  selectedNode: '',
  setSelectedNode: () => {},
  colorScheme: 'light',
  pushRepresentation: (
    to: string,
    memo: string,
    passphrase: string,
    selectedKeyIndex: number,
  ) => Promise.resolve(),
});
