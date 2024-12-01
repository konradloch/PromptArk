
import React, { useEffect } from "react";
import { styled } from '@mui/material/styles';
import Box from '@mui/material/Box';
import Grid from '@mui/material/Grid';
import { FormControlLabel, Paper, Switch } from "@mui/material";
import Timeline from '@mui/lab/Timeline';
import TimelineItem from '@mui/lab/TimelineItem';
import TimelineSeparator from '@mui/lab/TimelineSeparator';
import TimelineConnector from '@mui/lab/TimelineConnector';
import TimelineDot from '@mui/lab/TimelineDot';
import TimelineOppositeContent from '@mui/lab/TimelineOppositeContent';
import TextField from '@mui/material/TextField';
import Slider from '@mui/material/Slider';
import Stack from '@mui/material/Stack';
import Button from '@mui/material/Button';
import Autocomplete from '@mui/material/Autocomplete';
import AddIcon from '@mui/icons-material/Add';
import DeleteIcon from '@mui/icons-material/Delete';
import Input from '@mui/material/Input';
import InputLabel from '@mui/material/InputLabel';
import Alert from '@mui/material/Alert';
import Typography from '@mui/material/Typography';
import CircularProgress from '@mui/material/CircularProgress';
import PublishIcon from '@mui/icons-material/Publish';
import { create } from 'zustand';
import axios from "axios";
import { useNavigate } from "react-router-dom";
import ThermostatIcon from '@mui/icons-material/Thermostat';
import NumbersIcon from '@mui/icons-material/Numbers';
import Chip from '@mui/material/Chip';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import IconButton from "@mui/material/IconButton";
import OutputExampleTooltip from "../tooltips/OutputExample";
import Accordion from '@mui/material/Accordion';
import AccordionSummary from '@mui/material/AccordionSummary';
import AccordionDetails from '@mui/material/AccordionDetails';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import { usePromptStore } from "../groups/GroupDetails";
import { PreviewPromptAction } from "./PromptPreview";
import { CodeiumEditor, Language, Document } from "@codeium/react-code-editor";
import SystemRolePrompt from "../tooltips/SystemRolePrompt";
import OutputPrompt from "../tooltips/OutputPrompt";
import TopP from "../tooltips/TopP";
import Temperature from "../tooltips/Temperature";
import CustomParams from "../tooltips/CustomParams";
import Parameters from "../tooltips/Parameters";
import HistoryLog from "../tooltips/HistoryLog";
import Prompt from "../tooltips/Prompt";
import ExecutionType from "../tooltips/ExecutionType";
import OutputType from "../tooltips/OutputType";
import { Item } from "../common/Item";
import Editor from '@monaco-editor/react';

const StyledTextField = styled(TextField)(({ theme }) => ({
    backgroundColor: theme.palette.background.default,
}));

const StyledInput = styled(Input)(({ theme }) => ({
    backgroundColor: theme.palette.background.default,
}));

export const usePromptActiveStore = create((set) => ({
    activePrompt: null,
    rerender: 0,
    setActivePrompt: (d: any) => set((state: any) => ({ activePrompt: d })),
    triggerRerender: () => set((state: any) => ({ rerender: Math.random() })),
}));

export function PromptEditor(props: any) {
    return (
        <Grid container spacing={3} rowSpacing={3}>
            <Grid item xs={3}>
                <Item>
                    <HistoryList id={props.id} />
                </Item>
            </Grid>
            <Grid item xs={9}>
                <Item>
                    <PromptUpdatePanel id={props.id} />
                </Item>
            </Grid>
        </Grid>
    )
}

