import { useSelector } from "react-redux";
import { CircularProgress } from "@mui/material";
import SettingLine from "../../SettingLine";
import { selectImportStates } from "../../../../services/redux/modules/import/selector";
import {
  cleanupImport,
  startImportPrivacy,
} from "../../../../services/redux/modules/import/thunk";
import ThreePoints from "../../../../components/ThreePoints";
import { compact } from "../../../../services/tools";
import { ImporterStateStatus } from "../../../../services/redux/modules/import/types";
import Text from "../../../../components/Text";
import { useAppDispatch } from "../../../../services/redux/tools";
import { DateFormatter } from "../../../../services/date";
import s from "./index.module.css";

const statusToString: Record<ImporterStateStatus, string> = {
  "failure-removed": "Failed and cleaned",
  failure: "Failed",
  progress: "In progress",
  success: "Success",
};

export default function ImportHistory() {
  const dispatch = useAppDispatch();
  const imports = useSelector(selectImportStates);

  const cleanImport = async (id: string) => {
      dispatch(cleanupImport(id)).catch(console.error);
    };

  const onImport = async (id: string) => {
      await dispatch(startImportPrivacy({ id }));
    };

  if (!imports) {
    return <CircularProgress />;
  }

  return (
    <div className={s.importhistory}>
      <Text element="h3" size='big'>Import history</Text>
      {imports.map(st => (
        <SettingLine
          key={st._id}
          left={
            <Text size="normal">
              Import of {DateFormatter.listenedAt(new Date(st.createdAt))}
              <Text className={s.importertype} size='normal'>from {st.type}</Text>
            </Text>
          }
          right={
            <div className={s.right}>
              <Text size="normal">
                {statusToString[st.status]} ({st.current}/{st.total})
              </Text>
              <ThreePoints
                items={compact([
                  st.status === "failure"
                    ? { label: "Retry", onClick: () => onImport(st._id) }
                    : undefined,
                  st.status === "failure"
                    ? {
                      label: "Clean up",
                      onClick: () => cleanImport(st._id),
                      style: "destructive",
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
