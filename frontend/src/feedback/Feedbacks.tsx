import React, { useState, useEffect } from "react";
import axios from "axios";
import { styled } from '@mui/material/styles';
import Box from '@mui/material/Box';
import Grid from '@mui/material/Grid';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import { Collapse, FormControl, IconButton, InputLabel, MenuItem, Paper, Select, SelectChangeEvent, TablePagination } from "@mui/material";
import Typography from '@mui/material/Typography';
import Alert from '@mui/material/Alert';
import CircularProgress from '@mui/material/CircularProgress';
import { create } from 'zustand';
import ThumbUpAltIcon from '@mui/icons-material/ThumbUpAlt';
import { Gauge } from '@mui/x-charts/Gauge';
import Stack from '@mui/material/Stack';
import { Dayjs } from "dayjs";
import { DateTimePicker, DateTimeValidationError, LocalizationProvider, PickerChangeHandlerContext } from "@mui/x-date-pickers";
import { DemoContainer } from "@mui/x-date-pickers/internals/demo";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';
import KeyboardArrowUpIcon from '@mui/icons-material/KeyboardArrowUp';
import OpenInNewIcon from '@mui/icons-material/OpenInNew';
import { Item } from "../common/Item";


const useFeedbackStore = create((set) => ({
    feedbacks: [],
    rerender: 0,
    setFeedbacks: (d: any) => set((state: any) => ({ feedbacks: d })),
    triggerRerender: () => set((state: any) => ({ rerender: Math.random() })),
}));

export default function Feedback() {
    const [filterOptions, setFilterOptions] = React.useState([]);
    const [filterParams, setFilterParams] = React.useState(new Map<string, string>());
    const [error, setError] = React.useState(null);
    const [loading, setLoading] = React.useState(true);

    const handleChange = (event: SelectChangeEvent) => {
        if (!event.target.value) {
            filterParams.delete(event.target.name);
            setFilterParams(new Map(filterParams));
        } else {
            setFilterParams(new Map(filterParams.set(event.target.name, event.target.value)));
        }
    };

    useEffect(() => {
        const getFilterOptions = async () => {
            setError(null);
            setLoading(true);
            try {
                const response = await axios.get(
                    `${process.env.REACT_APP_BACKEND_BASE_URL}/feedback/options?names=groupName,publicationVersion`
                );
                setFilterOptions(response.data);
                setLoading(false);
                return;
            } catch (err: any) {
                setError(err.message || 'An error occurred');
                setLoading(false);
                return;
            }
        };
        getFilterOptions();
    }, [setFilterOptions, filterParams]);

    function handleFromTimeParam(value: Dayjs | null, context: PickerChangeHandlerContext<DateTimeValidationError>): void {
        setFilterParams(new Map(filterParams.set("from", value?.toISOString() || '')));
    }

    function handleToTimeParam(value: Dayjs | null, context: PickerChangeHandlerContext<DateTimeValidationError>): void {
        setFilterParams(new Map(filterParams.set("to", value?.toISOString() || '')));
    }
    return (
        <Box sx={{ flexGrow: 1, m: 3 }}>
            <Grid container spacing={3} rowSpacing={3} >
                <Grid item xs={12}>
                    <Stack direction="row" spacing={1}>
                        <ThumbUpAltIcon sx={{ width: 64, height: 64 }} />
                        <Stack spacing={1}>
                            <Typography variant="h5" component="h1">
                                Feedback
                                <IconButton target="_blank" rel="noopener noreferrer" href="http://localhost:8011/docs#/Prompt/post_group__groupName__publisher__publisherName__prompt__promptName_">
                                    <OpenInNewIcon />
                                </IconButton>
                            </Typography>
                            <Typography variant="body2" component="h3">
                                Feedback events list. Feedback stat avalible at publisher part.
                            </Typography>
                        </Stack>
                    </Stack>
                </Grid>
                <Grid item xs={12}>
                    <Item>
                        <Stack>
                        {loading ? (<CircularProgress />) : error ? <Alert severity="error">{error}</Alert> : (null)}
                            <Grid container spacing={3} rowSpacing={3} mb={3}>
                                <Grid item xs={12} md={3}>
                                    <LocalizationProvider dateAdapter={AdapterDayjs}>
                                        <DemoContainer components={['DateTimePicker']}>
                                            <DateTimePicker label="From Execution time" ampm={false} name="from" onChange={handleFromTimeParam} />
                                        </DemoContainer>
                                    </LocalizationProvider>
                                </Grid>
                                <Grid item xs={12} md={3}>
                                    <LocalizationProvider dateAdapter={AdapterDayjs}>
                                        <DemoContainer components={['DateTimePicker']}>
                                            <DateTimePicker label="To Execution time" ampm={false} name="to" onChange={handleToTimeParam} />
                                        </DemoContainer>
                                    </LocalizationProvider>
                                </Grid>
                            </Grid>
                            <Grid container spacing={3} rowSpacing={3} >
                                <Grid item xs={12} md={3}>
                                    <FormControl variant="standard" sx={{ m: 1, minWidth: "100%" }}>
                                        <InputLabel id="groupName">Group Name</InputLabel>
                                        <Select
                                            labelId="groupName"
                                            id="groupName"
                                            value={filterParams.get('groupName') || ""}
                                            onChange={handleChange}
                                            label="groupName"
                                            name="groupName"
                                        >
                                            <MenuItem value="">
                                                <em>None</em>
                                            </MenuItem>
                                            {filterOptions.filter((x: any) => x.filterName === 'groupName')
                                                .flatMap((x: any) => x.options)
                                                .map((x: any, i: any) => <MenuItem key={i} value={x}>{x}</MenuItem>
                                                )}
                                        </Select>
                                    </FormControl>
                                </Grid>
                                <Grid item xs={12} md={3}>
                                    <FormControl variant="standard" sx={{ m: 1, minWidth: "100%" }}>
                                        <InputLabel id="publicationVersion">Publication Version</InputLabel>
                                        <Select
                                            labelId="publicationVersion"
                                            id="publicationVersion"
                                            value={filterParams.get('publicationVersion') || ""}
                                            onChange={handleChange}
                                            label="publicationVersion"
                                            name="publicationVersion"
                                        >
                                            <MenuItem value="">
                                                <em>None</em>
                                            </MenuItem>
                                            {filterOptions.filter((x: any) => x.filterName === 'publicationVersion')
                                                .flatMap((x: any) => x.options)
                                                .map((x: any, i: any) => <MenuItem key={i} value={x}>{x}</MenuItem>
                                                )}
                                        </Select>
                                    </FormControl>
                                </Grid>
                            </Grid>
                        </Stack>
                    </Item>
                </Grid>
                <Grid item xs={12}>
                    <Item>
                        <Grid container spacing={3} rowSpacing={3} >
                            <Grid item xs={12}>Feedback</Grid>
                            <Grid item xs={12}>
                                <Paper elevation={3}>
                                    <FeedbackList filterParams={filterParams} />
                                </Paper>
                            </Grid>
                        </Grid>
                    </Item>
                </Grid>
            </Grid>
        </Box>
    );
}


