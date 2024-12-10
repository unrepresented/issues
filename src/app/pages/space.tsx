import { PageShell } from '../components/pageShell';
import { useKeyHolder } from '../useCases/useKeyHolder';
import { useContext, useEffect, useState } from 'react';
import { AppContext } from '../utils/appContext';
import CatchmentMap from '../components/mapGraph';

const Space = () => {
  const { selectedKey } = useKeyHolder();

  const { colorScheme, tipHeader, graph, requestGraph } =
    useContext(AppContext);

  const tipHeight = tipHeader?.header.height ?? 0;

  const [peekGraphKey, setPeekGraphKey] = useState<string | null | undefined>();

  const whichKey =
    peekGraphKey ||
    selectedKey ||
    '0000000000000000000000000000000000000000000=';

  useEffect(() => {
    const timeoutId = window.setTimeout(() => {
      if (whichKey) {
        requestGraph(whichKey);
      }
    }, 0);
    return () => {
      window.clearTimeout(timeoutId);
    };
  }, [whichKey, requestGraph]);

  useEffect(() => {
    const resultHandler = (data: any) => {
      if (whichKey && data.detail) {
        requestGraph(whichKey);
      }
    };

    document.addEventListener('inv_plot', resultHandler);

    return () => {
      document.removeEventListener('inv_plot', resultHandler);
    };
  }, [whichKey, requestGraph]);

  const graphData = graph(whichKey);

  return (
    <PageShell
      renderBody={() => (
        <>
          {!!whichKey && (
            <>
              {!!graphData && (
                <CatchmentMap
                  tipHeight={tipHeight}
                  forKey={whichKey}
                  nodes={graphData.nodes ?? []}
                  links={graphData.links ?? []}
                  setForKey={setPeekGraphKey}
                  colorScheme={colorScheme}
                />
              )}
            </>
          )}
        </>
      )}
    />
  );
};

export default Space;