function PromptUpdatePanel(props: any) {
    const [name, setName] = React.useState("");
    const [system, setSystem] = React.useState("");
    const [prompt, setPrompt] = React.useState("");
    const [output, setOutput] = React.useState("");
    const [description, setDescription] = React.useState("");
    const [executionType, setExecutionType] = React.useState("none");
    const [outputType, setOutputType] = React.useState("");
    const [params, setParams] = React.useState([]);
    const [temp, setTemp] = React.useState(0);
    const [topp, setTopp] = React.useState(0);
    const [customParams, setCustomParams] = React.useState(new Map<string, string>());
    const [customParamKey, setCustomParamKey] = React.useState("");
    const [customParamValue, setCustomParamValue] = React.useState("");
    const [outputExample, setOutputExample] = React.useState("");
    const [outputExamples, setOutputExamples] = React.useState<string[]>([]);
    const [loading, setLoading] = React.useState(false);
    const [error, setError] = React.useState<string | null>(null);
    const triggerActivePromptRerender = usePromptActiveStore((state: any) => state.triggerRerender);
    const activePromptRerender = usePromptActiveStore((state: any) => state.rerender);
    const [useCodiumEditor, setUseCodiumEditor] = React.useState(false);
    const setActivePrompt = usePromptActiveStore((state: any) => state.setActivePrompt)
    const activePrompt = usePromptActiveStore((state: any) => state.activePrompt)

    const triggerRerender = usePromptStore((state: any) => state.triggerRerender);
    const navigate = useNavigate();

    const updatePrompt = async () => {
        setActivePrompt(null);
        setLoading(true);
        setError(null);
        if (activePrompt) {
            try {
                const response = await axios.post(
                    `${process.env.REACT_APP_BACKEND_BASE_URL}/group/${activePrompt.groupId}/prompts/${activePrompt.promptId}`,
                    {
                        "name": name,
                        "description": description,
                        "executionType": executionType,
                        "outputType": outputType,
                        "system": system,
                        "prompt": prompt,
                        "outputPrompt": output,
                        "params": params,
                        "temperature": temp,
                        "p": topp,
                        "parentId": activePrompt.parentId,
                        "outputExamples": outputExamples,
                        "customParams": Object.fromEntries(Array.from(customParams.entries())),
                    }
                );
                setActivePrompt(response.data);
                navigate('/groups/' + response.data.groupId + '/prompts/' + response.data.id + '/builder');
            } catch (err: any) {
                setError(err.message || 'An error occurred');
                setLoading(false);
                return;
            }
        } else {
            setError("Prompt Object is NULL")
        }
        setLoading(false);
    };

    const activatePrompt = async () => {
        setLoading(true);
        setError(null);
        if (activePrompt) {
            try {
                await axios.patch(
                    `${process.env.REACT_APP_BACKEND_BASE_URL}/prompts/${props.id}/activate`
                );
                triggerActivePromptRerender();
                triggerRerender();
            } catch (err: any) {
                setError(err.message || 'An error occurred');
                setLoading(false);
                return;
            }
        } else {
            setError("Prompt Object is NULL")
        }
        setLoading(false);
    };

    const addCustomParamToMap = () => {
        if (customParamKey === "" || customParamValue === "") {
            return;
        }
        setCustomParams(new Map(customParams.set(customParamKey, customParamValue)));
        setCustomParamKey("");
        setCustomParamValue("");
    }

    const addOutputExampleToList = () => {
        if (outputExample === "") {
            return;
        }
        setOutputExamples([...outputExamples, outputExample]);
        setOutputExample("");
    }

    useEffect(() => {
        const loadPrompt = async () => {
            setError(null);
            setLoading(true);
            try {
                const response = await axios.get(
                    `${process.env.REACT_APP_BACKEND_BASE_URL}/prompts/${props.id}`
                );
                setActivePrompt(response.data);
                setName(response.data.name)
                setSystem(response.data.system);
                setDescription(response.data.description);
                setOutputType(response.data.outputType);
                setExecutionType(response.data.executionType);
                setPrompt(response.data.prompt);
                setOutput(response.data.outputPrompt);
                setParams(response.data.params ? response.data.params : []);
                setTemp(response.data.temperature);
                setTopp(response.data.p);
                setLoading(false);
                setCustomParams(new Map(Object.entries(response.data.customParams || {})));
                setOutputExamples(response.data.outputExamples || []);
                return;
            } catch (err: any) {
                setError(err.message || 'An error occurred');
                setLoading(false);
                return;
            }
        };
        if (props.id != null) {
            loadPrompt();
        }
    }, [props.id, setActivePrompt, activePromptRerender]);

    return (
        <Box>
            {activePrompt ? (
                <Grid container>
                    <Grid item xs={12}>
                        <Box display="flex" justifyContent="flex-end" gap={4}>
                            <Button disabled={activePrompt ? false : true} variant="contained" startIcon={<AddIcon />} onClick={() => updatePrompt()}>
                                Save
                            </Button>
                            <Button disabled={activePrompt ? activePrompt?.activated : true} variant="contained" startIcon={<PublishIcon />} onClick={() => activatePrompt()}>
                                Activate
                            </Button>
                            <PreviewPromptAction id={props.id} button={true} />
                            <FormControlLabel
                                sx={{ display: 'block' }}
                                control={
                                    <Switch
                                        checked={useCodiumEditor}
                                        onChange={() => setUseCodiumEditor(!useCodiumEditor)}
                                        name="useCodiumEditor"
                                        color="primary"
                                    />
                                }
                                label="Use codium editor"
                            />
                        </Box>
                    </Grid>
                    <Grid item xs={12}>
                        <Box display="flex" justifyContent="flex-start" gap={4}>
                            {loading ? <CircularProgress /> : (null)}
                            {error ? <Alert severity="error">{error}</Alert> : (null)}
                        </Box>
                    </Grid>
                    <Grid item xs={12} mt={1}>
                        <PromptInputMetadataViewer />
                    </Grid>
                    <Grid item xs={12} mt={1}>
                        <PromptMetadataViewer />
                    </Grid>
                    <Grid item xs={12} paddingTop={3}>
                        <Paper elevation={3}>
                            <Box display="flex" justifyContent="flex-start" padding={2}>
                                <Grid container spacing={4} rowSpacing={4}>
                                    <Grid item xs={12}>
                                        <React.Fragment>
                                            <InputLabel htmlFor="input1">
                                                Name
                                            </InputLabel>
                                            <StyledInput
                                                disabled={true}
                                                id="input1"
                                                sx={{ width: '100%' }}
                                                value={name}
                                                onChange={(e) => setName(e.target.value)}
                                            />
                                        </React.Fragment>
                                    </Grid>
                                    <Grid item xs={12}>
                                        <React.Fragment>
                                            <InputLabel htmlFor="input2">
                                                System Role Prompt
                                                <SystemRolePrompt></SystemRolePrompt>
                                            </InputLabel>
                                            {useCodiumEditor ?
                                                (<CodeiumEditor language="plaintext" theme="hc-black" height={"100px"} onChange={(e) => setSystem(e || "")} value={system} options={{
                                                    minimap: {
                                                        enabled: false
                                                    }
                                                }} />) : (
                                                    <Editor language="plaintext" theme="hc-black" height={"100px"} onChange={(e) => setSystem(e || "")} value={system} options={{
                                                        minimap: {
                                                            enabled: false
                                                        }
                                                    }} />
                                                )}
                                        </React.Fragment>
                                    </Grid>
                                    <Grid item xs={12}>
                                        <React.Fragment>
                                            <InputLabel htmlFor="input3">
                                                Prompt
                                                <Prompt></Prompt>
                                            </InputLabel>

                                            {useCodiumEditor ? (<CodeiumEditor language="plaintext" theme="hc-black" height={"150px"} onChange={(e) => setPrompt(e || "")} value={prompt} />) : (
                                                <Editor language="plaintext" theme="hc-black" height={"150px"} onChange={(e) => setPrompt(e || "")} value={prompt} options={{
                                                    minimap: {
                                                        enabled: false
                                                    }
                                                }} />
                                            )}

                                        </React.Fragment>
                                    </Grid>
                                    <Grid item xs={12}>
                                        <React.Fragment>
                                            <InputLabel htmlFor="input55">
                                                Parameters
                                                <Parameters></Parameters>
                                            </InputLabel>
                                            <Autocomplete
                                                id="input55"
                                                clearIcon={false}
                                                options={[]}
                                                freeSolo
                                                multiple
                                                renderTags={(value: any, props: any) =>
                                                    value.map((option: any, index: any) => (
                                                        <Chip label={option} {...props({ index })} />
                                                    ))
                                                }
                                                onChange={(event, newValue: any) => {
                                                    setParams(newValue);

                                                }}
                                                value={params}
                                                renderInput={(params: any) => <StyledTextField variant="standard" {...params} />}
                                            />
                                        </React.Fragment>
                                    </Grid>

                                    <Grid item xs={12}>
                                        <React.Fragment>
                                            <InputLabel>
                                                Output Prompt
                                                <OutputPrompt></OutputPrompt>
                                            </InputLabel>
                                            {useCodiumEditor ? (<CodeiumEditor language="json" theme="hc-black" height={"150px"} otherDocuments={[
                                                new Document({
                                                    text: prompt,
                                                    editorLanguage: "json",
                                                    language: Language.JSON,
                                                }),
                                            ]}
                                                value={output}
                                                onChange={(e) => setOutput(e || "")} />) : (
                                                <Editor language="json" theme="hc-black" height={"150px"}
                                                    value={output}
                                                    onChange={(e) => setOutput(e || "")}
                                                    options={{
                                                        minimap: {
                                                            enabled: false
                                                        }
                                                    }} />
                                            )}
                                        </React.Fragment>
                                    </Grid>
                                    <Grid item xs={12}>
                                        <Grid container spacing={1}>
                                            <Grid item xs={10}>
                                                <React.Fragment>
                                                    <InputLabel htmlFor="input6-key">
                                                        Output Example (optional)
                                                        <OutputExampleTooltip></OutputExampleTooltip>
                                                    </InputLabel>
                                                    {useCodiumEditor ? (<CodeiumEditor language="json" theme="hc-black" height={"120px"} onChange={(e) => setOutputExample(e || "")} value={outputExample} />) :

                                                        (<Editor language="json" theme="hc-black" height={"120px"} onChange={(e) => setOutputExample(e || "")} value={outputExample} options={{
                                                            minimap: {
                                                                enabled: false
                                                            }
                                                        }} />)
                                                    }
                                                </React.Fragment>
                                            </Grid>
                                            <Grid item xs={2} mt={4}>
                                                <Button variant="contained" startIcon={<AddIcon />} onClick={() => addOutputExampleToList()}>
                                                Add
                                                </Button>
                                            </Grid>
                                        </Grid>
                                        <Grid item xs={12} mt={2}>
                                            {outputExamples && outputExamples.length > 0 ? (<Grid container>
                                                <Grid item xs={12} sx={{ width: '100%', overflow: 'hidden' }}>
                                                    <Typography>Output examples:</Typography>
                                                </Grid>
                                                <TableContainer component={Paper} sx={{ maxHeight: 300 }}>
                                                    <Table aria-label="simple table">
                                                        <TableHead>
                                                            <TableRow>
                                                                <TableCell >Output example</TableCell>
                                                                <TableCell align="right">Action</TableCell>
                                                            </TableRow>
                                                        </TableHead>
                                                        <TableBody>
                                                            {outputExamples.map((val) => (
                                                                <TableRow
                                                                    key={val}
                                                                    sx={{ '&:last-child td, &:last-child th': { border: 0 } }}
                                                                >
                                                                    <TableCell>{val}</TableCell>
                                                                    <TableCell align="right">
                                                                        <IconButton onClick={(e: any) => {
                                                                            setOutputExamples(outputExamples.filter((item) => item !== val));
                                                                        }} aria-label="delete">
                                                                            <DeleteIcon />
                                                                        </IconButton>
                                                                    </TableCell>
                                                                </TableRow>
                                                            ))}
                                                        </TableBody>
                                                    </Table>
                                                </TableContainer>
                                            </Grid>) : (null)}
                                        </Grid>
                                    </Grid>
                                    <Grid item xs={6}>
                                        <InputSlider name={"Top P"} icon={'topp'} value={topp} setValue={setTopp} hint={<TopP></TopP>}></InputSlider>
                                    </Grid>
                                    <Grid item xs={6}>
                                        <InputSlider name={"Temperature"} icon={'temperature'} value={temp} setValue={setTemp} hint={<Temperature></Temperature>}></InputSlider>
                                    </Grid>
                                    <Grid item xs={12}>
                                        <Grid container spacing={1}>
                                            <Grid item xs={5}>
                                                <React.Fragment>
                                                    <InputLabel htmlFor="input6-key">
                                                        Custom Param Key
                                                    </InputLabel>
                                                    <StyledTextField
                                                        id="input6-key"
                                                        multiline
                                                        rows={2}
                                                        sx={{ width: '100%' }}
                                                        value={customParamKey}
                                                        onChange={(e) => setCustomParamKey(e.target.value)}
                                                        variant="standard"
                                                    />
                                                </React.Fragment>
                                            </Grid>
                                            <Grid item xs={5}>
                                                <React.Fragment>
                                                    <InputLabel htmlFor="input6-value">
                                                        Custom Param Value
                                                    </InputLabel>
                                                    <StyledTextField
                                                        id="input6-value"
                                                        multiline
                                                        rows={2}
                                                        sx={{ width: '100%' }}
                                                        value={customParamValue}
                                                        onChange={(e) => setCustomParamValue(e.target.value)}
                                                        variant="standard"
                                                    />
                                                </React.Fragment>
                                            </Grid>
                                            <Grid item xs={2} mt={4}>
                                                <Button variant="contained" startIcon={<AddIcon />} onClick={() => addCustomParamToMap()}>
                                                Add
                                                </Button>
                                            </Grid>
                                        </Grid>

                                    </Grid>
                                    <Grid item xs={12}>
                                        {customParams && customParams.size > 0 ? (<Grid container>
                                            <Grid item xs={12} sx={{ width: '100%', overflow: 'hidden' }}>
                                                <Typography>Custom Params
                                                    <CustomParams></CustomParams>
                                                </Typography>
                                            </Grid>
                                            <TableContainer component={Paper} sx={{ maxHeight: 300 }}>
                                                <Table aria-label="simple table">
                                                    <TableHead>
                                                        <TableRow>
                                                            <TableCell >Key</TableCell>
                                                            <TableCell align="right">Value</TableCell>
                                                            <TableCell align="right">Action</TableCell>
                                                        </TableRow>
                                                    </TableHead>
                                                    <TableBody>
                                                        {Array.from(customParams.keys()).map((key) => (
                                                            <TableRow
                                                                key={key}
                                                                sx={{ '&:last-child td, &:last-child th': { border: 0 } }}
                                                            >
                                                                <TableCell  >
                                                                    {key}
                                                                </TableCell>
                                                                <TableCell align="right">{customParams.get(key)}</TableCell>
                                                                <TableCell align="right">
                                                                    <IconButton onClick={(e: any) => {
                                                                        customParams.delete(key);
                                                                        setCustomParams(new Map(customParams));
                                                                    }} aria-label="delete">
                                                                        <DeleteIcon />
                                                                    </IconButton>
                                                                </TableCell>
                                                            </TableRow>
                                                        ))}
                                                    </TableBody>
                                                </Table>
                                            </TableContainer>
                                        </Grid>) : (null)}
                                    </Grid>
                                </Grid>
                            </Box>
                        </Paper>
                    </Grid>
                </Grid>) : (
                <Grid item xs={12}>
                    <Typography>Prompt is not selected</Typography>
                    <Box display="flex" justifyContent="flex-start" gap={4}>
                        {loading ? <CircularProgress /> : (null)}
                        {error ? <Alert severity="error">{error}</Alert> : (null)}
                    </Box>
                </Grid>
            )}
        </Box>
    );
}

