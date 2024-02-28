import { Input, Button } from "@mui/material";
import { useState, useCallback } from "react";
import TitleCard from "../../../components/TitleCard";
import { changeUsername } from "../../../services/redux/modules/user/thunk";
import { User } from "../../../services/redux/modules/user/types";
import { useAppDispatch } from "../../../services/redux/tools";
import { GlobalPreferences } from "../../../services/types";
import SettingLine from "../SettingLine";
import s from "./index.module.css";

interface AccountInfosProps {
  user: User;
  settings: GlobalPreferences;
  isPublic: boolean;
}

export default function AccountInfos({
  user,
  settings,
  isPublic,
}: AccountInfosProps) {
  const dispatch = useAppDispatch();
  const [name, setName] = useState("");

  const submit = useCallback(
    (ev: React.SyntheticEvent) => {
      ev.preventDefault();
      dispatch(changeUsername(name));
    },
    [name, dispatch],
  );

  return (
    <TitleCard title="Account infos">
      <SettingLine left="Account ID" right={user._id} />
      <SettingLine left="Account name" right={user.username} />
      <SettingLine
        left="Allow new registrations"
        right={settings.allowRegistrations.toString()}
      />
      {!isPublic && (
        <form onSubmit={submit} className={s.root}>
          <Input
            placeholder="Rename account..."
            fullWidth
            value={name}
            onChange={ev => setName(ev.target.value)}
          />
          <Button type="submit" variant="contained">
            Change
          </Button>
        </form>
      )}
    </TitleCard>
  );
}
