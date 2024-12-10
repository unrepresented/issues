import { Route } from 'react-router-dom';
import {
  IonApp,
  IonIcon,
  IonRouterOutlet,
  IonTabBar,
  IonTabButton,
  IonTabs,
  setupIonicReact,
} from '@ionic/react';
import { IonReactHashRouter } from '@ionic/react-router';
import {
  expandOutline,
  gridOutline,
  contractOutline,
  ellipseOutline,
  triangleOutline,
  squareOutline,
} from 'ionicons/icons';
import Cross from './pages/cross';
import Time from './pages/time';
import Space from './pages/space';

/* Core CSS required for Ionic components to work properly */
import '@ionic/react/css/core.css';

/* Basic CSS for apps built with Ionic */
import '@ionic/react/css/normalize.css';
import '@ionic/react/css/structure.css';
import '@ionic/react/css/typography.css';

/* Optional CSS utils that can be commented out */
import '@ionic/react/css/padding.css';
import '@ionic/react/css/float-elements.css';
import '@ionic/react/css/text-alignment.css';
import '@ionic/react/css/text-transformation.css';
import '@ionic/react/css/flex-utils.css';
import '@ionic/react/css/display.css';

/* Theme variables */
import './theme/variables.css';
import { useState, useEffect } from 'react';

import { useSpaceTimeStore, useKeyStore } from './useCases/useStore';

import { AppContext } from './utils/appContext';
import { Representation, Plot, PlotIdHeaderPair } from './utils/appTypes';
import { usePersistentState } from './useCases/usePersistentState';

import { useCallback } from 'react';
import useWebSocket, { ReadyState } from 'react-use-websocket';
import { signRepresentation } from './useCases/useKeyHolder';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const HackIonReactRouter = IonReactHashRouter as any;

setupIonicReact();

