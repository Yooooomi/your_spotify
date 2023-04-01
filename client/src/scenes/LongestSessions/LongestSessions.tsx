import { useSelector } from 'react-redux';
import Header from '../../components/Header';
import { api } from '../../services/apis/api';
import { useAPI } from '../../services/hooks/hooks';
import { selectRawIntervalDetail } from '../../services/redux/modules/user/selector';
import LongestSession from './LongestSession/LongestSession';
import s from './index.module.css';
import Text from '../../components/Text';
import TitleCard from '../../components/TitleCard';

export default function LongestSessions() {
  const { interval } = useSelector(selectRawIntervalDetail);
  const result = useAPI(api.getLongestSessions, interval.start, interval.end);

  if (!result) {
    return null;
  }

  const validResults = result.filter(
    res => res.distanceToLast.distance.length >= 1,
  );

  if (validResults.length === 0) {
    return <Text>No longest session</Text>;
  }

  return (
    <div>
      <Header
        title="Longest sessions"
        subtitle="You can find here the 3 longest listening sessions you have been through"
      />
      <div className={s.content}>
        <TitleCard title="3 longest sessions">
          {validResults.map(r => (
            <LongestSession
              key={r.distanceToLast.distance.map(e => e.info._id).join(',')}
              tracks={r.distanceToLast.distance.map(e => e.info)}
            />
          ))}
        </TitleCard>
      </div>
    </div>
  );
}
