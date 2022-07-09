import React, { useCallback, useMemo, useState } from 'react';
import { Button, CircularProgress } from '@mui/material';
import { startImportFullPrivacy } from '../../../../services/redux/modules/import/thunk';
import s from './index.module.css';
import Text from '../../../../components/Text';
import { useAppDispatch } from '../../../../services/redux/tools';

export default function FullPrivacy() {
  const dispatch = useAppDispatch();
  const [files, setFiles] = useState<FileList | null>(null);
  const [loading, setLoading] = useState(false);

  const onImport = useCallback(async () => {
    setLoading(true);
    if (!files) {
      return;
    }
    await dispatch(startImportFullPrivacy({ files }));
    setLoading(false);
  }, [files, dispatch]);

  const wrongFiles = useMemo(() => {
    if (!files) {
      return false;
    }
    return Array.from(Array(files.length).keys()).some(
      i => !files.item(i)?.name.startsWith('endsong'),
    );
  }, [files]);

  return (
    <div>
      <Text className={s.import}>
        Here you can import previous data from Spotify privacy data. This is the
        data you requested by mail specifically asking for extended data. It
        usually takes a few weeks for them to get back to you. Once received,
        upload here your files beginning with <code>endsong</code>
        .
        <br />
        Read more{' '}
        <a
          target="_blank"
          href="https://www.spotify.com/fr/account/privacy/"
          rel="noreferrer">
          here
        </a>
      </Text>
      <label htmlFor="contained-button-file">
        <input
          accept=".json"
          id="contained-button-file"
          multiple
          type="file"
          style={{ display: 'none' }}
          onChange={ev => setFiles(ev.target.files)}
        />
        <Button component="span">Select your endsongX.json files</Button>
      </label>
      {files &&
        Array.from(Array(files.length).keys()).map(i => (
          <div key={i}>{files.item(i)?.name}</div>
        ))}
      {wrongFiles && (
        <Text className={s.alert}>
          Some file do not being with <code>endsong</code>, import might not
          work
        </Text>
      )}
      {files && !wrongFiles && (
        <Text className={s.noalert}>
          Everything looks fine for the import to work
        </Text>
      )}
      {files && (
        <div className={s.importButton}>
          {!loading && (
            <Button variant="contained" onClick={() => onImport()}>
              Import
            </Button>
          )}
          {loading && <CircularProgress size={16} />}
        </div>
      )}
    </div>
  );
}
