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
  
  export default function Parameters() {
    return (
        <HtmlTooltip
          title={
            <React.Fragment>
              <Typography color="inherit">Parameters</Typography>
                <p>Define to explicity point what parameters should be parsed in prompt via internal engine. Parameters in delimeter like: {`{{ .ParamName }}`} and defined in below input are expected to be parsed internally.    </p>
                <p>Parameters not defined here will be returned as a part of the prompt. In that case user is responsible to insert paramters.</p>
            </React.Fragment>
          }
          placement="top"
        >
          <HelpIcon style={{"fontSize": 17, "marginLeft": 5}}/>
        </HtmlTooltip>
    );
  }