const App: React.FC = () => {
  const publicKeys = useKeyStore((state) => state.publicKeys);
  const setPublicKeys = useKeyStore((state) => state.setPublicKeys);
  const selectedKeyIndex = useKeyStore((state) => state.selectedKeyIndex);
  const selectedKey = useKeyStore((state) => state.selectedKey);
  const setSelectedKey = useKeyStore((state) => state.setSelectedKey);

  const [tipHeader, setTipHeader] = useState<PlotIdHeaderPair>();
  const [currentPlot, setCurrentPlot] = usePersistentState<Plot | null>(
    'current-plot',
    null,
  );

  const [genesisPlot, setGenesisPlot] = usePersistentState<Plot | null>(
    'genesis-plot',
    null,
  );

  const graph = useSpaceTimeStore((state) => state.getGraph);
  const setGraph = useSpaceTimeStore((state) => state.setGraph);

  const profile = useSpaceTimeStore((state) => state.getProfile);
  const setProfile = useSpaceTimeStore((state) => state.setProfile);

  const pkRepresentations = useSpaceTimeStore(
    (state) => state.getRepresentationsByPK,
  );
  const setPkRepresentations = useSpaceTimeStore(
    (state) => state.setRepresentationsByPK,
  );

  const setRepresentationByID = useSpaceTimeStore(
    (state) => state.setRepresentationByID,
  );

  const getRepresentationByID = useSpaceTimeStore(
    (state) => state.getRepresentationByID,
  );

  const [pendingRepresentations, setPendingRepresentations] = useState<
    Representation[]
  >([]);

  const [selectedNode, setSelectedNode] = usePersistentState(
    'selected-node',
    '',
  );

  const { sendJsonMessage, readyState } = useWebSocket(
    `wss://${selectedNode}`,
    {
      protocols: ['plotthread.1'],
      onOpen: () => console.log('opened', selectedNode),
      onError: () => console.log('errored', selectedNode),
      shouldReconnect: () => true,
      share: true,
      onMessage: (event) => {
        const { type, body } = JSON.parse(event.data);

        switch (type) {
          case 'inv_plot':
            document.dispatchEvent(
              new CustomEvent<{
                representation_id: string;
                error: string;
              }>('inv_plot', { detail: body.plot_ids }),
            );
            requestTipHeader();
            break;
          case 'tip_header':
            setTipHeader(body);
            break;
          case 'profile':
            setProfile(body);
            break;
          case 'graph':
            setGraph(body);
            break;
          case 'plot':
            if (body.plot.header.height === 0) {
              setGenesisPlot(body.plot);
            }
            setCurrentPlot(body.plot);
            break;
          case 'representation':
            const { representation_id, representation } = body;
            setRepresentationByID(representation_id, representation);
            break;
          case 'push_representation_result':
            document.dispatchEvent(
              new CustomEvent<{
                representation_id: string;
                error: string;
              }>('push_representation_result', { detail: body }),
            );
            break;
          case 'public_key_representations':
            setPkRepresentations(
              body.public_key,
              body.filter_plots?.flatMap((i: any) => i.representations) ?? [],
            );
            document.dispatchEvent(
              new CustomEvent<string>('public_key_representations', {
                detail: body.public_key,
              }),
            );
            break;
          case 'filter_representation_queue':
            setPendingRepresentations(body.representations);
            break;
        }
      },
    },
  );

  const requestPeers = useCallback(() => {
    if (readyState !== ReadyState.OPEN) return;
    sendJsonMessage({
      type: 'get_peer_addresses',
    });
  }, [readyState, sendJsonMessage]);

  const requestPlotById = useCallback(
    (plot_id: string) => {
      if (readyState !== ReadyState.OPEN) return;
      sendJsonMessage({
        type: 'get_plot',
        body: { plot_id },
      });
    },
    [readyState, sendJsonMessage],
  );

  const requestPlotByHeight = useCallback(
    (height: number) => {
      if (readyState !== ReadyState.OPEN) return;
      sendJsonMessage({
        type: 'get_plot_by_height',
        body: { height },
      });
    },
    [readyState, sendJsonMessage],
  );

  const requestTipHeader = useCallback(() => {
    if (readyState !== ReadyState.OPEN) return;
    sendJsonMessage({ type: 'get_tip_header' });
  }, [readyState, sendJsonMessage]);

  const requestProfile = useCallback(
    (publicKeyB64: string) => {
      if (readyState !== ReadyState.OPEN) return;
      if (!publicKeyB64) throw new Error('missing publicKey');

      sendJsonMessage({
        type: 'get_profile',
        body: {
          public_key: publicKeyB64,
        },
      });
    },
    [readyState, sendJsonMessage],
  );

  const requestGraph = useCallback(
    (publicKeyB64: string = '') => {
      if (readyState !== ReadyState.OPEN) return;

      sendJsonMessage({
        type: 'get_graph',
        body: {
          public_key: publicKeyB64,
        },
      });
    },
    [readyState, sendJsonMessage],
  );

  const pushRepresentation = async (
    to: string,
    memo: string,
    passphrase: string,
    selectedKeyIndex: number,
  ) => {
    if (readyState !== ReadyState.OPEN) return;
    if (to && memo && tipHeader?.header.height && publicKeys.length) {
      const representation = await signRepresentation(
        to,
        memo,
        tipHeader?.header.height,
        selectedKeyIndex,
        passphrase,
      );

      if (!representation) return;

      sendJsonMessage({
        type: 'push_representation',
        body: {
          representation,
        } as any,
      });
    }
  };

  const requestRepresentation = useCallback(
    (representation_id: string) => {
      if (readyState !== ReadyState.OPEN) return;
      sendJsonMessage({
        type: 'get_representation',
        body: { representation_id },
      });
    },
    [readyState, sendJsonMessage],
  );

  const requestPkRepresentations = useCallback(
    (publicKeyB64: string) => {
      if (readyState !== ReadyState.OPEN) return;
      if (!publicKeyB64) throw new Error('missing publicKey');

      //TODO: skip if exists in cache
      //allow user to explicitly refresh

      if (tipHeader?.header.height) {
        sendJsonMessage({
          type: 'get_public_key_representations',
          body: {
            public_key: publicKeyB64,
            start_height: tipHeader?.header.height + 1,
            end_height: 0,
            limit: 10,
          },
        });
      }
    },
    [readyState, sendJsonMessage, tipHeader],
  );

  const applyFilter = useCallback(
    (publicKeysB64: string[]) => {
      if (readyState !== ReadyState.OPEN) return;
      if (publicKeysB64.length) {
        sendJsonMessage({
          type: 'filter_add',
          body: {
            public_keys: publicKeysB64,
          },
        });
      }
    },
    [readyState, sendJsonMessage],
  );

  const requestPendingRepresentations = useCallback(
    (publicKeyB64: string) => {
      if (readyState !== ReadyState.OPEN) return;
      //applyFilter must be called first with a public key
      applyFilter([publicKeyB64]);
      sendJsonMessage({
        type: 'get_filter_representation_queue',
      });
    },
    [readyState, applyFilter, sendJsonMessage],
  );

  const prefersDark = window.matchMedia('(prefers-color-scheme: dark)');

  const [colorScheme, setColorScheme] = useState<'light' | 'dark'>(
    prefersDark.matches ? 'dark' : 'light',
  );

  useEffect(() => {
    const eventHandler = (mediaQuery: MediaQueryListEvent) =>
      setColorScheme(mediaQuery.matches ? 'dark' : 'light');

    prefersDark.addEventListener('change', eventHandler);

    return () => {
      prefersDark.removeEventListener('change', eventHandler);
    };
  }, [prefersDark, setColorScheme]);

  const appState = {
    publicKeys,
    setPublicKeys,
    selectedKeyIndex,
    selectedKey,
    setSelectedKey,
    requestTipHeader,
    tipHeader,
    setTipHeader,
    requestPlotById,
    requestPlotByHeight,
    currentPlot,
    setCurrentPlot,
    genesisPlot,
    setGenesisPlot,
    requestProfile,
    profile,
    setProfile,
    requestGraph,
    graph,
    setGraph,
    pushRepresentation,
    requestRepresentation,
    getRepresentationByID,
    setRepresentationByID,
    requestPkRepresentations,
    pkRepresentations,
    setPkRepresentations,
    requestPendingRepresentations,
    pendingRepresentations,
    setPendingRepresentations,
    selectedNode,
    setSelectedNode,
    colorScheme,
  };

  useEffect(() => {
    //First load
    if (!!selectedNode) {
      requestPeers();
      requestTipHeader();
    }
  }, [selectedNode, requestTipHeader, requestPeers]);

  return (
    <AppContext.Provider value={appState}>
      <IonApp>
        <HackIonReactRouter>
          <IonTabs>
            <IonRouterOutlet>
              <Route exact path="/">
                <Space />
                <ToggleTabBar hide={true} />
              </Route>
              <Route exact path="/time">
                <Time />
                <ToggleTabBar />
              </Route>
              <Route exact path="/space">
                <Space />
                <ToggleTabBar />
              </Route>
              <Route exact path="/cross">
                <Cross />
                <ToggleTabBar />
              </Route>
            </IonRouterOutlet>
            <IonTabBar id="app-tab-bar" slot="bottom">
              <IonTabButton tab="time" href="/time">
                <IonIcon
                  aria-hidden="true"
                  icon={
                    colorScheme === 'light' ? expandOutline : ellipseOutline
                  }
                />
              </IonTabButton>
              <IonTabButton tab="cross" href="/cross">
                <IonIcon
                  aria-hidden="true"
                  icon={
                    colorScheme === 'light' ? contractOutline : triangleOutline
                  }
                />
              </IonTabButton>
              <IonTabButton tab="space" href="/space">
                <IonIcon
                  aria-hidden="true"
                  icon={colorScheme === 'light' ? gridOutline : squareOutline}
                />
              </IonTabButton>
            </IonTabBar>
          </IonTabs>
        </HackIonReactRouter>
      </IonApp>
    </AppContext.Provider>
  );
};

const ToggleTabBar = ({ hide }: { hide?: boolean }) => {
  useEffect(() => {
    const tabBar = document.getElementById('app-tab-bar');
    if (tabBar !== null) {
      tabBar.style.display = hide ? 'none' : 'flex';
    }
  }, [hide]);
  return <></>;
};

export default App;
