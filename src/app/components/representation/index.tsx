import {
  IonItem,
  IonLabel,
  IonList,
  IonListHeader,
  IonCard,
  IonCardContent,
  IonCardHeader,
  useIonModal,
  IonText,
  IonNote,
  IonContent,
  IonPage,
  IonButton,
  IonToolbar,
  IonHeader,
  IonButtons,
  IonCardSubtitle,
  IonIcon,
  useIonActionSheet,
} from '@ionic/react';
import timeago from 'epoch-timeago';
import { Representation } from '../../utils/appTypes';
import KeyViewer from '../keyViewer';
import { useClipboard } from '../../useCases/useClipboard';
import { ellipsisVertical } from 'ionicons/icons';
import {
  representationID,
  getRepReference,
  shortenB64,
} from '../../utils/compat';
import { useContext, useEffect } from 'react';
import { AppContext } from '../../utils/appContext';
import { OverlayEventDetail } from '@ionic/core/components';

export const RepresentationItem: React.FC<Representation> = (
  representation,
) => {
  const { requestRepresentation, getRepresentationByID } =
    useContext(AppContext);

  const referenceID = getRepReference(representation);
  const referenced = getRepresentationByID(referenceID);

  useEffect(() => {
    if (referenceID && !referenced) {
      requestRepresentation(referenceID);
    }
  }, [referenceID, referenced, requestRepresentation]);

  const [present, dismiss] = useIonModal(RepresentationDetail, {
    onDismiss: () => dismiss(),
    representation,
    referenced,
  });

  const { time, memo } = representation;

  const timeMS = time * 1000;

  return (
    <IonItem lines="none" onClick={() => present()}>
      <IonLabel className="ion-text-wrap">
        <IonText color="tertiary">
          <sub>
            <time dateTime={new Date(timeMS).toISOString()}>
              <p>{timeago(timeMS)}</p>
            </time>
          </sub>
        </IonText>
        {memo && <p>{memo}</p>}
        {referenced && (
          <IonCard>
            <IonCardContent>{referenced.memo}</IonCardContent>
          </IonCard>
        )}
      </IonLabel>
    </IonItem>
  );
};

export default RepresentationItem;

interface RepresentationListProps {
  heading?: string;
  representations: Representation[];
}

export const RepresentationList = ({
  representations,
  heading,
}: RepresentationListProps) => {
  return (
    <IonList>
      {heading && (
        <IonListHeader>
          <IonLabel>{heading}</IonLabel>
        </IonListHeader>
      )}
      {!representations.length && (
        <IonItem>
          <IonLabel>No Activity</IonLabel>
        </IonItem>
      )}
      {representations.map((tx, index) => (
        <RepresentationItem
          key={index}
          by={tx.by}
          for={tx.for}
          memo={tx.memo}
          time={tx.time}
          nonce={tx.nonce}
          series={tx.series}
        />
      ))}
    </IonList>
  );
};

export const RepresentationDetail = ({
  onDismiss,
  representation,
  referenced,
}: {
  onDismiss: () => void;
  representation: Representation;
  referenced: Representation;
}) => {
  const { copyToClipboard } = useClipboard();

  const [presentActionSheet] = useIonActionSheet();

  const handleActionSheet = ({ data }: OverlayEventDetail) => {
    if (data?.['action'] === 'copy') {
      copyToClipboard(representationID(representation));
    }
  };

  return (
    <IonPage>
      <IonHeader>
        <IonToolbar>
          <IonButtons slot="start">
            <IonButton color="medium" onClick={() => onDismiss()}>
              Close
            </IonButton>
          </IonButtons>
        </IonToolbar>
      </IonHeader>
      <IonContent>
        <IonCard>
          <IonCardHeader>
            <IonCardSubtitle
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
              }}
            >
              <div>
                Represented by:{' '}
                <KeyViewer
                  value={
                    representation.by ??
                    '0000000000000000000000000000000000000000000='
                  }
                />
              </div>
              <IonButton
                className="ion-no-padding"
                fill="clear"
                onClick={() => {
                  presentActionSheet({
                    onDidDismiss: ({ detail }) => handleActionSheet(detail),
                    header: `${shortenB64(
                      representation.by ?? '0000000',
                    )} => ${shortenB64(representation.for)}`,
                    buttons: [
                      {
                        text: 'Copy Rep ID',
                        data: {
                          action: 'copy',
                        },
                      },
                    ],
                  });
                }}
              >
                <IonIcon
                  color="primary"
                  slot="icon-only"
                  icon={ellipsisVertical}
                ></IonIcon>
              </IonButton>
            </IonCardSubtitle>
            <IonLabel>
              <IonNote>
                {new Date(representation.time * 1000).toDateString()}
              </IonNote>
            </IonLabel>
          </IonCardHeader>
          <IonCardContent>
            <KeyViewer value={representation.for} />
            <p>{representation.memo}</p>
            {referenced && (
              <IonCard>
                <IonCardContent>
                  <KeyViewer value={referenced.for} />
                  <p>{referenced.memo}</p>
                </IonCardContent>
              </IonCard>
            )}
          </IonCardContent>
        </IonCard>
      </IonContent>
    </IonPage>
  );
};