function HistoryList(props: any) {
    const [loading, setLoading] = React.useState(false);
    const [error, setError] = React.useState<string | null>(null);
    const [promptObjects, setPromptObjects] = React.useState([]);
    const [publishedPrompts, setPublishedPrompts] = React.useState([]);
    const activePrompt = usePromptActiveStore((state: any) => state.activePrompt);
    const activePromptRerender = usePromptActiveStore((state: any) => state.rerender);

    useEffect(() => {
        const loadPromptsHistory = async () => {
            setError(null);
            setLoading(true);
            try {
                const response = await axios.get(
                    `${process.env.REACT_APP_BACKEND_BASE_URL}/group/${activePrompt.groupId}/prompts/${activePrompt.promptId}`
                );
                setPromptObjects(response.data)
                setLoading(false);
                return;
            } catch (err: any) {
                setError(err.message || 'An error occurred');
                setLoading(false);
                return;
            }
        };
        const loadPubishedPrompts = async () => {
            setError(null);
            setLoading(true);
            try {
                const response = await axios.get(
                    `${process.env.REACT_APP_BACKEND_BASE_URL}/publications/prompt/${activePrompt.promptId}`
                );
                setPublishedPrompts(response.data)
                setLoading(false);
                return;
            } catch (err: any) {
                setError(err.message || 'An error occurred');
                setLoading(false);
                return;
            }
        };
        if (activePrompt != null) {
            loadPromptsHistory();
            loadPubishedPrompts();
        }
    }, [activePrompt, activePromptRerender]);

    const navigate = useNavigate();

    return (
        <div style={{ maxHeight: '55vh', overflow: 'auto' }}>
            <Box display="flex" justifyContent="flex-start" gap={4}>
                {loading ? <CircularProgress /> : (null)}
                {error ? <Alert severity="error">{error}</Alert> : (null)}
                {(!promptObjects || promptObjects.length === 0) && !loading ? <Alert severity="error">{"No data"}</Alert> : (null)}
            </Box>
            <Typography>History Log
                <HistoryLog></HistoryLog>
            </Typography>
            <Timeline>
                {promptObjects.map((po: any, i: any) => (
                    <TimelineItem key={i} sx={props.id === po.id ? ({
                        backgroundColor: '#121212',
                    }) : ({
                        cursor: 'pointer', '&:hover': {
                            backgroundColor: '#121212',
                        },
                    })}
                        onClick={() => navigate('/groups/' + po.groupId + '/prompts/' + po.id + '/builder')}
                    >
                        {po.activated ? (<TimelineOppositeContent color="text.primary">
                            <Stack spacing={1} >
                                <Typography>{new Date(po.createdAt).toUTCString()}</Typography>
                                <Stack direction="row" spacing={1} justifyContent="flex-end" alignItems="flex-end"    useFlexGap
  sx={{ flexWrap: 'wrap' }}  >
                                    {publishedPrompts.filter((pp: any) => pp.promptVersionId === po.id).map((pp: any, i: any) => (<Box key={i}><Chip label={pp.publishIdentifier} /></Box>))}
                                </Stack>
                            </Stack>
                        </TimelineOppositeContent>) : (<TimelineOppositeContent color="text.secondary">
                            <Stack spacing={1}  >
                                <Typography>{new Date(po.createdAt).toUTCString()}</Typography>
                                <Stack direction="row" spacing={1} justifyContent="flex-end" alignItems="flex-end"    useFlexGap
  sx={{ flexWrap: 'wrap' }}>
                                    {publishedPrompts.filter((pp: any) => pp.promptVersionId === po.id).map((pp: any, i: any) => (<Box key={i}><Chip label={pp.publishIdentifier} /></Box>))}
                                </Stack>
                            </Stack>
                        </TimelineOppositeContent>)}
                        <TimelineSeparator>
                            {po.activated ? (<TimelineDot color="success" />) : (<TimelineDot />)}
                            <TimelineConnector />
                        </TimelineSeparator>
                    </TimelineItem>
                ))}
            </Timeline>
        </div>
    );
}

