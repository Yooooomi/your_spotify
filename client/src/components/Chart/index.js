import 'date-fns';
import React from 'react'
import {
    FlexibleWidthXYPlot,
    XYPlot,
    XAxis,
    YAxis,
    LineSeries,
} from 'react-vis';
import {
    MuiPickersUtilsProvider,
    KeyboardDatePicker,
} from '@material-ui/pickers';
import DateFnsUtils from '@date-io/date-fns';
import s from './index.module.css';
import { Button, Switch, MenuItem, Select, Popper, IconButton, Paper } from '@material-ui/core';
import { ArrowDownwardOutlined } from '@material-ui/icons';

export default function Chart({
    data,
    className,
    start,
    end,
    timeSplit,
    onTimeSplitChange,
    onStartChange = () => { },
    onEndChange = () => { } },
) {
    const [anchorEl, setAnchorEl] = React.useState(null);

    return (
        <div className={s.root}>
            <FlexibleWidthXYPlot
                style={{
                    width: '100%',
                }}
                height={300}
            >
                <XAxis />
                <YAxis />
                <LineSeries
                    curve="curveMonotoneX"
                    data={data}
                />
            </FlexibleWidthXYPlot>
            <div className={s.buttons}>
                <IconButton onClick={(e) => setAnchorEl(anchorEl ? null : e.currentTarget)}>
                    <ArrowDownwardOutlined />
                </IconButton>
                <MuiPickersUtilsProvider utils={DateFnsUtils}>
                    <Popper
                        anchorEl={anchorEl}
                        open={Boolean(anchorEl)}
                    >
                        <Paper className={s.paper}>
                            <div className={s.entry}>
                                <KeyboardDatePicker
                                    margin="none"
                                    label="From"
                                    variant="inline"
                                    format="MM/dd/yyyy"
                                    value={start}
                                    onChange={onStartChange}
                                    fullWidth
                                />
                            </div>
                            <div className={s.entry}>
                                <KeyboardDatePicker
                                    margin="none"
                                    label="To"
                                    variant="inline"
                                    format="MM/dd/yyyy"
                                    value={end}
                                    onChange={onEndChange}
                                    fullWidth
                                />
                            </div>
                            <div className={s.entry}>
                                <Select
                                    fullWidth
                                    value={timeSplit}
                                    onChange={onTimeSplitChange}
                                    label="Time split"
                                >
                                    <MenuItem value="hour">Hour</MenuItem>
                                    <MenuItem value="day">day</MenuItem>
                                    <MenuItem value="week">week</MenuItem>
                                    <MenuItem value="month">month</MenuItem>
                                    <MenuItem value="year">year</MenuItem>
                                </Select>
                            </div>
                            <div className={s.entry}>
                                <Button fullWidth variant="contained">Modify</Button>
                            </div>
                        </Paper>
                    </Popper>
                </MuiPickersUtilsProvider>
            </div>
        </div>
    )
}
