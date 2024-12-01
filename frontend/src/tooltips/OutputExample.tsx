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
      maxWidth: 220,
      fontSize: theme.typography.pxToRem(12),
      border: '1px solid #dadde9',
    },
  }));
  
  export default function OutputExampleTooltip() {
    return (
        <HtmlTooltip
          title={
            <React.Fragment>
              <Typography color="inherit">Output example</Typography>
                <p>
Provide examples of desired behavior to guide the model. For instance, show a few correct responses, then ask the model to continue. This helps the model follow the pattern you've set.
                </p>
                <p>
                  Every item in array should represents complete and desired output from the LLM model. Every new item is a new example.
                </p>
                <p><strong>Technique: </strong> Few Shot Prompting</p>
            </React.Fragment>
          }
          placement="top"
        >
          <HelpIcon style={{"fontSize": 17, "marginLeft": 5}}/>
        </HtmlTooltip>
    );
  }