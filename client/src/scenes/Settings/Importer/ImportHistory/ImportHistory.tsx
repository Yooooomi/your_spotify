import React, { useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { CircularProgress } from '@mui/material';
import { dateToListenedAt } from '../../../../services/stats';
import SettingLine from '../../SettingLine';
import { selectImportStates } from '../../../../services/redux/modules/import/selector';
import s from './index.module.css';
import { cleanupImport, startImportPrivacy } from '../../../../services/redux/modules/import/thunk';
import ThreePoints from '../../../../components/ThreePoints';
import { compact } from '../../../../services/tools';
import { ImporterStateStatus } from '../../../../services/redux/modules/import/types';

const statusToString: Record<ImporterStateStatus, string> = {
  'failure-removed': 'Failed and cleaned',
  failure: 'Failed',
  progress: 'In progress',
  success: 'Success',
};

export default function ImportHistory() {
  const dispatch = useDispatch();
  const imports = useSelector(selectImportStates);

  const cleanImport = useCallback(
    async (id: string) => {
      dispatch(cleanupImport(id));
    },
    [dispatch],
  );

  const onImport = useCallback(
    async (id: string) => {
      await dispatch(startImportPrivacy({ id }));
    },
    [dispatch],
  );

  if (!imports) {
    return <CircularProgress />;
  }

  return (
    <div className={s.importhistory}>
      <h3>Import history</h3>
      {imports.map((st) => (
        <SettingLine
          key={st._id}
          left={
            <span>
              Import of {dateToListenedAt(new Date(st.createdAt))}
              <span className={s.importertype}>from {st.type}</span>
            </span>
          }
          right={
            <div className={s.right}>
              <span>
                {statusToString[st.status]} ({st.current}/{st.total})
              </span>
              <ThreePoints
                items={compact([
                  st.status === 'failure'
                    ? { label: 'Retry', onClick: () => onImport(st._id) }
                    : undefined,
                  st.status === 'failure'
                    ? {
                        label: 'Clean up',
                        onClick: () => cleanImport(st._id),
                        style: 'destructive',
                      }
                    : undefined,
                ])}
              />
            </div>
          }
        />
      ))}
    </div>
  );
}
