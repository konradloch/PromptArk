import type { NodeProps } from "reactflow";
import Typography from '@mui/material/Typography';
import React from "react";
import { Handle, Position } from "reactflow";
import Box from '@mui/material/Box';
import Grid from '@mui/material/Grid';
import Button from '@mui/material/Button';
import { Link } from "react-router-dom";
import { PreviewPromptAction } from "./PromptPreview";
import { DeletePromptModalIcon } from "../groups/GroupDetails";
import SettingsIcon from '@mui/icons-material/Settings';

function Text(props: any) {
    const { text } = props;
    return (
        <Box
            component="div"
            sx={{
                whiteSpace: 'normal',
                my: 2,
                p: 1,
                bgcolor: (theme) =>
                    theme.palette.mode === 'dark' ? '#101010' : 'grey.100',
                color: (theme) =>
                    theme.palette.mode === 'dark' ? 'grey.300' : 'grey.800',
                border: '1px solid',
                borderColor: (theme) =>
                    theme.palette.mode === 'dark' ? 'grey.800' : 'grey.300',
                borderRadius: 2,
                fontSize: '0.875rem',
                fontWeight: '700',
            }}
        >
            {text}
        </Box>
    )
}

export function PromptFlowNode({ data }: NodeProps<any>) {
    return (
        <Box className="react-flow__node-default">
            <React.Fragment>
                <Box sx={{ flexGrow: 1, m: 2 }}>
                    <Grid container spacing={1} rowSpacing={1} maxWidth={"sm"}>
                        <Grid item xs={12}>
                            <Typography sx={{ fontSize: 18 }} color="text.secondary" gutterBottom>
                                Name
                            </Typography>
                            <Text text={data.name}></Text>
                        </Grid>
                        <Grid item xs={12}>
                            <Typography sx={{ fontSize: 18 }} color="text.secondary" gutterBottom>
                                Description
                            </Typography>
                            <Text text={data.description}></Text>
                        </Grid>
                        <Grid item xs={6}>
                            <Typography sx={{ fontSize: 18 }} color="text.secondary" gutterBottom>
                                Execute Type
                            </Typography>
                            <Text text={data.executionType}></Text>
                        </Grid>
                        <Grid item xs={6}>
                            <Typography sx={{ fontSize: 18 }} color="text.secondary" gutterBottom>
                                Output Type
                            </Typography>
                            <Text text={data.outputType}></Text>
                        </Grid>
                        <Grid item xs={3}>
                            <PreviewPromptAction id={data.id} button={true} />
                        </Grid>
                        <Grid item xs={3}>
                            <Button startIcon={<SettingsIcon />} component={Link} to={"/groups/" + data.groupId + "/prompts/" + data.id + "/builder"} variant="contained"> Builder</Button>
                        </Grid>
                        <Grid item xs={3}>
                        <DeletePromptModalIcon id={data.promptId} button={true} />
                        </Grid>
                    </Grid>
                </Box>
            </React.Fragment>
            <Handle type="source" position={Position.Right} />
            <Handle type="target" position={Position.Left} />
        </Box>

    );
}
