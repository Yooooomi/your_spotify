import React from 'react';
import s from './index.module.css';
import API from '../../../../services/API';
import { Box, Paper } from '@material-ui/core';
import Chart from '../../../Chart';


class TimePer extends React.Component {
    constructor(props) {
        super(props);

        const start = new Date();
        start.setHours(0, 0, 0);
        start.setDate(start.getDate() - 1);
        const end = new Date();
        const timeSplit = 'hour';

        this.state = {
            start,
            end,
            stats: null,
            timeSplit,
        };
    }

    refresh = async () => {
        const { start, end, timeSplit } = this.state;
        const { data } = await API.timePer(start, end, timeSplit);

        console.log(data);

        this.setState({
            stats: data,
        });
    }

    setInfos = (field, value, shouldRefresh = true) => {
        console.log(value);
        let f = this.state[field];

        f = value;

        this.setState({ [field]: f }, () => {
            if (!shouldRefresh) return;
            this.refresh();
        });
    }

    componentDidMount() {
        this.refresh();
    }

    render() {
        const { stats, start, end, timeSplit } = this.state;
        if (!stats) return null;

        const data = stats.map((stat, k) => ({ x: k, y: stat.count / 1000 / 60 }));

        console.log(data);
        const series = {
            showPoints: false
        }
        const axes = [
            { primary: true, type: 'linear', position: 'bottom' },
            { type: 'linear', position: 'left' }
        ];
        return (
            <Paper className={s.paper}>
                <Chart
                    start={start}
                    end={end}
                    timeSplit={timeSplit}
                    onTimeSplitChange={e => this.setInfos('timeSplit', e.target.value)}
                    onStartChange={e => this.setInfos('start', e)}
                    onEndChange={e => this.setInfos('end', e)}
                    className={s.chart}
                    data={data} />
            </Paper>
        )
    }
}

export default TimePer;
