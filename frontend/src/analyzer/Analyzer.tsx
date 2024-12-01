import React, { useEffect } from "react";
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
import { Modal, Paper, TablePagination, Tooltip } from "@mui/material";
import IconButton from '@mui/material/IconButton';
import InputLabel from '@mui/material/InputLabel';
import Typography from '@mui/material/Typography';
import Alert from '@mui/material/Alert';
import CircularProgress from '@mui/material/CircularProgress';
import Stack from '@mui/material/Stack';
import BarChartIcon from '@mui/icons-material/BarChart';
import FormControl from '@mui/material/FormControl';
import Select, { SelectChangeEvent } from '@mui/material/Select';
import MenuItem from '@mui/material/MenuItem';
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';
import KeyboardArrowUpIcon from '@mui/icons-material/KeyboardArrowUp';
import Collapse from '@mui/material/Collapse';
import Chip from '@mui/material/Chip';
import { DemoContainer } from '@mui/x-date-pickers/internals/demo';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { DateTimePicker } from '@mui/x-date-pickers/DateTimePicker';
import { DateTimeValidationError, PickerChangeHandlerContext } from "@mui/x-date-pickers";
import { Dayjs } from "dayjs";
import OutputIcon from '@mui/icons-material/Output';
import OpenInNewIcon from '@mui/icons-material/OpenInNew';
import ThumbUpIcon from '@mui/icons-material/ThumbUp';
import ThumbDownIcon from '@mui/icons-material/ThumbDown';
import Snackbar from '@mui/material/Snackbar';
import { ModalStyle } from "../common/ModalStyle";
import { Item } from "../common/Item";


const StyledTableRow = styled(TableRow)(({ theme }) => ({
    '&:nth-of-type(odd)': {
        backgroundColor: theme.palette.action.hover,
    },
    '&:last-child td, &:last-child th': {
        border: 0,
    },
}));

