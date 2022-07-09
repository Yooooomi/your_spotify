import React, { useCallback } from 'react';
import { useSelector } from 'react-redux';
import { CircularProgress } from '@mui/material';
import { dateToListenedAt } from '../../../../services/stats';
import SettingLine from '../../SettingLine';
import { selectImportStates } from '../../../../services/redux/modules/import/selector';
import s from './index.module.css';
import {
  cleanupImport,
  startImportPrivacy,
} from '../../../../services/redux/modules/import/thunk';
import ThreePoints from '../../../../components/ThreePoints';
import { compact } from '../../../../services/tools';
import { ImporterStateStatus } from '../../../../services/redux/modules/import/types';
import Text from '../../../../components/Text';
import { useAppDispatch } from '../../../../services/redux/tools';

const statusToString: Record<ImporterStateStatus, string> = {
  'failure-removed': 'Failed and cleaned',
  failure: 'Failed',
  progress: 'In progress',
  success: 'Success',
};

export default function ImportHistory() {
  const dispatch = useAppDispatch();
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
      <Text element="h3">Import history</Text>
      {imports.map(st => (
        <SettingLine
          key={st._id}
          left={
            <Text>
              Import of {dateToListenedAt(new Date(st.createdAt))}
              <Text className={s.importertype}>
                from
                {st.type}
              </Text>
            </Text>
          }
          right={
            <div className={s.right}>
              <Text>
                {statusToString[st.status]} ({st.current}/{st.total})
              </Text>
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
