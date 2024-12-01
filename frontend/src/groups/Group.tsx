import React, { useState, useEffect } from "react";
import axios from "axios";
import Box from '@mui/material/Box';
import Grid from '@mui/material/Grid';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import { Paper, TablePagination } from "@mui/material";
import Button from '@mui/material/Button';
import DeleteIcon from '@mui/icons-material/Delete';
import IconButton from '@mui/material/IconButton';
import AddIcon from '@mui/icons-material/Add';
import InputAdornment from '@mui/material/InputAdornment';
import SearchIcon from '@mui/icons-material/Search';
import TextSnippetIcon from '@mui/icons-material/TextSnippet';
import InputLabel from '@mui/material/InputLabel';
import Typography from '@mui/material/Typography';
import Modal from '@mui/material/Modal';
import Alert from '@mui/material/Alert';
import CircularProgress from '@mui/material/CircularProgress';
import { create } from 'zustand';
import Stack from '@mui/material/Stack';
import { useNavigate } from "react-router-dom";
import { ModalStyle } from "../common/ModalStyle";
import { Item } from "../common/Item";
import { StyledInput } from "../common/StyledInput";

const useGroupsStore = create((set) => ({
    groups: [],
    rerender: 0,
    addGroup: (d: any) => set((state: any) => ({ groups: [d, ...state.groups] })),
    setGroup: (d: any) => set((state: any) => ({ groups: d })),
    triggerRerender: () => set((state: any) => ({ rerender: Math.random() })),
}));

export default function Group() {
    const [search, setSearch] = React.useState("");
    return (
        <Box sx={{ flexGrow: 1, m: 3 }}>
            <Grid container spacing={3} rowSpacing={3} >
                <Grid item xs={12}>
                    <Stack direction="row" spacing={1}>
                        <TextSnippetIcon sx={{ width: 64, height: 64 }} />
                        <Stack spacing={1}>
                            <Typography variant="h5" component="span">
                                Prompt groups
                            </Typography>
                            <Typography variant="body2" component="span">
                                Prompt group is a prompt collection. Group should be threat as a aggregator of connected prompts.
                            </Typography>
                        </Stack>
                    </Stack>
                </Grid>
                <Grid item xs={12}>
                    <Item>
                        <Grid container spacing={3} rowSpacing={3} >
                            <Grid item xs={2}><SearchBar setSearch={setSearch} /></Grid>
                            <Grid item xs={10}>
                                <GroupCreator />
                            </Grid>
                            <Grid item xs={12}>
                                <Paper elevation={3}>
                                    <GroupTable search={search} />
                                </Paper>
                            </Grid>
                        </Grid>
                    </Item>
                </Grid>
            </Grid>
        </Box>
    );
}

function GroupCreator() {
    const [open, setOpen] = React.useState(false);
    const handleOpen = () => setOpen(true);
    const handleClose = () => setOpen(false);
    const [name, setName] = React.useState("");
    const [desc, setDesc] = React.useState("");
    const [loading, setLoading] = React.useState(false);
    const [error, setError] = React.useState<string | null>(null);
    const triggerRerender = useGroupsStore((state: any) => state.triggerRerender);

    const saveGroup = async () => {
        setName("");
        setDesc("");
        setLoading(true);
        setError(null);
        try {
            await axios.post(
                `${process.env.REACT_APP_BACKEND_BASE_URL}/group`,
                {
                    "name": name,
                    "description": desc,
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
        <React.Fragment>
            <Box display="flex" justifyContent="flex-end" gap={4}>
                <Button variant="contained" onClick={handleOpen} startIcon={<AddIcon />}>
                    Create
                </Button>
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
                                Create new group
                            </Typography>
                        </Grid>
                        <Grid item>
                            <React.Fragment>
                                <InputLabel htmlFor="input1">
                                    Group name
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
                                    Description (optional)
                                </InputLabel>
                                <StyledInput
                                    sx={{ width: '100%' }}
                                    id="input2"
                                    onChange={(e) => setDesc(e.target.value)}
                                />
                            </React.Fragment>
                        </Grid>
                        <Grid item>
                            {loading ? (<CircularProgress />) :
                                (<Button onClick={() => saveGroup()} variant="contained">
                                    Create
                                </Button>)}
                        </Grid>
                        {error ? (<Grid item>
                            <Alert severity="error">{error}</Alert>
                        </Grid>) : null}
                    </Grid>
                </Paper>
            </Modal>
        </React.Fragment>
    );
}



function groupData(
    id: string,
    name: string,
    description: string,
    time_creation: string,
) {
    return {
        id, name, description, time_creation
    };
}

function DeleteGroupWithIcon(props: any) {
    const [loading, setLoading] = React.useState(false);
    const [error, setError] = React.useState<string | null>(null);
    const triggerRerender = useGroupsStore((state: any) => state.triggerRerender);
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
                `${process.env.REACT_APP_BACKEND_BASE_URL}/group/${props.id}`
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
                            <Typography id="modal-modal-title" variant="h6" component="span">
                                Do you want delete {props.name} group?
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

function Row(props: { row: ReturnType<typeof groupData> }) {
    const { row } = props;
    const navigate = useNavigate();

    return (
        <React.Fragment>
            <TableRow hover sx={{ cursor: 'pointer' }} onClick={() => navigate(`/groups/${row.id}`)}>
                <TableCell>
                </TableCell>
                <TableCell component="th" scope="row">
                    {row.name}
                </TableCell>
                <TableCell align="right">{row.description}</TableCell>
                <TableCell align="right">{row.time_creation}</TableCell>
                <TableCell align="right">
                    <DeleteGroupWithIcon id={row.id} name={row.name} />
                </TableCell>
            </TableRow>
        </React.Fragment>
    );
}

function SearchBar(props: any) {
    const { setSearch } = props;
    return (
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
    );
}

function GroupTable(props: any) {
    const { search } = props;
    const [page, setPage] = React.useState(0);
    const [count, setCount] = React.useState(0);
    const [rowsPerPage, setRowsPerPage] = React.useState(5);
    const [loading, setLoading] = useState(false);
    const setGroups = useGroupsStore((state: any) => state.setGroup);
    const groups = useGroupsStore((state: any) => state.groups);
    const rerender = useGroupsStore((state: any) => state.rerender);
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
                    `${process.env.REACT_APP_BACKEND_BASE_URL}/group?limit=${rowsPerPage}&page=${page + 1}&name=${search}`
                );
                setGroups(response.data.data);
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
    }, [page, rowsPerPage, search, rerender, setGroups]);

    return (
        <React.Fragment>
            <TableContainer >
                {loading ? (<CircularProgress />) : (
                    <Table aria-label="collapsible table">
                        <TableHead>
                            <TableRow>
                                <TableCell />
                                <TableCell>Name</TableCell>
                                <TableCell align="right">Desc.</TableCell>
                                <TableCell align="right">Creation Date</TableCell>
                                <TableCell align="right">Actions</TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                        {groups && groups.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={6} align="center">No data</TableCell>
                                </TableRow>
                            ) : null}
                            {groups.map((row: any) => (
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

