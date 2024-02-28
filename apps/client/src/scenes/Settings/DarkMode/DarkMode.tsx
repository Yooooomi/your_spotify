import TitleCard from "../../../components/TitleCard";
import SettingLine from "../SettingLine";
import DarkModeSwitch from "./DarkModeSwitch";

export default function DarkMode() {
  return (
    <TitleCard title="Dark mode">
      <SettingLine left="Dark mode type" right={<DarkModeSwitch />} />
    </TitleCard>
  );
}
