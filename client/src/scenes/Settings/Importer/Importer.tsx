import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { Button, CircularProgress, LinearProgress } from '@mui/material';
import { useDispatch } from 'react-redux';
import { api, GetImport } from '../../../services/api';
import SettingLine from '../SettingLine';
import s from './index.module.css';
import { alertMessage } from '../../../services/redux/modules/message/reducer';

export default function Importer() {
  const dispatch = useDispatch();
  const [status, setStatus] = useState<GetImport | null>(null);
  const [files, setFiles] = useState<FileList | null>(null);
  const [loading, setLoading] = useState(false);

  const fetch = useCallback(async () => {
    try {
      const result = await api.getImport();
      setStatus(result.data);
    } catch (e) {
      console.error(e);
    }
  }, []);

  const onImport = useCallback(async () => {
    setLoading(true);
    try {
      if (!files) {
        return;
      }
      const filesArray = Array.from(Array(files.length).keys())
        .map((i) => files.item(i))
        .filter((f) => f);
      await api.doImport(filesArray as File[]);
      dispatch(
        alertMessage({
          level: 'success',
          message: 'Successfully started importing',
        }),
      );
      fetch();
    } catch (e: any) {
      if (e?.response?.data?.code === 'ALREADY_IMPORTING') {
        dispatch(
          alertMessage({
            level: 'error',
            message: 'An import is already running on this account',
          }),
        );
      } else if (e?.response?.data?.code === 'IMPORT_INIT_FAILED') {
        dispatch(
          alertMessage({
            level: 'error',
            message: 'The initialization failed, maybe your files are wrongly formatted',
          }),
        );
      }
      console.error(e);
    }
    setLoading(false);
  }, [fetch, files, dispatch]);

  useEffect(() => {
    fetch();
    // initial fetch
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const wrongFiles = useMemo(() => {
    if (!files) {
      return false;
    }
    return Array.from(Array(files.length).keys()).some(
      (i) => !files.item(i)?.name.startsWith('StreamingHistory'),
    );
  }, [files]);

  if (!status) {
    return <CircularProgress />;
  }

  return (
    <div>
      {!status.running && (
        <span className={s.import}>
          Here you can import previous data from Spotify privacy data. You can request them{' '}
          <a target="_blank" href="https://www.spotify.com/us/account/privacy/" rel="noreferrer">
            here
          </a>
          . It usually takes a week for them to get back to you. Once received, upload here your
          files beginning with <code>StreamingHistory</code>.
        </span>
      )}
      <SettingLine left="Importing" right={status.running.toString()} />
      {!status.running && (
        <label htmlFor="contained-button-file">
          <input
            accept=".json"
            id="contained-button-file"
            multiple
            type="file"
            style={{ display: 'none' }}
            onChange={(ev) => setFiles(ev.target.files)}
          />
          <Button component="span">Select your StreamingHistoryX.json files</Button>
        </label>
      )}
      {files && Array.from(Array(files.length).keys()).map((i) => <div>{files.item(i)?.name}</div>)}
      {wrongFiles && (
        <span className={s.alert}>
          Some file do not being with <code>StreamingHistory</code>, import might not work
        </span>
      )}
      {files && !wrongFiles && (
        <span className={s.noalert}>Everything looks fine for the import to work</span>
      )}
      {files && (
        <div className={s.importButton}>
          {!status.running && !loading && (
            <Button variant="contained" onClick={onImport}>
              Import
            </Button>
          )}
          {loading && <CircularProgress size={16} />}
        </div>
      )}
      {status.running && !status.progress && <span>Initializing import...</span>}
      {status.running && status.progress && (
        <div>
          <div className={s.progress}>
            <span>
              {status.progress[0]} / {status.progress[1]}
            </span>
          </div>
          <LinearProgress
            style={{ width: '100%' }}
            variant="determinate"
            value={(status.progress[0] / status.progress[1]) * 100}
          />
        </div>
      )}
    </div>
  );
}
