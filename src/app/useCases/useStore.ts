import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { Graph, Representation, Profile } from '../utils/appTypes';
import { parseGraphDOT } from '../utils/compat';

interface SpaceTimeState {
  representationsByID: {
    [id: string]: Representation;
  };
  setRepresentationByID: (id: string, representation: Representation) => void;
  getRepresentationByID: (id: string) => Representation;
  representationsByPK: {
    [pubKey: string]: Representation[] | null | undefined;
  };
  setRepresentationsByPK: (
    publicKey: string,
    representations?: Representation[],
  ) => void;
  getRepresentationsByPK: (pubKey: string) => Representation[];
  profilesByPubKey: { [pubKey: string]: Profile | null | undefined };
  getProfile: (pubKey: string) => Profile | null | undefined;
  setProfile: (profile: Profile) => void;
  graphsByPK: { [pubKey: string]: Graph | null | undefined };
  getGraph: (pubKey: string) => Graph | null | undefined;
  setGraph: (graph: Graph) => void;
}

export const useSpaceTimeStore = create<SpaceTimeState>()(
  persist(
    (set, get) => ({
      representationsByID: {},
      setRepresentationByID: (id, representation) => {
        set((state) => ({
          representationsByID: {
            ...state.representationsByID,
            [id]: representation,
          },
        }));
      },
      getRepresentationByID: (id: string) => get().representationsByID[id],
      representationsByPK: {},
      setRepresentationsByPK: (publicKey, representations = []) => {
        set((state) => ({
          representationsByPK: {
            ...state.representationsByPK,
            [publicKey]: representations,
          },
        }));
      },
      getRepresentationsByPK: (pubKey: string) =>
        get().representationsByPK[pubKey] ?? [],
      profilesByPubKey: {},
      getProfile: (pubKey: string) => get().profilesByPubKey[pubKey],
      setProfile: (profile) =>
        set((state) => ({
          profilesByPubKey: {
            ...state.profilesByPubKey,
            [profile.public_key]: profile,
          },
        })),
      graphsByPK: {},
      getGraph: (pubKey: string) => get().graphsByPK[pubKey],
      setGraph: ({ graph, public_key, plot_id, height }) => {
        const { nodes, links } = parseGraphDOT(graph || '', public_key, 0);

        set((state) => ({
          graphsByPK: {
            ...state.graphsByPK,
            [public_key]: {
              public_key,
              nodes,
              links,
              plot_id,
              height,
            },
          },
        }));
      },
    }),
    {
      name: 'space-time-store',
      storage: createJSONStorage(() => localStorage),
    },
  ),
);

interface KeyState {
  selectedKeyIndex: number;
  selectedKey: string;
  setSelectedKey: (selectedKey: string) => void;
  publicKeys: string[];
  setPublicKeys: (keys: string[]) => void;
}

export const useKeyStore = create<KeyState>()(
  persist(
    (set, get) => ({
      selectedKeyIndex: 0,
      selectedKey: '',
      setSelectedKey: (selectedKey: string) => {
        const selectedKeyIndex = get().publicKeys.indexOf(selectedKey);
        set(() => ({
          selectedKey,
          selectedKeyIndex,
        }));
      },
      publicKeys: [],
      setPublicKeys: (publicKeys: string[]) => {
        set(() => ({
          selectedKeyIndex: 0,
          selectedKey: publicKeys[0],
          publicKeys,
        }));
      },
    }),
    {
      name: 'key-store',
      storage: createJSONStorage(() => localStorage),
    },
  ),
);
