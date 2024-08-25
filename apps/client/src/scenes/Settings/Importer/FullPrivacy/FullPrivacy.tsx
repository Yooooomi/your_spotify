import { useCallback, useMemo, useState } from "react";
import { Button, CircularProgress } from "@mui/material";
import { startImportFullPrivacy } from "../../../../services/redux/modules/import/thunk";
import Text from "../../../../components/Text";
import { useAppDispatch } from "../../../../services/redux/tools";
import s from "./index.module.css";

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
  }, [dispatch, files]);

  const wrongFiles = useMemo(() => {
    if (!files) {
      return false;
    }
    return Array.from(Array(files.length).keys()).some(
      i => !files.item(i)?.name.startsWith("Streaming_History_Audio"),
    );
  }, [files]);

  return (
    <div>
      <Text className={s.import}>
        Here you can import previous data from Spotify privacy data. This is the
        data you requested by mail specifically asking for extended data. It
        usually takes a few weeks for them to get back to you. Once received,
        upload here your files beginning with&nbsp;
        <code>Streaming_History_Audio</code>
        .
        <br />
        Read more&nbsp;
        <a
          target="_blank"
          href="https://www.spotify.com/account/privacy/"
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
          style={{ display: "none" }}
          onChange={ev => setFiles(ev.target.files)}
        />
        <Button component="span">
          Select your Streaming_History_Audio.json files
        </Button>
      </label>
      {files &&
        Array.from(Array(files.length).keys()).map(i => (
          <Text key={i} element="div">
            {files.item(i)?.name}
          </Text>
        ))}
      {wrongFiles && (
        <Text className={s.alert}>
          Some file do not being with <code>Streaming_History_Audio</code>,
          import might not work
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