export default function Analyzer() {
    const [filterParams, setFilterParams] = React.useState(new Map<string, string>());
    const [error, setError] = React.useState(null);
    const [loading, setLoading] = React.useState(true);
    const [filterOptions, setFilterOptions] = React.useState([]);

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
                    `${process.env.REACT_APP_BACKEND_BASE_URL}/analyzer/options?names=correlationId,groupName,promptName,status,publisherIdentifier`
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
                        <BarChartIcon sx={{ width: 64, height: 64 }} />
                        <Stack spacing={1}>
                            <Typography variant="h5" component="h1">
                                Analyzer
                                <IconButton target="_blank" rel="noopener noreferrer" href="http://localhost:8011/docs#/Analyzer/post_prompt_analyzer">
                                    <OpenInNewIcon />
                                </IconButton>
                            </Typography>
                            <Typography variant="body2" component="h3">
                                Analyze output of executed prompts.
                            </Typography>
                        </Stack>
                    </Stack>
                </Grid>
                <Grid item xs={12}>
                    <Item>
                        {loading ? (<CircularProgress />) : error ? <Alert severity="error">{error}</Alert> : (null)}
                        <Grid container spacing={3} rowSpacing={3} >
                            <Grid item xs={3}>
                                <LocalizationProvider dateAdapter={AdapterDayjs}>
                                    <DemoContainer components={['DateTimePicker']}>
                                        <DateTimePicker label="From Execution time" ampm={false} name="from" onChange={handleFromTimeParam} />
                                    </DemoContainer>
                                </LocalizationProvider>
                            </Grid>
                            <Grid item xs={3}>
                                <LocalizationProvider dateAdapter={AdapterDayjs}>
                                    <DemoContainer components={['DateTimePicker']}>
                                        <DateTimePicker label="To Execution time" ampm={false} name="to" onChange={handleToTimeParam} />
                                    </DemoContainer>
                                </LocalizationProvider>
                            </Grid>
                        </Grid>
                        <Grid container spacing={3} rowSpacing={3} >
                            <Grid item xs={3}>
                                <FormControl variant="standard" sx={{ m: 1, minWidth: "100%" }}>
                                    <InputLabel id="demo-simple-select-standard-label">Prompt Name</InputLabel>
                                    <Select
                                        labelId="demo-simple-select-standard-label"
                                        id="demo-simple-select-standard"
                                        value={filterParams.get('promptName') || ""}
                                        onChange={handleChange}
                                        label="promptName"
                                        name="promptName"
                                    >
                                        <MenuItem value="">
                                            <em>None</em>
                                        </MenuItem>
                                        {filterOptions.filter((x: any) => x.filterName === 'promptName')
                                            .flatMap((x: any) => x.options)
                                            .map((x: any, i: any) => <MenuItem key={i} value={x}>{x}</MenuItem>
                                            )}
                                    </Select>
                                </FormControl>
                            </Grid>
                            <Grid item xs={3}>
                                <FormControl variant="standard" sx={{ m: 1, minWidth: "100%" }}>
                                    <InputLabel id="demo-simple-select-standard-label">Group Name</InputLabel>
                                    <Select
                                        labelId="demo-simple-select-standard-label"
                                        id="demo-simple-select-standard"
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
                            <Grid item xs={3}>
                                <FormControl variant="standard" sx={{ m: 1, minWidth: "100%" }}>
                                    <InputLabel id="demo-simple-select-standard-label">Publication Name</InputLabel>
                                    <Select
                                        labelId="demo-simple-select-standard-label"
                                        id="demo-simple-select-standard"
                                        value={filterParams.get('publisherIdentifier') || ""}
                                        onChange={handleChange}
                                        label="publisherIdentifier"
                                        name="publisherIdentifier"
                                    >
                                        <MenuItem value="">
                                            <em>None</em>
                                        </MenuItem>
                                        {filterOptions.filter((x: any) => x.filterName === 'publisherIdentifier')
                                            .flatMap((x: any) => x.options)
                                            .map((x: any, i: any) => <MenuItem key={i} value={x}>{x}</MenuItem>
                                            )}
                                    </Select>
                                </FormControl>
                            </Grid>
                            <Grid item xs={3}>
                                <FormControl variant="standard" sx={{ m: 1, minWidth: "100%" }}>
                                    <InputLabel id="demo-simple-select-standard-label">Status</InputLabel>
                                    <Select
                                        labelId="demo-simple-select-standard-label"
                                        id="demo-simple-select-standard"
                                        value={filterParams.get('status') || ""}
                                        onChange={handleChange}
                                        label="status"
                                        name="status"
                                    >
                                        <MenuItem value="">
                                            <em>None</em>
                                        </MenuItem>
                                        {filterOptions.filter((x: any) => x.filterName === 'status')
                                            .flatMap((x: any) => x.options)
                                            .map((x: any, i: any) => <MenuItem key={i} value={x}>{x}</MenuItem>
                                            )}
                                    </Select>
                                </FormControl>
                            </Grid>
                            <Grid item xs={3}>
                                <FormControl variant="standard" sx={{ m: 1, minWidth: "100%" }}>
                                    <InputLabel id="correlationId">Correlation Id</InputLabel>
                                    <Select
                                        labelId="correlationId"
                                        id="correlationId"
                                        value={filterParams.get('correlationId') || ""}
                                        onChange={handleChange}
                                        label="correlationId"
                                        name="correlationId"
                                    >
                                        <MenuItem value="">
                                            <em>None</em>
                                        </MenuItem>
                                        {filterOptions.filter((x: any) => x.filterName === 'correlationId')
                                            .flatMap((x: any) => x.options)
                                            .map((x: any, i: any) => <MenuItem key={i} value={x}>{x}</MenuItem>
                                            )}
                                    </Select>
                                </FormControl>
                            </Grid>
                        </Grid>
                    </Item>
                </Grid>
                <Grid item xs={12}>
                    <Item>
                        <Grid container spacing={3} rowSpacing={3} >
                            <Grid item xs={12}>
                                <Paper elevation={3}>
                                    <AnalyzerOutputList filterParams={filterParams} />
                                </Paper>
                            </Grid>
                        </Grid>
                    </Item>
                </Grid>
            </Grid>
        </Box>
    );
}



