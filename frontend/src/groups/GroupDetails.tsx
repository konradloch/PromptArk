import React, { useEffect } from "react";
import { styled } from '@mui/material/styles';
import Box from '@mui/material/Box';
import Grid from '@mui/material/Grid';
import { IconButton, Paper } from "@mui/material";
import TextField from '@mui/material/TextField';
import PromptFlow from "../prompts/PromptFlow";
import Stack from '@mui/material/Stack';
import Button from '@mui/material/Button';
import AddIcon from '@mui/icons-material/Add';
import TextSnippetIcon from '@mui/icons-material/TextSnippet';
import Input from '@mui/material/Input';
import InputLabel from '@mui/material/InputLabel';
import Modal from '@mui/material/Modal';
import Alert from '@mui/material/Alert';
import Typography from '@mui/material/Typography';
import CircularProgress from '@mui/material/CircularProgress';
import PublishIcon from '@mui/icons-material/Publish';
import { create } from 'zustand';
import axios from "axios";
import Select from '@mui/material/Select';
import MenuItem from '@mui/material/MenuItem';
import { useParams } from "react-router-dom";
import Tabs from '@mui/material/Tabs';
import Tab from '@mui/material/Tab';
import { usePromptNodeStore } from "../prompts/PromptFlowNodeState";
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import { TablePagination } from "@mui/material";
import { useNavigate } from "react-router-dom";
import DeleteIcon from '@mui/icons-material/Delete';
import SettingsIcon from '@mui/icons-material/Settings';
import { PreviewPromptAction } from "../prompts/PromptPreview";
import ExecutionType from "../tooltips/ExecutionType";
import OutputType from "../tooltips/OutputType";
import { ModalStyle } from "../common/ModalStyle";
import { Item } from "../common/Item";
import { StyledInput } from "../common/StyledInput";

const FlowItem = styled(Paper)(({ theme }) => ({
    padding: theme.spacing(1),
    width: '100%',
    height: '62vh', //or constant 700 for example TODO
}));

const StyledTextField = styled(TextField)(({ theme }) => ({
    backgroundColor: theme.palette.background.default,
}));

const StyledSelect = styled(Select)(({ theme }) => ({
    backgroundColor: theme.palette.background.default,
}));


export const usePromptStore = create((set) => ({
    prompts: [],
    rerender: 0,
    addPrompt: (d: any) => set((state: any) => ({ prompts: [d, ...state.prompts] })),
    setPrompt: (d: any) => set((state: any) => ({ prompts: d })),
    triggerRerender: () => set((state: any) => ({ rerender: Math.random() })),
}));


interface TabPanelProps {
    children?: React.ReactNode;
    index: number;
    value: number;
}

function CustomTabPanel(props: TabPanelProps) {
    const { children, value, index, ...other } = props;
    return (
        <div
            role="tabpanel"
            hidden={value !== index}
            id={`simple-tabpanel-${index}`}
            aria-labelledby={`simple-tab-${index}`}
            {...other}
        >
            {value === index && (
                <Box sx={{ p: 3 }}>
                    <Typography component="span">{children}</Typography>
                </Box>
            )}
        </div>
    );
}

function a11yProps(index: number) {
    return {
        id: `simple-tab-${index}`,
        'aria-controls': `simple-tabpanel-${index}`,
    };
}

