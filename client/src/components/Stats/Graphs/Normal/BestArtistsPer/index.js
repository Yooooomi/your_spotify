import React from 'react';
import API from '../../../../../services/API';
import IntervalChart, { FillModes } from '../../IntervalChart';
import PercentChart from '../../../../Chart/PercentChart';

const toPercent = (decimal, fixed = 0) => `${(decimal * 100).toFixed(fixed)}%`;

class BestArtistsPer extends IntervalChart {
  constructor(props) {
    super(props, '10 best artists repartition over time', FillModes.ASK);
    this.state.allArtists = [];
    this.state.artists = {};
  }

  fetchStats = async () => {
    const { start, end, timeSplit } = this.state;
    const { data } = await API.bestArtistsPer(start, end, timeSplit);

    const allArtists = data.reduce((acc, curr) => {
      curr.artists.forEach(art => {
        acc[art.id] = art;
      });
      return acc;
    }, {});

    this.setState({ allArtists });

    return data || null;
  }

  dataGetter = (stats) => {
    if (stats === null) {
      const { allArtists } = this.state;
      return { counts: new Array(Array(allArtists.length).keys()).map(() => 0), artists: Object.keys(allArtists) };
    }
    return stats;
  }

  getChartData = () => {
    const { stats } = this.state;

    const allArtists = Object.keys(this.state.allArtists);
    const data = stats.map((stat) => {
      const obj = { date: stat._id };
      const total = stat.data.counts.reduce((acc, curr) => acc + curr, 0);
      allArtists.forEach(art => {
        const artIdxForThisStat = stat.data.artists.findIndex(a => a.id === art);
        let count = 0;
        if (artIdxForThisStat >= 0) {
          count = stat.data.counts[artIdxForThisStat];
        }
        if (total === 0) {
          obj[art] = count;
        } else {
          obj[art] = (-count / total);
        }
      });
      return obj;
    });
    return data;
  }

  getXFormat = value => {
    const { stats } = this.state;
    const art = stats.artists[value];

    return { name: art.name, url: art?.images[art.images.length - 1]?.url, link: `/artist/${art?.id}` };
  }

  tooltipFormatter = (value, index) => {
    const { allArtists } = this.state;

    return [toPercent(-value), allArtists[index].name];
  }

  getYFormat = value => {
    let v = Math.floor((1 + value) * 100);
    if (v < 0) v = 0;
    return `${v}%`;
  }

  getContent = () => {
    const {
      stats, start, end, timeSplit,
    } = this.state;

    if (stats === null) return null;

    const data = this.getChartData();
    const allArtists = Object.keys(this.state.allArtists);

    return (
      <PercentChart
        xName="Date"
        yName="Different arists"
        yFormat={this.getYFormat}
        yDomain={[-1, 0]}
        start={start}
        end={end}
        timeSplit={timeSplit}
        onTimeSplitChange={e => this.setInfos('timeSplit', e)}
        onStartChange={e => this.setInfos('start', e)}
        onEndChange={e => this.setInfos('end', e)}
        data={data}
        keys={allArtists}
        tFormat={this.tooltipFormatter}
        tSorter={value => value.value}
      />
    );
  }
}

/* <AreaChart
  width={500}
  height={400}
  data={data.data}
  margin={{
    top: 10,
    right: 30,
    left: 0,
    bottom: 0,
  }}
>
  <CartesianGrid strokeDasharray="3 3" />
  <XAxis dataKey="name" tickFormatter={() => 'haha'} />
  <YAxis tickFormatter={toPercent} />
  <Tooltip labelFormatter={() => 'hihi'} />
  {areas}
</AreaChart> */

export default BestArtistsPer;