function Row(props: { row: any }) {
    const { row } = props;
    const [open, setOpen] = React.useState(false);
    const [loading, setLoading] = React.useState(false);
    const [error, setError] = React.useState<string | null>(null);
    const [subFeedbacks, setSubFeedbacks] = React.useState([]);
    useEffect(() => {
        const loadPost = async () => {
            setError(null);
            setLoading(true);
            try {
                const response = await axios.get(
                    `${process.env.REACT_APP_BACKEND_BASE_URL}/feedback/group/${row.groupName}/publication/${row.publicationVersion}`
                );
                setSubFeedbacks(response.data);
                setLoading(false);
                return;
            } catch (err: any) {
                setError(err.message || 'An error occurred');
                setLoading(false);
                return;
            }
        };
        if (open) {
            loadPost();
        }
    }, [open]);

    return (
        <React.Fragment>
            {loading ? (<CircularProgress />) : error ? <Alert severity="error">{error}</Alert> : (null)}
            <TableRow>
                <TableCell>
                    <IconButton
                        aria-label="expand row"
                        size="small"
                        onClick={() => setOpen(!open)}
                    >
                        {open ? <KeyboardArrowUpIcon /> : <KeyboardArrowDownIcon />}
                    </IconButton>
                </TableCell>
                <TableCell component="th" scope="row">
                    {row.groupName}
                </TableCell>
                <TableCell align="right">{row.publicationVersion}</TableCell>
                <TableCell align="right">{row.lastCreatedAt}</TableCell>
                <TableCell align="right">{row.feedbackGroupCount}</TableCell>
                <TableCell align="right">
                    <Stack direction={{ xs: 'column', md: 'row' }} spacing={{ xs: 1, md: 3 }}>
                        <Gauge width={100} height={100} value={row.possitivePercGroup} />
                    </Stack>
                </TableCell>
                <TableCell align="right">{row.feedbackCount}</TableCell>
                <TableCell align="right">
                    <Stack direction={{ xs: 'column', md: 'row' }} spacing={{ xs: 1, md: 3 }}>
                        <Gauge width={100} height={100} value={row.possitivePercAll} />
                    </Stack>
                </TableCell>
            </TableRow>
            <TableRow>
                <TableCell style={{ paddingBottom: 0, paddingTop: 0 }} colSpan={12}>
                    <Collapse in={open} timeout="auto" unmountOnExit>
                        <Box sx={{ margin: 1 }}>
                            <Typography variant="h6" gutterBottom component="div">
                                Prompts Feedback details
                            </Typography>
                            <Table size="small" aria-label="promptrow">
                                <TableHead>
                                    <TableRow>
                                        <TableCell>Prompt Name</TableCell>
                                        <TableCell>First time</TableCell>
                                        <TableCell>Last time</TableCell>
                                        <TableCell>Count</TableCell>
                                        <TableCell align="right">Positive Feedback (%)</TableCell>
                                    </TableRow>
                                </TableHead>
                                <TableBody>
                                    {subFeedbacks.map((subRow: any) => (
                                        <TableRow>
                                            <TableCell>
                                                {subRow.promptName}
                                            </TableCell>
                                            <TableCell>
                                                {subRow.firstCreatedAt}
                                            </TableCell>
                                            <TableCell>
                                                {subRow.lastCreatedAt}
                                            </TableCell>
                                            <TableCell>
                                                {subRow.feedbackCount}
                                            </TableCell>
                                            <TableCell align="right">
                                                <Stack direction={{ xs: 'column', md: 'row' }} spacing={{ xs: 1, md: 3 }}>
                                                    <Gauge width={100} height={100} value={subRow.possitivePercAll} />
                                                </Stack>

                                            </TableCell>
                                        </TableRow>))}
                                </TableBody>
                            </Table>
                        </Box>
                    </Collapse>
                </TableCell>
            </TableRow>
        </React.Fragment>
    );
}