function OuputInformation(props: any) {
    const [open, setOpen] = React.useState(false);
    const [showFeedback, setShowFeedback] = React.useState(false);
    const [feedbackMessage, setFeedbackMessage] = React.useState('');

    const handleOpen = () => setOpen(true);
    const handleClose = () => setOpen(false);
    const handleFeedbackClose = () => setShowFeedback(false);

    const [error, setError] = React.useState(null);
    const [loading, setLoading] = React.useState(false);

    const handleFeedback = (row: any, type: 'like' | 'dislike') => {
        const sendFeedback = async () => {
            console.log(row)
            setError(null);
            setLoading(true);
            try {
                await axios.post(
                    `${process.env.REACT_APP_BACKEND_BASE_URL}/prompt/feedback`,
                    {
                        "objectName": row.groupName,
                        "positive": type === 'like' ? true : false,
                        "publicationVersion": row.publicationName,
                        "type": "group"
                    }
                );
                setLoading(false);
                setFeedbackMessage(`Thanks for the ${type} feedback!`);
                setShowFeedback(true);
                return;
            } catch (err: any) {
                setError(err.message || 'An error occurred');
                setLoading(false);
                setFeedbackMessage(err.message || 'An error occurred');
                setShowFeedback(true);
                return;
            }
        };
        sendFeedback();
    }
    return (
        <React.Fragment>
            <IconButton aria-label="info" onClick={() => handleOpen()} disabled={!props.row.finalOutput}>
                <OutputIcon />
            </IconButton>
            <Modal
                open={open}
                onClose={handleClose}
                aria-labelledby="modal-modal-title"
                aria-describedby="modal-modal-description"
            >
                <Paper sx={ModalStyle}>
                    <Grid container direction={"column"} spacing={3}>
                        <Grid item>
                            <Stack direction="row" justifyContent="space-between" alignItems="center">
                                <Typography id="modal-modal-title" variant="h6" component="h2">
                                    Final result
                                </Typography>
                                <Stack direction="row" spacing={1}>
                                    <IconButton onClick={() => handleFeedback(props.row, 'like')}>
                                        <ThumbUpIcon />
                                    </IconButton>
                                    <IconButton onClick={() => handleFeedback(props.row, 'dislike')}>
                                        <ThumbDownIcon />
                                    </IconButton>
                                </Stack>
                            </Stack>
                        </Grid>
                        <Grid item>
                            <Item>
                                <Typography variant="body2" gutterBottom component="pre"
                                    sx={{
                                        maxWidth: '100%',
                                        whiteSpace: 'pre-wrap',
                                        wordWrap: 'break-word',
                                        overflowX: 'auto',
                                        padding: '16px',
                                        maxHeight: '500px',
                                    }}
                                >{parseJSON(props.row.finalOutput)}
                                </Typography>
                            </Item>
                        </Grid>
                    </Grid>
                </Paper>
            </Modal>
            <Snackbar
                open={showFeedback}
                autoHideDuration={3000}
                onClose={handleFeedbackClose}
                message={feedbackMessage}
            />
        </React.Fragment>
    )
}

function parseJSON(jsonText: string) {
    try {
        return JSON.stringify(JSON.parse(jsonText), null, 2);
    } catch (ex) {
        return jsonText;
    }
}

