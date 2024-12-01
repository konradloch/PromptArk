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
  
  export default function OutputPrompt() {
    return (
        <HtmlTooltip
          title={
            <React.Fragment>
              <Typography color="inherit">Output Prompt</Typography>
    <p>For better model responses, request structured output formats like JSON, XML, or HTML.</p>
            <p>
            <strong>Define structure:</strong> Outline the format and fields you want, providing examples (in Output Example input) if needed.
            </p>
            <p>Example:</p>
            <pre>
            {
`{
    "name": "string",
    "address": "string",
}`
            }
            </pre>
    <p><strong>Note:</strong> At this moment only JSON format is handled.</p>
            </React.Fragment>
          }
          placement="top"
        >
          <HelpIcon style={{"fontSize": 17, "marginLeft": 5}}/>
        </HtmlTooltip>
    );
  }