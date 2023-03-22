import React from 'react';
import AppConstants from 'themes/appConstants';
import AppImages from 'themes/appImages';
import { useSetEventRemove } from '../../../hooks';
import styles from '../../actionLog.module.scss';

export default function EventRemoveView({ matchEvent }) {
  //hooks
  const removeEvent = useSetEventRemove();

  //jsx
  if (['pause', 'resume'].includes(matchEvent.type)) {
    return null;
  }

  return (
    <div onClick={() => removeEvent(matchEvent.id)}>
      <img className={styles.remove} src={AppImages.removeIcon} />
    </div>
  );
}
