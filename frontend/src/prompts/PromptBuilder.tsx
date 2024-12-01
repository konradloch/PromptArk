import * as React from 'react';
import Box from "@mui/material/Box";
import Grid from "@mui/material/Grid";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import TextSnippetIcon from "@mui/icons-material/TextSnippet";
import Breadcrumbs from '@mui/material/Breadcrumbs';
import { Link, useParams } from "react-router-dom";
import { styled } from '@mui/material/styles';
import { PromptEditor } from './PromptEditor';

const LinkStyled = styled(Link)(({ theme }) => ({
    color: "rgba(255, 255, 255, 0.7)",
    textDecoration: "none"
}));


function handleClick(event: React.MouseEvent<HTMLDivElement, MouseEvent>) {
    event.preventDefault();
}

function BasicBreadcrumbs(props: any) {
    return (
        <div role="presentation" onClick={handleClick}>
            <Breadcrumbs aria-label="breadcrumb">
                <LinkStyled to="/prompts">
                    Groups
                </LinkStyled>
                <LinkStyled
                    to={"/groups/"+props.groupId}
                >
                    Prompts
                </LinkStyled>
                <Typography color="text.primary">Builder</Typography>
            </Breadcrumbs>
        </div>
    );
}

export function PromptBuilder() {
    const { promptId } = useParams();
    const { groupId } = useParams();

    return (
        <Box sx={{ flexGrow: 1, m: 3 }}>
            <Grid container spacing={3} rowSpacing={3}>
                <Grid item xs={12}>
                    <Stack direction="row" spacing={1}>
                        <TextSnippetIcon sx={{ width: 64, height: 64 }} />
                        <Stack spacing={1}>
                            <Typography variant="h5" component="h1">
                                Prompt builder
                            </Typography>
                            <Typography variant="body2" component="h3">
                                Build and version your prompts.
                            </Typography>
                            <BasicBreadcrumbs groupId={groupId} />
                        </Stack>
                    </Stack>
                </Grid>
                <Grid item xs={12}>
                    <PromptEditor id={promptId} />
                </Grid>
            </Grid>
        </Box>
    )
}