function Row(props: { row: ReturnType<any> }) {
    const { row } = props;
    const [open, setOpen] = React.useState(false);
    const [openDetails, setOpenDetails] = React.useState(-1);
    return (
        <React.Fragment>
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
                <TableCell align="right">{row.publicationName}</TableCell>
                <TableCell align="right">
                    <Tooltip title={row.id} placement="top">
                        <span>{row.id.substring(0, 18)}...</span>
                    </Tooltip>
                </TableCell>
                <TableCell align="right">
                    {row.status === 'success' ? (
                        <Chip label="Success" color="success" />
                    ) : row.status === 'error' ? (
                        <Chip label="Error" color="error" />
                    ) : (
                        row.status
                    )}
                </TableCell>
                <TableCell align="right">{new Date(row.startExecutionTime).toLocaleString('us-US')}</TableCell>
                <TableCell align="right">{new Date(row.endExecutionTime).toLocaleString('us-US')}</TableCell>
                <TableCell align="right"><p>{(row.duration / 1e9).toFixed(2)} sec.</p></TableCell>
                <TableCell align="right">
                    <OuputInformation row={row}></OuputInformation>
                </TableCell>
            </TableRow>
            <TableRow>
                <TableCell style={{ paddingBottom: 0, paddingTop: 0 }} colSpan={8}>
                    <Collapse in={open} timeout="auto" unmountOnExit>
                        <Box sx={{ margin: 1 }}>
                            <TableContainer >
                                <Table aria-label="collapsible table">
                                    <TableHead>
                                        <TableRow>
                                            <TableCell />
                                            <TableCell>Prompt Name</TableCell>
                                            <TableCell align="right">Status</TableCell>
                                            <TableCell align="right">Execution time</TableCell>
                                        </TableRow>
                                    </TableHead>
                                    <TableBody>
                                        {row.promptOutputs.map((row: any, idx: any) => (
                                            <React.Fragment>
                                                <TableRow key={idx}>
                                                    <TableCell>
                                                        <IconButton
                                                            aria-label="expand row 2"
                                                            size="small"
                                                            onClick={() => openDetails !== idx ? setOpenDetails(idx) : setOpenDetails(-1)}
                                                        >
                                                            {openDetails === idx ? <KeyboardArrowUpIcon /> : <KeyboardArrowDownIcon />}
                                                        </IconButton>
                                                    </TableCell>
                                                    <TableCell component="th" scope="row">
                                                        {row.promptName}
                                                    </TableCell>
                                                    <TableCell align="right">
                                                        {row.status === 'success' ? (
                                                            <Chip label="Success" color="success" />
                                                        ) : row.status === 'error' ? (
                                                            <Chip label="Error" color="error" />
                                                        ) : (
                                                            row.status
                                                        )}
                                                    </TableCell>
                                                    <TableCell align="right">{new Date(row.executionTime).toLocaleString('us-US')}</TableCell>
                                                </TableRow>
                                                {RowNested(openDetails === idx, row)}
                                            </React.Fragment>
                                        ))}
                                    </TableBody>
                                </Table>
                            </TableContainer>
                        </Box>
                    </Collapse>
                </TableCell>
            </TableRow>
        </React.Fragment>
    );
}

