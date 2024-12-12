import React, { useState, useEffect } from "react";
import axios from "axios";
import Box from '@mui/material/Box';
import Grid from '@mui/material/Grid';
import Collapse from '@mui/material/Collapse';
import IconButton from '@mui/material/IconButton';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import Typography from '@mui/material/Typography';
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';
import KeyboardArrowUpIcon from '@mui/icons-material/KeyboardArrowUp';
import { Button, Chip, FormControl, InputAdornment, MenuItem, Paper, Radio, Select, TablePagination } from "@mui/material";
import SearchIcon from '@mui/icons-material/Search';
import Stack from '@mui/material/Stack';
import TextSnippetIcon from '@mui/icons-material/TextSnippet';
import Alert from '@mui/material/Alert';
import CircularProgress from '@mui/material/CircularProgress';
import CloudOffIcon from '@mui/icons-material/CloudOff';
import InfoIcon from '@mui/icons-material/Info';
import DeleteIcon from '@mui/icons-material/Delete';
import InputLabel from '@mui/material/InputLabel';
import Modal from '@mui/material/Modal';
import TextField from '@mui/material/TextField';
import { create } from 'zustand';
import CodeIcon from '@mui/icons-material/Code';
import FlakyIcon from '@mui/icons-material/Flaky';
import OpenInNewIcon from '@mui/icons-material/OpenInNew';
import { ModalStyle } from "../common/ModalStyle";
import { Item } from "../common/Item";
import { StyledInput } from "../common/StyledInput";

function InfoBox(props: any) {
    const { value, name, subname, subname2 } = props;
    return (
        <React.Fragment>
            <Typography component="h2" variant="h6" color="primary" gutterBottom>
                {name}
            </Typography>
            <Typography component="p" variant="h4">
                {value}
            </Typography>
            <Typography color="text.secondary" sx={{ flex: 1 }}>
                {subname}
            </Typography>
            <Typography color="text.secondary" variant="subtitle2" sx={{ flex: 1}}>
                Last: {subname2}
            </Typography>
        </React.Fragment>
    );
}

export default function Publisher() {
    const [search, setSearch] = React.useState("");
    return (
        <Box sx={{ flexGrow: 1, m: 3 }}>
            <Grid container spacing={3} rowSpacing={3} >
                <Grid item xs={12}>
                    <Stack direction="row" spacing={1}>
                        <TextSnippetIcon sx={{ width: 64, height: 64 }} />
                        <Stack spacing={1}>
                            <Typography variant="h5" component="h1">
                                Publisher
                                <IconButton target="_blank" rel="noopener noreferrer" href="http://localhost:8011/docs#/Prompt/post_group__groupName__publisher__publisherName__prompt__promptName_">
                                    <OpenInNewIcon/>
                                </IconButton>
                            </Typography>
                            <Typography variant="body2" component="h3">
                                Manage your published prompts API.
                            </Typography>
                        </Stack>
                    </Stack>
                </Grid>
                <StatisticsBox>
                </StatisticsBox>
                <Grid item xs={2}>
                    <Item>
                    <React.Fragment>
            <InputLabel htmlFor="input-with-icon-adornment">
                Search
            </InputLabel>
            <StyledInput
                id="input-with-icon-adornment"
                startAdornment={
                    <InputAdornment position="start">
                        <SearchIcon />
                    </InputAdornment>
                }
                onChange={(e) => setSearch(e.target.value)}
            />
        </React.Fragment>
                    </Item>
                </Grid>
                <Grid item xs={10}>
                    <Item><PublishedTable search={search} /></Item>
                </Grid>
            </Grid>
        </Box>
    );
}

const usePublicationsStore = create((set) => ({
    publications: [],
    rerender: 0,
    addPublications: (d: any) => set((state: any) => ({ publications: [d, ...state.publications] })),
    setPublications: (d: any) => set((state: any) => ({ publications: d })),
    triggerRerender: () => set((state: any) => ({ rerender: Math.random() })),
}));

