import { IonChip, IonIcon, useIonModal } from '@ionic/react';
import { receiptOutline } from 'ionicons/icons';
import { useContext, useEffect } from 'react';
import { RepresentationList } from '../representation';
import { AppContext } from '../../utils/appContext';
import KeyChip, { KeyAbbrev } from '../keyChip';

interface KeyViewerProps {
  value: string;
  label?: string;
  readonly?: boolean;
}

const KeyViewer: React.FC<KeyViewerProps> = ({ value, label, readonly }) => {
  const [present, dismiss] = useIonModal(KeyDetails, {
    onDismiss: () => dismiss(),
    value,
  });

  return value ? (
    <IonChip
      onClick={
        readonly
          ? () => {}
          : (e) => {
              e.stopPropagation();
              present({
                initialBreakpoint: 0.75,
                breakpoints: [0, 0.75, 1],
              });
            }
      }
    >
      {!readonly && <IonIcon icon={receiptOutline} color="primary"></IonIcon>}
      {label ? <code>{label}</code> : <KeyAbbrev value={value} />}
    </IonChip>
  ) : null;
};

export default KeyViewer;

export const KeyDetails = ({
  onDismiss,
  value,
}: {
  onDismiss: () => void;
  value: string;
}) => {
  const { pkRepresentations, requestPkRepresentations } =
    useContext(AppContext);

  useEffect(() => {
    const timeoutId = window.setTimeout(() => {
      if (value) {
        requestPkRepresentations(value);
      }
    }, 0);
    return () => {
      window.clearTimeout(timeoutId);
    };
  }, [value, requestPkRepresentations]);

  const representations = pkRepresentations(value);

  return (
    <>
      <div
        style={{
          marginTop: '20px',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
        }}
      >
        <KeyChip value={value} />
        {!!representations && !!representations.length && (
          <div
            style={{
              alignSelf: 'stretch',
            }}
          >
            <RepresentationList representations={representations} />
          </div>
        )}
      </div>
    </>
  );
};
