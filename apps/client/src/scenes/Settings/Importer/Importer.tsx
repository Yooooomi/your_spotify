import { useCallback, useEffect, useMemo, useState } from "react";
import {
  CircularProgress,
  FormControl,
  InputLabel,
  LinearProgress,
  MenuItem,
  Select,
} from "@mui/material";
import { useSelector } from "react-redux";
import { getImports } from "../../../services/redux/modules/import/thunk";
import { selectImportStates } from "../../../services/redux/modules/import/selector";
import { ImporterStateTypes } from "../../../services/redux/modules/import/types";
import Text from "../../../components/Text";
import { useAppDispatch } from "../../../services/redux/tools";
import TitleCard from "../../../components/TitleCard";
import ImportHistory from "./ImportHistory";
import s from "./index.module.css";
import Privacy from "./Privacy";
import FullPrivacy from "./FullPrivacy";

const ImportTypeToComponent: Record<ImporterStateTypes, any> = {
  privacy: { label: "Account data", component: Privacy },
  "full-privacy": {
    label: "Extended streaming history",
    component: FullPrivacy,
  },
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
    () => imports?.find(st => st.status === "progress"),
    [imports],
  );
  const Component = useMemo(
    () => (importType ? ImportTypeToComponent[importType].component : null),
    [importType],
  );

  if (!imports) {
    return <CircularProgress />;
  }

  return (
    <TitleCard title="Import data">
      <div>
        {running && (
          <div>
            <Text className={s.progress}>
              Importing {running.current} of {running.total}
            </Text>
            <LinearProgress
              style={{ width: "100%" }}
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
                  {ImportTypeToComponent[typ].label}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
          {Component && <Component />}
        </div>
      )}
      {imports.length > 0 && <ImportHistory />}
    </TitleCard>
  );
}
