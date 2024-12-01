import React, { useEffect } from "react";
import Box from '@mui/material/Box';
import Grid from '@mui/material/Grid';
import { CircularProgress, IconButton, Paper, styled, TextField } from "@mui/material";
import Button from '@mui/material/Button';
import Modal from '@mui/material/Modal';
import Alert from '@mui/material/Alert';
import Typography from '@mui/material/Typography';
import axios from "axios";
import VisibilityIcon from '@mui/icons-material/Visibility';
import { ModalStyle } from "../common/ModalStyle";

const StyledTextField = styled(TextField)(({ theme }) => ({
    backgroundColor: theme.palette.background.default,
}));

export function PreviewPromptAction(props: any) {
    const [error, setError] = React.useState<string | null>(null);
    const [open, setOpen] = React.useState(false);
    const [loading, setLoading] = React.useState(false);
    const [prompts, setPrompts] = React.useState<any>(null);
    const handleClose = (e: any) => {
        setOpen(false);
        setError(null);
        e.stopPropagation();
    };


    useEffect(() => {
        const getPromptTemplate = async () => {
            setLoading(true);
            setError(null);
            try {
                const resp = await axios.get(
                    `${process.env.REACT_APP_BACKEND_BASE_URL}/prompts/${props.id}/template`
                );
                setPrompts(resp.data);
            } catch (err: any) {
                setError(err.message || 'An error occurred');
                setLoading(false);
                return;
            }
            setLoading(false);
        };
        if (open) {
            getPromptTemplate();
        }

    }, [props.id, open]);

    return (
        <React.Fragment>
            {props.button ?
                (<Button variant="contained" startIcon={<VisibilityIcon />} onClick={(e) => {
                    setOpen(true);
                    e.stopPropagation();
                }}>
                    Preview
                </Button>) : (<IconButton aria-label="info" onClick={(e) => {
                    setOpen(true);
                    e.stopPropagation();
                }}>
                    <VisibilityIcon />
                </IconButton>)}
            <Modal
                open={open}
                onClose={(e) => handleClose(e)}
                aria-labelledby="modal-modal-title"
                aria-describedby="modal-modal-description"
            >
                <Paper sx={ModalStyle}>
                    <Grid container direction={"column"} spacing={1} justifyContent="flex-end">
                        <Grid item>
                            <StyledTextField
                                id="input2"
                                multiline
                                rows={16}
                                sx={{ width: '100%' }}
                                variant="standard"
                                value={prompts ? prompts.prompt : "Prompt"}
                            />
                        </Grid>
                        <Grid item xs={6}>
                            <Typography variant="subtitle1">
                                Prompt metadata
                            </Typography>
                            <Grid item xs={12} mt={1}>
                                Token sum: {prompts ? prompts.tokenCount : 0}
                            </Grid>
                            <Grid item xs={12} mt={1}>
                                Bytes: {prompts ? prompts.bytesCount : 0}
                            </Grid>
                            <Grid item xs={12} mt={1}>
                                Characters: {prompts ? prompts.characterCount : 0}
                            </Grid>
                        </Grid>
                        <Grid item>
                            <Box display="flex" gap={4}>
                                <Button onClick={(e) => handleClose(e)} variant="outlined" >
                                    Close
                                </Button>
                            </Box>
                        </Grid>
                        {loading ? <CircularProgress></CircularProgress> : error ? (<Grid item>
                            <Alert severity="error">{error}</Alert>
                        </Grid>) : null}
                    </Grid>
                </Paper>
            </Modal>
        </React.Fragment>
    )
}