import { Select, MenuItem } from "@mui/material";
import { useCallback } from "react";
import { useSelector } from "react-redux";
import Text from "../../../components/Text";
import TitleCard from "../../../components/TitleCard";
import { changeDateFormat } from "../../../services/redux/modules/settings/thunk";
import { selectDateFormat } from "../../../services/redux/modules/user/selector";
import { useAppDispatch } from "../../../services/redux/tools";
import SettingLine from "../SettingLine";
import { dateFormats } from "./dateFormats";
import s from "./index.module.css";

export default function DateFormat() {
  const dispatch = useAppDispatch();
  const currentDateFormat = useSelector(selectDateFormat);

  const handleChangeDateFormat = useCallback(
    (newDateFormat: string | null | undefined) => {
      dispatch(changeDateFormat(newDateFormat ?? "default")).catch(
        console.error,
      );
    },
    [dispatch],
  );

  return (
    <TitleCard title="Date format">
      <Text element="span" className={s.marginbottom}>
        Format of dates throughout the application for this user.
      </Text>
      <SettingLine
        left="Date format"
        right={
          <Select
            variant="standard"
            value={currentDateFormat}
            onChange={ev => handleChangeDateFormat(ev.target.value)}>
            <MenuItem value="default">Follow browser</MenuItem>
            {dateFormats.map(dateFormat => (
              <MenuItem key={dateFormat.code} value={dateFormat.code}>
                {dateFormat.name}
              </MenuItem>
            ))}
          </Select>
        }
      />
    </TitleCard>
  );
}