export default function GroupDetails() {
    const [loading, setLoading] = React.useState(false);
    const [error, setError] = React.useState<string | null>(null);
    const prompts = usePromptStore((state: any) => state.prompts);
    const setPrompts = usePromptStore((state: any) => state.setPrompt);
    const rerender = usePromptStore((state: any) => state.rerender);
    const { groupId } = useParams();

    const tabValue = usePromptNodeStore((state: any) => state.tabValue);
    const setTabValue = usePromptNodeStore((state: any) => state.setTabValue);

    const handleChange = (event: React.SyntheticEvent, newValue: number) => {
        setTabValue(newValue);
    };

    useEffect(() => {
        const loadPost = async () => {
            setError(null);
            setLoading(true);
            try {
                const response = await axios.get(
                    `${process.env.REACT_APP_BACKEND_BASE_URL}/group/${groupId}/prompts`
                );
                setPrompts(response.data);
                setLoading(false);
                return;
            } catch (err: any) {
                setError(err.message || 'An error occurred');
                setLoading(false);
                return;
            }
        };
        loadPost();
    }, [rerender, groupId, setPrompts]);

    return (
        <Box sx={{ flexGrow: 1, m: 3 }}>
            <Grid container spacing={3} rowSpacing={3}>
                <Grid item xs={12}>
                    <Stack direction="row" spacing={1}>
                        <TextSnippetIcon sx={{ width: 64, height: 64 }} />
                        <Stack spacing={1}>
                            <Typography variant="h5" component="span">
                                Prompt details
                            </Typography>
                            <Typography variant="body2" component="span">
                                Manage, control flow and publish your prompts.
                            </Typography>
                        </Stack>
                    </Stack>


                    <Grid item xs={12}>
                        <Box sx={{ width: '100%' }}>
                            <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
                                <Tabs value={tabValue} onChange={handleChange} aria-label="basic tabs example">
                                    <Tab label="Graph View" {...a11yProps(0)} />
                                    <Tab label="List View" {...a11yProps(1)} />
                                </Tabs>
                            </Box>
                            <CustomTabPanel value={tabValue} index={0}>
                                <Item>
                                    <Grid container spacing={3} rowSpacing={3}>
                                        <Grid item xs={12}>
                                            <PromptCreator />
                                        </Grid>
                                        <Grid item xs={12} >
                                            {loading ? (<CircularProgress />) : (<FlowItem elevation={3}> <PromptFlow prompts={prompts} /> </FlowItem>)}
                                        </Grid>
                                        {error ? (<Grid item>
                                            <Alert severity="error">{error}</Alert>
                                        </Grid>) : null}
                                    </Grid>
                                </Item>
                            </CustomTabPanel>
                            <CustomTabPanel value={tabValue} index={1}>
                                <Item>
                                    <Grid container spacing={3} rowSpacing={3}>
                                        <Grid item xs={12}>
                                            <PromptCreator />
                                        </Grid>
                                        <Grid item xs={12} >
                                            {loading ? (<CircularProgress />) : (<GroupTable prompts={prompts} />)}
                                        </Grid>
                                        {error ? (<Grid item>
                                            <Alert severity="error">{error}</Alert>
                                        </Grid>) : null}
                                    </Grid>
                                </Item>
                            </CustomTabPanel>
                        </Box>
                    </Grid>


                </Grid>

            </Grid>
        </Box>
    );
}


