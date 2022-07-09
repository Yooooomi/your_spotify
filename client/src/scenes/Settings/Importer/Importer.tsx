import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
  CircularProgress,
  FormControl,
  InputLabel,
  LinearProgress,
  MenuItem,
  Select,
} from '@mui/material';
import { useSelector } from 'react-redux';
import { getImports } from '../../../services/redux/modules/import/thunk';
import { selectImportStates } from '../../../services/redux/modules/import/selector';
import ImportHistory from './ImportHistory';
import s from './index.module.css';
import Privacy from './Privacy';
import { ImporterStateTypes } from '../../../services/redux/modules/import/types';
import FullPrivacy from './FullPrivacy';
import Text from '../../../components/Text';
import { useAppDispatch } from '../../../services/redux/tools';

const ImportTypeToComponent: Record<ImporterStateTypes, any> = {
  privacy: Privacy,
  'full-privacy': FullPrivacy,
};

export default function Importer() {
  const dispatch = useAppDispatch();
  const imports = useSelector(selectImportStates);
  const [importType, setImportType] = useState<ImporterStateTypes>(
    ImporterStateTypes.privacy,
  );

  const fetch = useCallback(
    async (force = false) => {
      dispatch(getImports(force));
    },
    [dispatch],
  );

  useEffect(() => {
    fetch();
  }, [fetch]);

  const running = useMemo(
    () => imports?.find(st => st.status === 'progress'),
    [imports],
  );
  const Component = useMemo(
    () => (importType ? ImportTypeToComponent[importType] : null),
    [importType],
  );

  if (!imports) {
    return <CircularProgress />;
  }

  return (
    <div>
      <div>
        {running && (
          <div>
            <Text>Importing...</Text>
            <div className={s.progress}>
              <Text>
                {running.current} /{running.total}
              </Text>
            </div>
            <LinearProgress
              style={{ width: '100%' }}
              variant="determinate"
              value={(running.current / running.total) * 100}
            />
          </div>
        )}
      </div>
      {!running && (
        <div>
          <FormControl className={s.selectimport}>
            <InputLabel id="import-type-select">Import type</InputLabel>
            <Select
              labelId="import-type-select"
              value={importType}
              label="Import type"
              onChange={ev =>
                setImportType(ev.target.value as ImporterStateTypes)
              }>
              {Object.values(ImporterStateTypes).map(typ => (
                <MenuItem value={typ} key={typ}>
                  {typ}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
          {Component && <Component />}
        </div>
      )}
      {imports.length > 0 && <ImportHistory />}
    </div>
  );
}
