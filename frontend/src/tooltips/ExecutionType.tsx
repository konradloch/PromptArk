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
  
  export default function ExecutionType() {
    return (
        <HtmlTooltip
          title={
            <React.Fragment>
              <Typography color="inherit">Execution Type</Typography>
    <p> Informative only (metadata) field to mark execution type of the prompt.</p>
    <ol>
        <li><strong>none</strong></li>
        <li><strong>for_each</strong> If parent prompt output type is List then it means that prompt should be executed per every item in that list. </li>
        <li><strong>object</strong> If parent prompt output type is object or list, then it means that prompt should be executed once by parent output for whole object or list.</li>
    </ol>
            </React.Fragment>
          }
          placement="top"
        >
          <HelpIcon style={{"fontSize": 17, "marginLeft": 5}}/>
        </HtmlTooltip>
    );
  }