function InputSlider(props: any) {
    const { name, icon, value, setValue } = props;

    const handleSliderChange = (event: Event, newValue: number | number[]) => {
        setValue(newValue as number);
    };

    const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        setValue(event.target.value === '' ? 0 : Number(event.target.value));
    };

    const handleBlur = () => {
        if (value < 0) {
            setValue(0);
        } else if (value > 100) {
            setValue(100);
        }
    };

    return (
        <Box sx={{ width: 250 }}>
            <Typography id="input-slider" gutterBottom>
                {name}
                {props.hint}
            </Typography>
            <Grid container spacing={2} alignItems="center">
                <Grid item>
                    {icon === 'temperature' ? <ThermostatIcon /> : <NumbersIcon />}
                </Grid>
                <Grid item xs>
                    <Slider
                        value={typeof value === 'number' ? value : 0}
                        onChange={handleSliderChange}
                        aria-labelledby="input-slider"
                    />
                </Grid>
                <Grid item>
                    <Input
                        value={value}
                        size="small"
                        onChange={handleInputChange}
                        onBlur={handleBlur}
                        inputProps={{
                            step: 10,
                            min: 0,
                            max: 100,
                            type: 'number',
                            'aria-labelledby': 'input-slider',
                        }}
                    />
                </Grid>
            </Grid>
        </Box>
    );
}