function RowNested(openDetails: boolean, row: any) {
    const [showFeedback, setShowFeedback] = React.useState(false);
    const [feedbackMessage, setFeedbackMessage] = React.useState('');
    const [error, setError] = React.useState(null);
    const [loading, setLoading] = React.useState(false);

    const handleFeedback = (row: any, type: 'like' | 'dislike') => {
        const sendFeedback = async () => {
            setError(null);
            setLoading(true);
            try {
                await axios.post(
                    `${process.env.REACT_APP_BACKEND_BASE_URL}/prompt/feedback`,
                    {
                        "objectName": row.promptName,
                        "positive": type === 'like' ? true : false,
                        "publicationVersion": row.prompt.publishIdentifier,
                        "type": "prompt"
                    }
                );
                setLoading(false);
                setFeedbackMessage(`Thanks for the ${type} feedback!`);
                setShowFeedback(true);
                return;
            } catch (err: any) {
                setError(err.message || 'An error occurred');
                setLoading(false);
                setFeedbackMessage(err.message || 'An error occurred');
                setShowFeedback(true);
                return;
            }
        };
        sendFeedback();
    };

    return (
        <React.Fragment>
            <StyledTableRow>
                <TableCell style={{ paddingBottom: 0, paddingTop: 0 }} colSpan={6}>
                    <Collapse in={openDetails} timeout="auto" unmountOnExit>
                        <Box sx={{ margin: 1 }}>
                            <TableContainer>
                                <Table aria-label="collapsible table 2s">
                                    <TableHead>
                                    </TableHead>
                                    <TableBody>
                                        <TableRow>
                                            <Grid container spacing={1}>
                                                <Grid xs={6}>
                                                    <TableContainer component={Paper}>
                                                        <Table aria-label="simple table">
                                                            <TableHead>
                                                                <TableRow>
                                                                    <TableCell>Key</TableCell>
                                                                    <TableCell align="right">Value</TableCell>
                                                                </TableRow>
                                                            </TableHead>
                                                            <TableBody>
                                                                <TableRow
                                                                    key={0}
                                                                    sx={{ '&:last-child td, &:last-child th': { border: 0 } }}
                                                                >
                                                                    <TableCell component="th" scope="row">
                                                                        Name
                                                                    </TableCell>
                                                                    <TableCell align="right">{row.prompt.name}</TableCell>
                                                                </TableRow>
                                                                <TableRow
                                                                    key={1}
                                                                    sx={{ '&:last-child td, &:last-child th': { border: 0 } }}
                                                                >
                                                                    <TableCell component="th" scope="row">
                                                                        Publisher Name
                                                                    </TableCell>
                                                                    <TableCell align="right">{row.prompt.publishIdentifier}</TableCell>
                                                                </TableRow>
                                                                <TableRow
                                                                    key={2}
                                                                    sx={{ '&:last-child td, &:last-child th': { border: 0 } }}
                                                                >
                                                                    <TableCell component="th" scope="row">
                                                                        System
                                                                    </TableCell>
                                                                    <TableCell align="right">{row.prompt.system}</TableCell>
                                                                </TableRow>
                                                                <TableRow
                                                                    key={3}
                                                                    sx={{ '&:last-child td, &:last-child th': { border: 0 } }}
                                                                >
                                                                    <TableCell component="th" scope="row">
                                                                        Prompt
                                                                    </TableCell>
                                                                    <TableCell align="right">{row.prompt.prompt}</TableCell>
                                                                </TableRow>
                                                                <TableRow
                                                                    key={4}
                                                                    sx={{ '&:last-child td, &:last-child th': { border: 0 } }}
                                                                >
                                                                    <TableCell component="th" scope="row">
                                                                        Prompt Output
                                                                    </TableCell>
                                                                    <TableCell align="right">{row.prompt.outputPrompt}</TableCell>
                                                                </TableRow>
                                                                <TableRow
                                                                    key={5}
                                                                    sx={{ '&:last-child td, &:last-child th': { border: 0 } }}
                                                                >
                                                                    <TableCell component="th" scope="row">
                                                                        Output example
                                                                    </TableCell>
                                                                    <TableCell align="right">{row.prompt.outputExamples}</TableCell>
                                                                </TableRow>
                                                                <TableRow
                                                                    key={6}
                                                                    sx={{ '&:last-child td, &:last-child th': { border: 0 } }}
                                                                >
                                                                    <TableCell component="th" scope="row">
                                                                        Temerature
                                                                    </TableCell>
                                                                    <TableCell align="right">{row.prompt?.temperature}</TableCell>
                                                                </TableRow>
                                                                <TableRow
                                                                    key={7}
                                                                    sx={{ '&:last-child td, &:last-child th': { border: 0 } }}
                                                                >
                                                                    <TableCell component="th" scope="row">
                                                                        Top P
                                                                    </TableCell>
                                                                    <TableCell align="right">{row.prompt?.topP}</TableCell>
                                                                </TableRow>
                                                                <TableRow
                                                                    key={8}
                                                                    sx={{ '&:last-child td, &:last-child th': { border: 0 } }}
                                                                >
                                                                    <TableCell component="th" scope="row">
                                                                        Params
                                                                    </TableCell>
                                                                    <TableCell align="right">
                                                                        <Stack spacing={2} mt={2} direction="row" useFlexGap flexWrap="wrap">
                                                                            {row.prompt?.params?.map((x: any) => <Tooltip title={row.prompt?.promptParams[x] || ""} placement="top"><Chip label={x} /></Tooltip>)}
                                                                        </Stack>
                                                                    </TableCell>
                                                                </TableRow>
                                                            </TableBody>
                                                        </Table>
                                                    </TableContainer>
                                                </Grid>
                                                <Grid xs={6}>
                                                    <Item sx={{ maxWidth: '100%' }}>
                                                        <Typography variant="subtitle1" gutterBottom>
                                                            Output
                                                        </Typography>
                                                        <Typography variant="body2" gutterBottom component="pre"
                                                            sx={{
                                                                maxWidth: '100%',
                                                                whiteSpace: 'pre-wrap',
                                                                wordWrap: 'break-word',
                                                                overflowX: 'auto',
                                                                padding: '16px',
                                                            }}
                                                        >{parseJSON(row.output)}
                                                        </Typography>
                                                    </Item>
                                                    {loading ? (<CircularProgress />) : error ? <Alert severity="error">{error}</Alert> : (
                                                        <Stack direction="row" spacing={1} justifyContent="flex-end">
                                                            <IconButton onClick={() => handleFeedback(row, 'like')}>
                                                                <ThumbUpIcon />
                                                            </IconButton>
                                                            <IconButton onClick={() => handleFeedback(row, 'dislike')}>
                                                                <ThumbDownIcon />
                                                            </IconButton>
                                                        </Stack>
                                                    )}
                                                    {row.statusMessage ? (
                                                        <Item sx={{ marginTop: 1 }}>
                                                            <Typography variant="subtitle1" gutterBottom>
                                                                Status message
                                                            </Typography>
                                                            <Typography variant="body2" gutterBottom>
                                                                {row.statusMessage}
                                                            </Typography>
                                                        </Item>) : (null)}
                                                </Grid>
                                            </Grid>
                                        </TableRow>
                                    </TableBody>
                                </Table>
                            </TableContainer>
                        </Box>
                    </Collapse>
                </TableCell>
            </StyledTableRow>
            <Snackbar
                open={showFeedback}
                autoHideDuration={3000}
                onClose={() => setShowFeedback(false)}
                message={feedbackMessage}
            />
        </React.Fragment>
    );
}

