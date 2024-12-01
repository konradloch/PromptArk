import * as React from 'react';
import { styled } from '@mui/material/styles';
import Tooltip, { TooltipProps, tooltipClasses } from '@mui/material/Tooltip';
import Typography from '@mui/material/Typography';
import HelpIcon from '@mui/icons-material/Help';

const HtmlTooltip = styled(({ className, ...props }: TooltipProps) => (
    <Tooltip {...props} classes={{ popper: className }} />
  ))(({ theme }) => ({
    [`& .${tooltipClasses.tooltip}`]: {
      backgroundColor: '#f5f5f9',
      color: 'rgba(0, 0, 0, 0.87)',
      maxWidth: 440,
      fontSize: theme.typography.pxToRem(12),
      border: '1px solid #dadde9',
    },
  }));
  
  export default function SystemRolePrompt() {
    return (
        <HtmlTooltip
          title={
            <React.Fragment>
              <Typography color="inherit">System Role Prompt</Typography>
    <p>Role prompting is a prompt engineering technique where the AI adopts a specific character or profession to generate focused, relevant responses.</p>
    <p>Use below input to provide that information in your prompt.</p>
    <h3>How to Use:</h3>
    <ol>
        <li><strong>Choose a role:</strong> Pick a relevant character or profession.</li>
        <li><strong>Provide context:</strong> Set the scene or background for the role.</li>
    </ol>

    <h3>Example:</h3>
    <p>As a professor at university teaching physics [...write exam for studens...]</p>
    <p><strong>Technique: </strong> Role Prompting</p>
            </React.Fragment>
          }
          placement="top"
        >
          <HelpIcon style={{"fontSize": 17, "marginLeft": 5}}/>
        </HtmlTooltip>
    );
  }