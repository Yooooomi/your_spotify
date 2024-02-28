import { dateToListenedAt } from "../../../services/stats";
import Text from "../../../components/Text";
import TitleCard from "../../../components/TitleCard";
import s from "./index.module.css";

interface FirstAndLastProps {
  firstDate: Date;
  lastDate: Date;
}

export default function FirstAndLast({
  firstDate,
  lastDate,
}: FirstAndLastProps) {
  return (
    <TitleCard title="First and last time listened">
      {firstDate.getTime() !== lastDate.getTime() && (
        <div className={s.item}>
          <div className={s.stat}>
            <Text>
              <Text element="strong">Last listened</Text> on{" "}
              {dateToListenedAt(lastDate)}
            </Text>
          </div>
        </div>
      )}
      <div className={s.item}>
        <div className={s.stat}>
          <Text>
            <Text element="strong">First listened</Text> on{" "}
            {dateToListenedAt(firstDate)}
          </Text>
        </div>
      </div>
    </TitleCard>
  );
}