function AnalyzerOutputList(props: any) {
    const [error, setError] = React.useState(null);
    const [loading, setLoading] = React.useState(true);
    const [outputs, setOutputs] = React.useState([]);
    const [page, setPage] = React.useState(0);
    const [count, setCount] = React.useState(0);
    const [rowsPerPage, setRowsPerPage] = React.useState(5);

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
                    `${process.env.REACT_APP_BACKEND_BASE_URL}/analyzer?limit=${rowsPerPage}&page=${page + 1}&${params.toString()}`
                );
                setOutputs(response.data.data);
                setCount(response.data.pagination.size)
                setLoading(false);
                return;
            } catch (err: any) {
                setError(err.message || 'An error occurred');
                setLoading(false);
                return;
            }
        };
        loadPost();
    }, [page, rowsPerPage, setOutputs, props.filterParams]);

    return (
        <React.Fragment>
            <TableContainer >
                {loading ? (<CircularProgress />) : (
                    <Table aria-label="collapsible table">
                        <TableHead>
                            <TableRow key={1}>
                                <TableCell />
                                <TableCell>Group Name</TableCell>
                                <TableCell align="right">Publication Name</TableCell>
                                <TableCell align="right">Correlation ID</TableCell>
                                <TableCell align="right">Status</TableCell>
                                <TableCell align="right">Start Time</TableCell>
                                <TableCell align="right">End Time</TableCell>
                                <TableCell align="right">Duration</TableCell>
                                <TableCell align="right">Action</TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {outputs && outputs.length === 0 ? (
                                <TableRow key={0}>
                                    <TableCell colSpan={9} align="center">No data</TableCell>
                                </TableRow>
                            ) : null}
                            {outputs.map((row: any, i: any) => (
                                <Row key={i + 1} row={row} />
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