function StatisticsBox(props: any) {
    const [loading, setLoading] = useState(false);
    const [error, setError] = React.useState<string | null>(null);
    const [stats, setStats] = React.useState([]);

    useEffect(() => {
        const loadPost = async () => {
            setError(null);
            setLoading(true);
            try {
                const response = await axios.get(
                    `${process.env.REACT_APP_BACKEND_BASE_URL}/statistics`
                );
                setStats(response.data);
                setLoading(false);
                return;
            } catch (err: any) {
                setError(err.message || 'An error occurred');
                setLoading(false);
                return;
            }
        };
        loadPost();
    }, []);

    function getValue(name: string) {
        return stats && stats.filter((s: any) => s.name === name).length ? stats.filter((s: any) => s.name === name).map((s: any) => s.value) : 0;
    }

    function getCreatedAt(name: string) {
        return stats && stats.filter((s: any) => s.name === name).length ? stats.filter((s: any) => s.name === name).map((s: any) => new Date(s.createdAt).toLocaleTimeString()) : "N/A";
    }


    return (<React.Fragment>
        {loading ? (<CircularProgress />) : error ? (<Grid item xs={12}><Alert severity="error">{error}</Alert></Grid>) : (null)}
        <Grid item xs={2}>
            <Item><InfoBox name={"Tokens"} subname={"/24h"}
            subname2={getCreatedAt("tokens")}
            value={getValue("tokens")} />
            </Item>
        </Grid>
        <Grid item xs={2}>
        <Item><InfoBox name={"Prompt Requests"} subname={"/24h"}
            subname2={getCreatedAt("prompt_requests")}
            value={getValue("prompt_requests")} />
            </Item>
        </Grid>
        <Grid item xs={2}>
        <Item><InfoBox name={"Failed Requests"} subname={"/24h"}
            subname2={getCreatedAt("prompt_request_failures")}
            value={getValue("prompt_request_failures")} />
            </Item>
        </Grid>
        <Grid item xs={2}>
        <Item><InfoBox name={"Prompt failures"} subname={"/24h"}
            subname2={getCreatedAt("prompt_failures")}
            value={getValue("prompt_failures")} />
            </Item>
        </Grid>
        <Grid item xs={2}>
        <Item><InfoBox name={"Feedback count"} subname={"/24h"}
            subname2={getCreatedAt("feedback_count")}
            value={getValue("feedback_count")} />
            </Item>
        </Grid>
        <Grid item xs={2}>
        <Item><InfoBox name={"Analyzer records"} subname={"/24h"}
            subname2={getCreatedAt("analyzer_feedback_count")}
            value={getValue("analyzer_feedback_count")} />
            </Item>
        </Grid>
    </React.Fragment>);
}

