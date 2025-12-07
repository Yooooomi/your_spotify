import { MenuItem, Select } from "@mui/material";
import TitleCard from "../../../components/TitleCard";
import { useAppDispatch } from "../../../services/redux/tools";
import { useSelector } from "react-redux";
import { selectSettings } from "../../../services/redux/modules/settings/selector";
import SettingLine from "../SettingLine";
import { api } from "../../../services/apis/api";
import { alertMessage } from "../../../services/redux/modules/message/reducer";

const DAYS = [
  { label: "Sunday", value: 0 },
  { label: "Monday", value: 1 },
  { label: "Tuesday", value: 2 },
  { label: "Wednesday", value: 3 },
  { label: "Thursday", value: 4 },
  { label: "Friday", value: 5 },
  { label: "Saturday", value: 6 },
];

export default function WeekStart() {
  const dispatch = useAppDispatch();
  const settings = useSelector(selectSettings);

  const onChange = async (value: number) => {
    try {
      const result = await api.setGlobalPreferences({ weekStartsOn: value });
      (window as any).WEEK_STARTS_ON = value;
      dispatch(
        alertMessage({
          level: "success",
          message: `Updated week start to ${DAYS.find(d => d.value === value)?.label}`,
        }),
      );
      return result;
    } catch (e) {
      dispatch(
        alertMessage({
          level: "error",
          message: `Could not update week start`,
        }),
      );
    }
    return null;
  };

  return (
    <TitleCard title="Week start">
      <SettingLine
        left="First day of week"
        right={
          <Select
            variant="standard"
            value={settings?.weekStartsOn ?? 0}
            onChange={ev => onChange(Number(ev.target.value))}>
            {DAYS.map(day => (
              <MenuItem key={day.value} value={day.value}>
                {day.label}
              </MenuItem>
            ))}
          </Select>
        }
      />
    </TitleCard>
  );
}