function FeedbackList(props: any) {
    const { search } = props;
    const [page, setPage] = React.useState(0);
    const [rowsPerPage, setRowsPerPage] = React.useState(5);
    const [count, setCount] = React.useState(0);
    const [loading, setLoading] = useState(false);
    const setFeedbacks = useFeedbackStore((state: any) => state.setFeedbacks);
    const feedbacks = useFeedbackStore((state: any) => state.feedbacks);
    const rerender = useFeedbackStore((state: any) => state.rerender);
    const [error, setError] = React.useState<string | null>(null);

    const handleChangePage = (event: unknown, newPage: number) => {
        setPage(newPage);
    };

    const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>) => {
        setRowsPerPage(parseInt(event.target.value, 10));
        setPage(0);
    };

    useEffect(() => {
        const loadPost = async () => {
            setError(null);
            setLoading(true);
            try {
                const params = new URLSearchParams();
                props.filterParams.forEach((value: any, key: any) => {
                    params.append(key, value);
                });
                const response = await axios.get(
                    `${process.env.REACT_APP_BACKEND_BASE_URL}/feedback?limit=${rowsPerPage}&page=${page + 1}&${params.toString()}`
                );
                setFeedbacks(response.data.data);
                setCount(response.data.pagination.size);
                setLoading(false);
                return;
            } catch (err: any) {
                setError(err.message || 'An error occurred');
                setLoading(false);
                return;
            }
        };
        loadPost();
    }, [page, rowsPerPage, search, rerender, setFeedbacks, props.filterParams]);

    return (
        <React.Fragment>
            <TableContainer >
                {loading ? (<CircularProgress />) : (
                    <Table aria-label="collapsible table">
                        <TableHead>
                            <TableRow>
                                <TableCell />
                                <TableCell>Group Name</TableCell>
                                <TableCell align="right">Publication Version</TableCell>
                                <TableCell align="right">Last Feedback time</TableCell>
                                <TableCell align="right">Feedback Group Count</TableCell>
                                <TableCell align="right">Positive Group Feedback (%)</TableCell>
                                <TableCell align="right">Feedback count</TableCell>
                                <TableCell align="right">Positive Feedback (%)</TableCell>
                                {/* <TableCell align="right">Positive System AI Feedback</TableCell> */}
                            </TableRow>
                        </TableHead>
                        <TableBody>
                        {feedbacks && feedbacks.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={8} align="center">No data</TableCell>
                                </TableRow>
                            ) : null}
                            {feedbacks.map((row: any) => (
                                <Row key={row.id} row={row} />
                            ))}
                        </TableBody>
                    </Table>
                )}
                {error ? <Alert severity="error">{error}</Alert> : (null)}
            </TableContainer>
            <TablePagination
                rowsPerPageOptions={[5, 10, 25]}
                component="div"
                count={count}
                rowsPerPage={rowsPerPage}
                page={page}
                onPageChange={handleChangePage}
                onRowsPerPageChange={handleChangeRowsPerPage}
            />
        </React.Fragment>
    );
}