function PublishedTable(props: any) {
    const { search } = props;
    const [count, setCount] = React.useState(0);
    const [page, setPage] = React.useState(0);
    const [rowsPerPage, setRowsPerPage] = React.useState(5);
    const [loading, setLoading] = useState(false);
    const setPublications = usePublicationsStore((state: any) => state.setPublications);
    const publications = usePublicationsStore((state: any) => state.publications);
    const rerender = usePublicationsStore((state: any) => state.rerender);
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
                const response = await axios.get(
                    `${process.env.REACT_APP_BACKEND_BASE_URL}/publications?limit=${rowsPerPage}&page=${page + 1}&search=${search}`
                );
                setPublications(response.data.data);
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
    }, [page, rowsPerPage, search, rerender, setPublications]);

    return (
        <>
            <TableContainer >
                {loading ? (<CircularProgress />) : (
                    <Table aria-label="collapsible table">
                        <TableHead>
                            <TableRow key={0}>
                                <TableCell />
                                <TableCell>Name</TableCell>
                                <TableCell align="right">Group Name</TableCell>
                                <TableCell align="right">Publication time</TableCell>
                                <TableCell align="right">Status</TableCell>
                                <TableCell align="right">A/B Testing</TableCell>
                                <TableCell align="right">Actions</TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {publications && publications.length === 0 ? (
                                <TableRow key={0}>
                                    <TableCell colSpan={7} align="center">No data</TableCell>
                                </TableRow>
                            ) : null}
                            {publications.map((row: any, i: any) => (
                                <Row key={i+1} row={row} />
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
        </>
    );
}

function Row(props: { row: ReturnType<typeof data> }) {
    const { row } = props;
    const [open, setOpen] = React.useState(false);

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
                    {row.publishIdentifier}
                </TableCell>
                <TableCell align="right">{row.groupName}</TableCell>
                <TableCell align="right"><p>{row.publishedAt}</p></TableCell>
                <TableCell align="right"><Chip label={row.disabled ? "disabled" : row.devMode ? "dev mode" : "active"} color={row.disabled ? "secondary" : row.devMode ? "warning" : "success"} /></TableCell>
                <TableCell align="right"><p>{row.abTestEnabled ? (<Radio color="success" checked={true} />) : (<Radio disabled={true} />)}</p></TableCell>

                <TableCell align="right">
                    <Stack direction="row" justifyContent="flex-end" alignItems="flex-end" spacing={1}>
                        <ABTestsIcon id={row.groupName} name={row.publishIdentifier} />
                        <DevelopmentModeIcon id={row.groupName} name={row.publishIdentifier} devmode={row.devMode} />
                        <DisableAllPublishIcon id={row.groupName} name={row.publishIdentifier} disabled={row.disabled} />
                        <DeletePublishIcon name={row.publishIdentifier} />
                    </Stack>
                </TableCell>
            </TableRow>
            <TableRow>
                <TableCell style={{ paddingBottom: 0, paddingTop: 0 }} colSpan={12}>
                    <Collapse in={open} timeout="auto" unmountOnExit>
                        <Box sx={{ margin: 1 }}>
                            <Typography variant="h6" gutterBottom component="div">
                                Prompts
                            </Typography>
                            <Table size="small" aria-label="purchases">
                                <TableHead>
                                    <TableRow>
                                        <TableCell>Prompt Name</TableCell>
                                        <TableCell>Parameters</TableCell>
                                        <TableCell>Status</TableCell>
                                        <TableCell align="right">Actions</TableCell>
                                    </TableRow>
                                </TableHead>
                                <TableBody>
                                    {row.prompts.map((p: any, i: any) => (
                                        <TableRow key={i}>
                                            <TableCell>{p.name}</TableCell>
                                            <TableCell>{p.params && p.params.map((p: string, i: any) => <Chip key={i} label={p}></Chip>)}</TableCell>
                                            <TableCell>{p.disabled ? "Disabled" : "Active"}</TableCell>
                                            <TableCell align="right">
                                                <Stack direction="row" justifyContent="flex-end" alignItems="flex-end" spacing={1}>
                                                    <PromptInformation></PromptInformation>
                                                </Stack>
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </Box>
                    </Collapse>
                </TableCell>
            </TableRow>
        </React.Fragment>
    );
}

function PublishInformation() {
    const [open, setOpen] = React.useState(false);
    const handleOpen = () => setOpen(true);
    const handleClose = () => setOpen(false);
    const text = `
        SHow how publish looks like + link to swagger
    `
    return (
        <React.Fragment>
            <IconButton aria-label="info" onClick={() => handleOpen()}>
                <InfoIcon />
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
                            <Typography id="modal-modal-title" variant="h6" component="h2">
                                Fetch selected prompt using:
                            </Typography>
                        </Grid>
                        <Grid item>
                            <TextField
                                style={{ width: "100%" }}
                                id="standard-multiline-static"
                                label="HTTP"
                                multiline
                                rows={6}
                                defaultValue={text}
                                variant="standard"
                                disabled
                            />
                        </Grid>
                    </Grid>
                </Paper>
            </Modal>
        </React.Fragment>
    )
}

function PromptInformation() {
    const [open, setOpen] = React.useState(false);
    const handleOpen = () => setOpen(true);
    const handleClose = () => setOpen(false);
    const text = `
        SHow how prompt looks like + link to swagger
    `
    return (
        <React.Fragment>
            <IconButton aria-label="info" onClick={() => handleOpen()}>
                <InfoIcon />
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
                            <Typography id="modal-modal-title" variant="h6" component="h2">
                                Fetch selected prompt using:
                            </Typography>
                        </Grid>
                        <Grid item>
                            <TextField
                                style={{ width: "100%" }}
                                id="standard-multiline-static"
                                label="HTTP"
                                multiline
                                rows={6}
                                defaultValue={text}
                                variant="standard"
                                disabled
                            />
                        </Grid>
                    </Grid>
                </Paper>
            </Modal>
        </React.Fragment>
    )
}

function data(
    groupId: string,
    groupName: string,
    publishIdentifier: string,
    publishedAt: string,
    prompts: any[],
    abTestEnabled: boolean,
    disabled: boolean,
    devMode: boolean
) {
    return {
        groupId, publishIdentifier, publishedAt, prompts, groupName,abTestEnabled, devMode, disabled
    };
}


function DeletePublishIcon(props: any) {
    const [loading, setLoading] = React.useState(false);
    const [error, setError] = React.useState<string | null>(null);
    const triggerRerender = usePublicationsStore((state: any) => state.triggerRerender);
    const [open, setOpen] = React.useState(false);
    const handleClose = (e: any) => {
        setOpen(false);
        setError(null);
        e.stopPropagation();
    };
    const deleteGroup = async (e: any) => {
        e.stopPropagation();
        setLoading(true);
        setError(null);
        try {
            await axios.delete(
                `${process.env.REACT_APP_BACKEND_BASE_URL}/publications/${props.name}`
            );
        } catch (err: any) {
            setError(err.message || 'An error occurred');
            setLoading(false);
            return;
        }
        setLoading(false);
        triggerRerender();
    };

    return (
        <React.Fragment>
            {loading ? (<CircularProgress />) : (
                <IconButton onClick={(e) => {
                    setOpen(true);
                    e.stopPropagation();
                }} aria-label="delete">
                    <DeleteIcon />
                </IconButton>
            )}
            <Modal
                open={open}
                onClose={(e) => handleClose(e)}
                aria-labelledby="modal-modal-title"
                aria-describedby="modal-modal-description"
            >
                <Paper sx={ModalStyle}>
                    <Grid container direction={"column"} spacing={1} justifyContent="flex-end">
                        <Grid item>
                            <Typography id="modal-modal-title" variant="h6" component="h2">
                                Do you want delete {props.name} publish?
                            </Typography>
                        </Grid>
                        <Grid item>
                            <Box display="flex" gap={4}>
                                {loading ? (<CircularProgress />) :
                                    (<Button onClick={(e) => deleteGroup(e)} variant="contained">
                                        Delete
                                    </Button>)}
                                <Button onClick={(e) => handleClose(e)} variant="outlined" >
                                    Cancel
                                </Button>
                            </Box>
                        </Grid>
                        {error ? (<Grid item>
                            <Alert severity="error">{error}</Alert>
                        </Grid>) : null}
                    </Grid>
                </Paper>
            </Modal>
        </React.Fragment>
    )
}

function DevelopmentModeIcon(props: any) {
    const [loading, setLoading] = React.useState(false);
    const [error, setError] = React.useState<string | null>(null);
    const triggerRerender = usePublicationsStore((state: any) => state.triggerRerender);
    const [open, setOpen] = React.useState(false);
    const handleClose = (e: any) => {
        setOpen(false);
        setError(null);
        e.stopPropagation();
    };
    const deleteGroup = async (e: any) => {
        e.stopPropagation();
        setLoading(true);
        setError(null);
        try {
            await axios.patch(
                `${process.env.REACT_APP_BACKEND_BASE_URL}/publications/${props.name}/devmode`
            );
        } catch (err: any) {
            setError(err.message || 'An error occurred');
            setLoading(false);
            return;
        }
        setLoading(false);
        triggerRerender();
    };

    return (
        <React.Fragment>
            {loading ? (<CircularProgress />) : (
                <IconButton onClick={(e) => {
                    setOpen(true);
                    e.stopPropagation();
                }} aria-label="devmode">
                    <CodeIcon />
                </IconButton>
            )}
            <Modal
                open={open}
                onClose={(e) => handleClose(e)}
                aria-labelledby="modal-modal-title"
                aria-describedby="modal-modal-description"
            >
                <Paper sx={ModalStyle}>
                    <Grid container direction={"column"} spacing={1} justifyContent="flex-end">
                        <Grid item>
                            <Typography id="modal-modal-title" variant="h6" component="h2">
                                Do you want to change {props.name} to {props.devmode ? "regular" : "development"} mode?
                            </Typography>
                        </Grid>
                        <Grid item>
                            <Box display="flex" gap={4}>
                                {loading ? (<CircularProgress />) :
                                    (<Button onClick={(e) => deleteGroup(e)} variant="contained">
                                        Apply
                                    </Button>)}
                                <Button onClick={(e) => handleClose(e)} variant="outlined" >
                                    Cancel
                                </Button>
                            </Box>
                        </Grid>
                        {error ? (<Grid item>
                            <Alert severity="error">{error}</Alert>
                        </Grid>) : null}
                    </Grid>
                </Paper>
            </Modal>
        </React.Fragment>
    )
}
function ABTestsIcon(props: any) {
    const [loading, setLoading] = React.useState(false);
    const [error, setError] = React.useState<string | null>(null);
    const triggerRerender = usePublicationsStore((state: any) => state.triggerRerender);
    const [open, setOpen] = React.useState(false);
    const [avails, setAvails] = React.useState<string[]>([]);
    const [selectedAvails, setSelectedAvails] = React.useState("");
    const [hitRatio, setHitRatio] = React.useState(0);
    const [publications, setPublications] = React.useState([{ "publicationIdentifier": props.name, "hitRatio": 100 }]);

    const handleClose = (e: any) => {
        setOpen(false);
        setError(null);
        e.stopPropagation();
    };

    const handleAdd = (e: any) => {
        if (hitRatio <= 0 || selectedAvails === "") {
            return;
        }
        const ratioHitSum = publications.filter(p => p.publicationIdentifier !== props.name).reduce((acc: number, curr: any) => acc + curr.hitRatio, 0);
        if (ratioHitSum + hitRatio > 100) {
            return;
        } else {
            setPublications([...publications.map((p: any) => {
                if (p.publicationIdentifier === props.name) {
                    return { "publicationIdentifier": p.publicationIdentifier, "hitRatio": 100 - (ratioHitSum + hitRatio) };
                }
                return p;
            }
            ), { "publicationIdentifier": selectedAvails, "hitRatio": hitRatio }]);
            setAvails(avails.filter(a => a !== selectedAvails));
            setSelectedAvails("");
            setHitRatio(0);
        }
    }

    const handleDelete = (publicationIdentifier: string, hitRatio: number) => {
        setPublications(publications.filter(p => p.publicationIdentifier !== publicationIdentifier).map((p: any) => {
            if (p.publicationIdentifier === props.name) {
                return { "publicationIdentifier": p.publicationIdentifier, "hitRatio": p.hitRatio + hitRatio };
            }
            return p;
        }));
        setAvails([...avails, publicationIdentifier]);
    }

    const handleSave = () => {
        setLoading(true);
        setError(null);
        try {
            axios.post(
                `${process.env.REACT_APP_BACKEND_BASE_URL}/publications/abtest/${props.name}`,
                 publications 
            );
        } catch (err: any) {
            setError(err.message || 'An error occurred');
            setLoading(false);
            return;
        }
        setLoading(false);
        triggerRerender();
    }

    const loadAvaliablePublications = async () => {
        setError(null);
        setLoading(true);
        try {
            const response = await axios.get(
                `${process.env.REACT_APP_BACKEND_BASE_URL}/publications/abtest/availability/${props.name}`
            );
            setLoading(false);
            setAvails(response.data?.avaliablePrompts.filter((a: any) => publications.map((p: any) => p.publicationIdentifier).indexOf(a) === -1));
            return;
        } catch (err: any) {
            setError(err.message || 'An error occurred');
            setLoading(false);
            return;
        }
    };

    const loadABTests = async () => {
        setError(null);
        setLoading(true);
        try {
            const availResp = await axios.get(
                `${process.env.REACT_APP_BACKEND_BASE_URL}/publications/abtest/availability/${props.name}`
            );
            const response = await axios.get(
                `${process.env.REACT_APP_BACKEND_BASE_URL}/publications/abtest/${props.name}`
            );
            setLoading(false);
            if (response.status === 404) {
                return;
            }
            setPublications(response.data?.publicationsRatio);
            setAvails(availResp.data?.avaliablePrompts.filter((a: any) => response.data?.publicationsRatio.map((p: any) => p.publicationIdentifier).indexOf(a) === -1));
            return;
        } catch (err: any) {
            if (err?.response.status === 404) {
                setLoading(false);
                return;
            }
            setError(err.message || 'An error occurred');
            setLoading(false);
            return;
        }
    };

    useEffect(() => {
        if (open) {
            loadABTests();
            loadAvaliablePublications();
        }
    }, [open]);

    return (
        <React.Fragment>
            {loading ? (<CircularProgress />) : error ? <Alert severity="error"> {error} </Alert> : (
                <IconButton onClick={(e) => {
                    setOpen(true);
                    e.stopPropagation();
                }} aria-label="abtest">
                    <FlakyIcon />
                </IconButton>
            )}
            <Modal
                open={open}
                onClose={(e) => handleClose(e)}
                aria-labelledby="modal-modal-title"
                aria-describedby="modal-modal-description"
            >
                <Paper sx={ModalStyle}>
                    <Grid container direction={"column"} spacing={1} justifyContent="flex-end">
                        <Grid item>
                            <Typography id="modal-modal-title" variant="h6" component="h3">
                                A/B Test
                            </Typography>
                        </Grid>
                        <Grid item>
                            <Grid container direction={"row"} spacing={2}>
                                <Grid item xs={6}>
                                    <FormControl variant="standard" sx={{ minWidth: "100%" }}>
                                        <InputLabel id="abtest-avail">Publication</InputLabel>
                                        <Select
                                            labelId="abtest-avail"
                                            id="abtest-avail"
                                            value={selectedAvails}
                                            label="Publication"
                                            onChange={(e: any) => setSelectedAvails(e.target.value)}
                                        >
                                            {avails.map((a: any) => (
                                                <MenuItem value={a}>{a}</MenuItem>
                                            ))}
                                        </Select>
                                    </FormControl>
                                </Grid>
                                <Grid item xs={3}>
                                    <TextField
                                        id="standard-number"
                                        label="Hit Ratio (%)"
                                        type="number"
                                        variant="standard"
                                        value={hitRatio}
                                        onChange={(e: any) => setHitRatio(parseInt(e.target.value))}
                                    />
                                </Grid>
                                <Grid item xs={3}>
                                    <Button variant="contained"
                                        onClick={(e) => handleAdd(e)}
                                    >Add</Button>
                                </Grid>
                            </Grid>
                        </Grid>
                        <Grid item>
                            <TableContainer component={Paper} sx={{ maxHeight: 300 }}>
                                <Table aria-label="simple table">
                                    <TableHead>
                                        <TableRow>
                                            <TableCell >Publication</TableCell>
                                            <TableCell >Hit Ratio</TableCell>
                                            <TableCell align="right">Action</TableCell>
                                        </TableRow>
                                    </TableHead>
                                    <TableBody>
                                        {publications.map((row: any, i: any) => (
                                            <TableRow
                                                key={i}
                                                sx={{ '&:last-child td, &:last-child th': { border: 0 } }}
                                            >
                                                <TableCell>{row.publicationIdentifier}</TableCell>
                                                <TableCell>{row.hitRatio}%</TableCell>
                                                <TableCell align="right">
                                                    {row.publicationIdentifier !== props.name ? (
                                                    <IconButton aria-label="delete" onClick={() => {
                                                        handleDelete(row.publicationIdentifier, row.hitRatio);
                                                    }
                                                    }>
                                                        <DeleteIcon />
                                                    </IconButton>) : null}
                                                </TableCell>
                                            </TableRow>))}
                                    </TableBody>
                                </Table>
                            </TableContainer>
                        </Grid>
                        <Grid item>
                        <Box display="flex" gap={4}>
                                {loading ? (<CircularProgress />) :
                                    (<Button onClick={(e) => handleSave()} variant="contained">
                                        Save
                                    </Button>)}
                                <Button onClick={(e) => handleClose(e)} variant="outlined" >
                                    Cancel
                                </Button>
                            </Box>
                            </Grid>
                    </Grid>
                </Paper>
            </Modal>
        </React.Fragment>
    )
}


function DisableAllPublishIcon(props: any) {
    const [loading, setLoading] = React.useState(false);
    const [error, setError] = React.useState<string | null>(null);
    const triggerRerender = usePublicationsStore((state: any) => state.triggerRerender);
    const [open, setOpen] = React.useState(false);
    const handleClose = (e: any) => {
        setOpen(false);
        setError(null);
        e.stopPropagation();
    };
    const disableAll = async (e: any) => {
        e.stopPropagation();
        setLoading(true);
        setError(null);
        try {
            await axios.patch(
                `${process.env.REACT_APP_BACKEND_BASE_URL}/publications/${props.name}/disable`
            );
        } catch (err: any) {
            setError(err.message || 'An error occurred');
            setLoading(false);
            return;
        }
        setLoading(false);
        triggerRerender();
    };

    return (
        <React.Fragment>
            {loading ? (<CircularProgress />) : (
                <IconButton onClick={(e) => {
                    setOpen(true);
                    e.stopPropagation();
                }} aria-label="disable">
                    <CloudOffIcon />
                </IconButton>
            )}
            <Modal
                open={open}
                onClose={(e) => handleClose(e)}
                aria-labelledby="modal-modal-title"
                aria-describedby="modal-modal-description"
            >
                <Paper sx={ModalStyle}>
                    <Grid container direction={"column"} spacing={1} justifyContent="flex-end">
                        <Grid item>
                            <Typography id="modal-modal-title" variant="h6" component="h2">
                                Do you want to {props.disabled ? "activate" : "disable" } {props.name} publication?
                            </Typography>
                        </Grid>
                        <Grid item>
                            <Box display="flex" gap={4}>
                                {loading ? (<CircularProgress />) :
                                    (<Button onClick={(e) => disableAll(e)} variant="contained">
                                        Apply
                                    </Button>)}
                                <Button onClick={(e) => handleClose(e)} variant="outlined" >
                                    Cancel
                                </Button>
                            </Box>
                        </Grid>
                        {error ? (<Grid item>
                            <Alert severity="error">{error}</Alert>
                        </Grid>) : null}
                    </Grid>
                </Paper>
            </Modal>
        </React.Fragment>
    )
}