function PublishGroup() {
    const [open, setOpen] = React.useState(false);
    const handleOpen = () => setOpen(true);
    const handleClose = () => setOpen(false);
    const [name, setName] = React.useState("");
    const { groupId } = useParams();
    const [loading, setLoading] = React.useState(false);
    const [error, setError] = React.useState<string | null>(null);
    const triggerRerender = usePromptStore((state: any) => state.triggerRerender);

    const publish = async () => {
        setLoading(true);
        setError(null);
        try {
            await axios.post(
                `${process.env.REACT_APP_BACKEND_BASE_URL}/publish`,
                {
                    "name": name,
                    "groupId": groupId,
                }
            );
            triggerRerender();
        } catch (err: any) {
            setError(err.message || 'An error occurred');
            setLoading(false);
            return;
        }
        setLoading(false);
        handleClose();
        setName("");
    };

    return (
        <React.Fragment>
            <Button variant="contained" onClick={handleOpen} startIcon={<PublishIcon />}>
                Publish
            </Button>
            <Modal
                open={open}
                onClose={handleClose}
                aria-labelledby="modal-modal-title"
                aria-describedby="modal-modal-description"
            >

                <Paper sx={ModalStyle}>
                    <Grid container direction={"column"} spacing={3}>
                        <Grid item>
                            <Typography id="modal-modal-title" variant="h6" component="span">
                                Create publication
                            </Typography>
                        </Grid>
                        <Grid item>
                            <React.Fragment>
                                <InputLabel htmlFor="input1">
                                    Publication Identifier
                                </InputLabel>
                                <StyledInput
                                    sx={{ width: '100%' }}
                                    id="input1"
                                    onChange={(e) => setName(e.target.value)}
                                />
                            </React.Fragment>
                        </Grid>
                        <Grid item>
                            {loading ? (<CircularProgress />) :
                                (<Button onClick={() => publish()} variant="contained">
                                    Publish
                                </Button>)}
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

function TotalTokens() {
    const [loading, setLoading] = React.useState(false);
    const [error, setError] = React.useState<string | null>(null);
    const [tokensTotal, setTokensTotal] = React.useState(0);
    const { groupId } = useParams();

    useEffect(() => {
        const loadTotalTokens = async () => {
            setError(null);
            setLoading(true);
            try {
                const response = await axios.get(
                    `${process.env.REACT_APP_BACKEND_BASE_URL}/group/${groupId}/token/total`
                );
                setTokensTotal(response.data.totalTokens);
                setLoading(false);
                return;
            } catch (err: any) {
                setError(err.message || 'An error occurred');
                setLoading(false);
                return;
            }
        };
        loadTotalTokens();
    }, [groupId]);
    return (<>
        {loading ? (<CircularProgress />) : error ? (<Alert severity="error">{error}</Alert>) : (<Typography>Total tokens: {tokensTotal}</Typography>)}
    </>
    );
}

function PromptCreator() {
    const [open, setOpen] = React.useState(false);
    const handleOpen = () => setOpen(true);
    const handleClose = () => setOpen(false);
    const [name, setName] = React.useState("");
    const [description, setDescription] = React.useState("");
    const [executionType, setExecutionType] = React.useState("none");
    const [outputType, setOutputType] = React.useState("none");
    const [parent, setParent] = React.useState("");
    const [loading, setLoading] = React.useState(false);
    const [error, setError] = React.useState<string | null>(null);
    const triggerRerender = usePromptStore((state: any) => state.triggerRerender);
    const { groupId } = useParams();
    const prompts = usePromptStore((state: any) => state.prompts);

    const savePrompt = async () => {
        setName("");
        setDescription("");
        setOutputType("");
        setExecutionType("");
        setParent("");
        setLoading(true);
        setError(null);
        try {
            await axios.post(
                `${process.env.REACT_APP_BACKEND_BASE_URL}/group/${groupId}/prompts`,
                {
                    "name": name,
                    "description": description,
                    "outputType": outputType,
                    "executionType": executionType,
                    "parentId": parent,
                }
            );
            triggerRerender();
        } catch (err: any) {
            setError(err.message || 'An error occurred');
            setLoading(false);
            return;
        }
        setLoading(false);
        handleClose();
    };

    return (
        <Box>
            <Box display="flex" justifyContent="flex-start" gap={4}>
                <Typography component="span">Group size: {prompts ? prompts.length : 0}</Typography>
                <TotalTokens />
            </Box>
            <Box display="flex" justifyContent="flex-end" gap={4}>
                <Button variant="contained" onClick={handleOpen} startIcon={<AddIcon />}>
                    Create
                </Button>
                <PublishGroup></PublishGroup>
            </Box>
            <Modal
                open={open}
                onClose={handleClose}
                aria-labelledby="modal-modal-title"
                aria-describedby="modal-modal-description"
            >

                <Paper sx={ModalStyle}>
                    <Grid container direction={"column"} spacing={3}>
                        <Grid item>
                            <Typography id="modal-modal-title" variant="h6" component="span">
                                Create new Prompt Template
                            </Typography>
                        </Grid>
                        <Grid item>
                            <React.Fragment>
                                <InputLabel htmlFor="input1">
                                    Name (unique, not editable)
                                </InputLabel>
                                <StyledInput
                                    sx={{ width: '100%' }}
                                    id="input1"
                                    onChange={(e) => setName(e.target.value)}
                                />
                            </React.Fragment>
                        </Grid>
                        <Grid item>
                            <React.Fragment>
                                <InputLabel htmlFor="input2">
                                    Description
                                </InputLabel>
                                <StyledTextField
                                    id="input2"
                                    multiline
                                    rows={3}
                                    sx={{ width: '100%' }}
                                    onChange={(e) => setDescription(e.target.value)}
                                    variant="standard"
                                />
                            </React.Fragment>
                        </Grid>
                        {prompts && prompts.length > 0 ? (
                            <Grid item>
                                <React.Fragment>
                                    <InputLabel htmlFor="input3">
                                        Execution Type
                                        <ExecutionType></ExecutionType>
                                    </InputLabel>
                                    <StyledSelect
                                        labelId="input3l"
                                        id="input3"
                                        sx={{ width: '100%' }}
                                        label="Output Type"
                                        variant="standard"
                                        value={executionType}
                                        onChange={(e) => setExecutionType(e.target.value as string)}
                                    >
                                        <MenuItem key={"1"} value={"none"}>None</MenuItem>
                                        <MenuItem key={"2"} value={"for_each"}>For each Input Item</MenuItem>
                                        <MenuItem key={"3"} value={"object"}>Input Object</MenuItem>
                                    </StyledSelect>
                                </React.Fragment>
                            </Grid>
                        ) : (null)}
                        <Grid item>
                            <React.Fragment>
                                <InputLabel htmlFor="input4">
                                    Output Type
                                    <OutputType></OutputType>
                                </InputLabel>
                                <StyledSelect
                                    labelId="input4l"
                                    id="input4"
                                    sx={{ width: '100%' }}
                                    label="Output Type"
                                    variant="standard"
                                    value={outputType}
                                    onChange={(e) => setOutputType(e.target.value as string)}
                                >
                                    <MenuItem key={"1"} value={"none"}>None</MenuItem>
                                    <MenuItem key={"2"} value={"object"}>Object</MenuItem>
                                    <MenuItem key={"3"} value={"list"}>List</MenuItem>
                                </StyledSelect>
                            </React.Fragment>
                        </Grid>
                        {prompts && prompts.length > 0 ? (
                            <Grid item>
                                <React.Fragment>
                                    <InputLabel htmlFor="input7">
                                        Parent
                                    </InputLabel>
                                    <StyledSelect
                                        labelId="input7l"
                                        id="input7"
                                        sx={{ width: '100%' }}
                                        label="Parent"
                                        variant="standard"
                                        value={parent}
                                        onChange={(e) => setParent(e.target.value as string)}
                                    >
                                        {prompts.map((p: any, i: any) => (<MenuItem key={i} value={p.promptId}>{p.name}</MenuItem>))}
                                    </StyledSelect>
                                </React.Fragment>
                            </Grid>
                        ) : (null)}
                        <Grid item>
                            {loading ? (<CircularProgress />) :
                                (<Button onClick={() => savePrompt()} variant="contained">
                                    Create
                                </Button>)}
                        </Grid>
                        {error ? (<Grid item>
                            <Alert severity="error">{error}</Alert>
                        </Grid>) : null}
                    </Grid>
                </Paper>
            </Modal>
        </Box>
    );
}

export function DeletePromptModalIcon(props: any) {
    const [loading, setLoading] = React.useState(false);
    const [error, setError] = React.useState<string | null>(null);
    const [open, setOpen] = React.useState(false);
    const triggerRerender = usePromptStore((state: any) => state.triggerRerender);

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
                `${process.env.REACT_APP_BACKEND_BASE_URL}/prompts/${props.id}`
            );
        } catch (err: any) {
            setError(err.message || 'An error occurred');
            setLoading(false);
            return;
        }
        setLoading(false);
        setOpen(false);
        setError(null);
        triggerRerender();
    };

    return (
        <React.Fragment>
            {loading ? (<CircularProgress />) : props.button ? (<Button variant="contained" startIcon={<DeleteIcon />} onClick={(e) => {
                setOpen(true);
                e.stopPropagation();
            }}>
                Delete
            </Button>) : (
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
                            <Typography id="modal-modal-title" variant="h6" component="span">
                                Do you want to delete {props.name} prompt with it childs?
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

function Row(props: any) {
    const { row } = props;
    const navigate = useNavigate();

    return (
        <React.Fragment>
            <TableRow>
                <TableCell>
                </TableCell>
                <TableCell component="th" scope="row">
                    {row.name}
                </TableCell>
                <TableCell align="right">{row.description}</TableCell>
                <TableCell align="right">{row.executionType}</TableCell>
                <TableCell align="right">{row.outputType}</TableCell>
                <TableCell align="right">
                    <Stack direction="row" justifyContent="flex-end" alignItems="flex-end" spacing={1}>
                        <PreviewPromptAction id={row.id} />
                        <IconButton aria-label="builder" onClick={() => navigate("/groups/" + row.groupId + "/prompts/" + row.id + "/builder")}>
                            <SettingsIcon />
                        </IconButton>
                        <DeletePromptModalIcon id={row.promptId} />
                    </Stack>
                </TableCell>
            </TableRow>
        </React.Fragment>
    );
}


function GroupTable(props: any) {
    const [page, setPage] = React.useState(0);
    const [rowsPerPage, setRowsPerPage] = React.useState(5);

    const handleChangePage = (event: unknown, newPage: number) => {
        setPage(newPage);
    };

    const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>) => {
        setRowsPerPage(parseInt(event.target.value, 10));
        setPage(0);
    };

    return (
        <React.Fragment>
            <TableContainer >
                <Table aria-label="collapsible table">
                    <TableHead>
                        <TableRow>
                            <TableCell />
                            <TableCell>Name</TableCell>
                            <TableCell align="right">Description</TableCell>
                            <TableCell align="right">Execution Type</TableCell>
                            <TableCell align="right">Output Type</TableCell>
                            <TableCell align="right">Actions</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                    {props.prompts && props.prompts.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={7} align="center">No data</TableCell>
                                </TableRow>
                            ) : null}
                        {props.prompts.map((row: any) => (
                            <Row key={row.id} row={row} />
                        ))}
                    </TableBody>
                </Table>
            </TableContainer>
            <TablePagination
                rowsPerPageOptions={[5, 10, 25]}
                component="div"
                count={props.prompts.length}
                rowsPerPage={rowsPerPage}
                page={page}
                onPageChange={handleChangePage}
                onRowsPerPageChange={handleChangeRowsPerPage}
            />
        </React.Fragment>
    );
}