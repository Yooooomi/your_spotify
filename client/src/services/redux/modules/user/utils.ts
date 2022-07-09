import {
  getPresetIndexFromIntervalDetail,
  getUserBasedIndexFromIntervalDetail,
  IntervalDetail,
  presetIntervals,
  userBasedIntervals,
} from '../../../intervals';
import { ReduxIntervalDetail } from './types';

export function intervalDetailToRedux(
  intervalDetail: IntervalDetail,
): ReduxIntervalDetail {
  switch (intervalDetail.type) {
    case 'preset': {
      return {
        type: 'preset',
        index: getPresetIndexFromIntervalDetail(intervalDetail),
      };
    }
    case 'userbased': {
      return {
        type: 'userbased',
        index: getUserBasedIndexFromIntervalDetail(intervalDetail),
      };
    }
    case 'custom': {
      return {
        type: 'custom',
        interval: intervalDetail.interval,
      };
    }
    default: {
      return {
        type: 'custom',
        interval: presetIntervals[0].interval,
      };
    }
  }
}

export function fromReduxIntervalDetail(
  intervalDetail: ReduxIntervalDetail,
): IntervalDetail {
  switch (intervalDetail.type) {
    case 'preset': {
      return presetIntervals[intervalDetail.index];
    }
    case 'userbased': {
      return userBasedIntervals[intervalDetail.index];
    }
    case 'custom': {
      return {
        type: 'custom',
        name: 'custom',
        interval: intervalDetail.interval,
      };
    }
    default: {
      return presetIntervals[0];
    }
  }
}
