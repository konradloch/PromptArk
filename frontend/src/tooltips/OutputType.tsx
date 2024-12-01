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
  
  export default function OutputType() {
    return (
        <HtmlTooltip
          title={
            <React.Fragment>
              <Typography color="inherit">Output Type</Typography>
    <p> Informative (metadata) field to mark output type of the prompt.</p>
    <ol>
        <li><strong>none</strong></li>
        <li><strong>list</strong> Means that prompt returns list of objects. </li>
        <li><strong>object</strong> Means that prompt returns just object.</li>
    </ol>
            </React.Fragment>
          }
          placement="top"
        >
          <HelpIcon style={{"fontSize": 17, "marginLeft": 5}}/>
        </HtmlTooltip>
    );
  }