function PromptMetadataViewer() {
    const activePrompt = usePromptActiveStore((state: any) => state.activePrompt);
    return (
        <React.Fragment>
            <Accordion>
                <AccordionSummary
                    expandIcon={<ExpandMoreIcon />}
                    aria-controls="panel1-content"
                    id="panel1-header"
                >
                    Prompt info
                </AccordionSummary>
                <AccordionDetails>
                    <Grid item xs={6}>
                        <React.Fragment>
                            <InputLabel htmlFor="input11">
                                Description
                            </InputLabel>
                            <StyledTextField
                                id="input11"
                                multiline
                                rows={2}
                                sx={{ width: '100%' }}
                                value={activePrompt ? activePrompt.description : "No description"}
                                variant="standard"
                            />
                        </React.Fragment>
                    </Grid>
                    <Grid item xs={6}>
                        <React.Fragment>
                            <InputLabel htmlFor="input2">
                                Execution type
                                <ExecutionType></ExecutionType>
                            </InputLabel>
                            <StyledTextField
                                id="input2"
                                multiline
                                rows={2}
                                sx={{ width: '100%' }}
                                value={activePrompt ? activePrompt.executionType : "none"}
                                variant="standard"
                            />
                        </React.Fragment>
                    </Grid>
                    <Grid item xs={6}>
                        <React.Fragment>
                            <InputLabel htmlFor="input3">
                                Output type
                                <OutputType></OutputType>
                            </InputLabel>
                            <StyledTextField
                                id="input3"
                                multiline
                                rows={2}
                                sx={{ width: '100%' }}
                                value={activePrompt ? activePrompt.outputType : "none"}
                                variant="standard"
                            />
                        </React.Fragment>
                    </Grid>
                </AccordionDetails>
            </Accordion>
        </React.Fragment>
    );
}

