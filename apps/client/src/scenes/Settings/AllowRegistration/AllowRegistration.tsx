import { Button } from "@mui/material";
import { useCallback } from "react";
import Text from "../../../components/Text";
import TitleCard from "../../../components/TitleCard";
import { changeRegistrations } from "../../../services/redux/modules/settings/thunk";
import { useAppDispatch } from "../../../services/redux/tools";
import { GlobalPreferences } from "../../../services/types";
import SettingLine from "../SettingLine";

interface AllowRegistrationProps {
  settings: GlobalPreferences;
}

export default function AllowRegistration({
  settings,
}: AllowRegistrationProps) {
  const dispatch = useAppDispatch();

  const allowRegistration = useCallback(() => {
    if (!settings) {
      return;
    }
    dispatch(changeRegistrations(!settings.allowRegistrations));
  }, [dispatch, settings]);

  return (
    <TitleCard title="Allow registrations">
      <SettingLine
        left={<Text>Allow new registrations</Text>}
        right={
          <Button onClick={allowRegistration}>
            {settings.allowRegistrations ? "YES" : "NO"}
          </Button>
        }
      />
    </TitleCard>
  );
}
