import { api } from '../../../api';
import { myAsyncThunk } from '../../tools';
import { alertMessage } from '../message/reducer';
import { selectImportStates } from './selector';
import { ImporterState } from './types';

export const getImports = myAsyncThunk<
  ImporterState[] | null,
  boolean | undefined
>('@import/get', async (force, tapi) => {
  if (!force && selectImportStates(tapi.getState())) {
    return null;
  }
  const { data: imports } = await api.getImports();
  return imports;
});

export const startImportPrivacy = myAsyncThunk<
  void,
  { files?: FileList; id?: string }
>('@import/privacy-start', async ({ files, id }, tapi) => {
  try {
    if (!id) {
      if (!files) {
        return;
      }
      const filesArray = Array.from(Array(files.length).keys())
        .map(i => files.item(i))
        .filter(f => f);
      await api.doImportPrivacy(filesArray as File[]);
    } else {
      await api.retryImport(id);
    }
    tapi.dispatch(getImports(true));
    tapi.dispatch(
      alertMessage({
        level: 'success',
        message: 'Successfully started importing',
      }),
    );
  } catch (e: any) {
    if (e?.response?.data?.code === 'ALREADY_IMPORTING') {
      tapi.dispatch(
        alertMessage({
          level: 'error',
          message: 'An import is already running on this account',
        }),
      );
    } else if (e?.response?.data?.code === 'IMPORT_INIT_FAILED') {
      tapi.dispatch(
        alertMessage({
          level: 'error',
          message:
            'The initialization failed, maybe your files are wrongly formatted',
        }),
      );
    }
    console.error(e);
  }
});

export const startImportFullPrivacy = myAsyncThunk<
  void,
  { files?: FileList; id?: string }
>('@import/full-privacy-start', async ({ files, id }, tapi) => {
  try {
    if (!id) {
      if (!files) {
        return;
      }
      const filesArray = Array.from(Array(files.length).keys())
        .map(i => files.item(i))
        .filter(f => f);
      await api.doImportFullPrivacy(filesArray as File[]);
    } else {
      await api.retryImport(id);
    }
    tapi.dispatch(getImports(true));
    tapi.dispatch(
      alertMessage({
        level: 'success',
        message: 'Successfully started importing',
      }),
    );
  } catch (e: any) {
    if (e?.response?.data?.code === 'ALREADY_IMPORTING') {
      tapi.dispatch(
        alertMessage({
          level: 'error',
          message: 'An import is already running on this account',
        }),
      );
    } else if (e?.response?.data?.code === 'IMPORT_INIT_FAILED') {
      tapi.dispatch(
        alertMessage({
          level: 'error',
          message:
            'The initialization failed, maybe your files are wrongly formatted',
        }),
      );
    }
    console.error(e);
  }
});

export const cleanupImport = myAsyncThunk<void, string>(
  '@import/cleanup',
  async (id, tapi) => {
    try {
      await api.cleanupImport(id);
      tapi.dispatch(
        alertMessage({
          level: 'success',
          message: 'Successfully cleaned up import',
        }),
      );
      tapi.dispatch(getImports(true));
    } catch (e) {
      tapi.dispatch(
        alertMessage({
          level: 'success',
          message: 'Could not clean up your import',
        }),
      );
    }
  },
);