function PromptInputMetadataViewer() {
    const activePrompt = usePromptActiveStore((state: any) => state.activePrompt);
    const [error, setError] = React.useState<string | null>(null);
    const [loading, setLoading] = React.useState(false);
    const [prompts, setPrompts] = React.useState<any>(null);

    useEffect(() => {
        const getPromptActive = async () => {
            setLoading(true);
            setError(null);
            try {
                const resp = await axios.get(
                    `${process.env.REACT_APP_BACKEND_BASE_URL}/prompts/${activePrompt.parentId}/active`
                );
                setPrompts(resp.data);
            } catch (err: any) {
                setError(err.message || 'An error occurred');
                setLoading(false);
                return;
            }
            setLoading(false);
        };

        if (activePrompt && activePrompt.parentId) {
            getPromptActive();
        }

    }, [activePrompt]);

    return (
        <React.Fragment>
            {activePrompt.parentId && !error ?
                (<Accordion>
                    <AccordionSummary
                        expandIcon={<ExpandMoreIcon />}
                        aria-controls="panel1-content"
                        id="panel1-header"
                    >
                        Input data / Parent Prompt
                    </AccordionSummary>
                    <AccordionDetails>
                        <Grid item xs={6}>
                            <React.Fragment>
                                <InputLabel htmlFor="input8">
                                    Name
                                </InputLabel>
                                <StyledTextField
                                    id="input8"
                                    multiline
                                    rows={2}
                                    sx={{ width: '100%' }}
                                    value={prompts ? prompts.name : "No dName"}
                                    variant="standard"
                                />
                            </React.Fragment>
                        </Grid>
                        <Grid item xs={6}>
                            <React.Fragment>
                                <InputLabel htmlFor="input5">
                                    Description
                                </InputLabel>
                                <StyledTextField
                                    id="input5"
                                    multiline
                                    rows={2}
                                    sx={{ width: '100%' }}
                                    value={prompts ? prompts.description : "No description"}
                                    variant="standard"
                                />
                            </React.Fragment>
                        </Grid>
                        <Grid item xs={6}>
                            <React.Fragment>
                                <InputLabel htmlFor="input6">
                                    Execution type
                                    <ExecutionType></ExecutionType>
                                </InputLabel>
                                <StyledTextField
                                    id="input6"
                                    multiline
                                    rows={2}
                                    sx={{ width: '100%' }}
                                    value={prompts ? prompts.executionType : "none"}
                                    variant="standard"
                                />
                            </React.Fragment>
                        </Grid>
                        <Grid item xs={6}>
                            <React.Fragment>
                                <InputLabel htmlFor="input7">
                                    Output type
                                    <OutputType></OutputType>
                                </InputLabel>
                                <StyledTextField
                                    id="input7"
                                    multiline
                                    rows={2}
                                    sx={{ width: '100%' }}
                                    value={prompts ? prompts.outputType : "none"}
                                    variant="standard"
                                />
                            </React.Fragment>
                        </Grid>
                    </AccordionDetails>
                </Accordion>) : (null)}
        </React.Fragment>
    );
}