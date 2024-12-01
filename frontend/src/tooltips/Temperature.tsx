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
  
  export default function Temperature() {
    return (
        <HtmlTooltip
          title={
            <React.Fragment>
              <Typography color="inherit">Temperature</Typography>
    <p>Temperature is a key parameter in LMs, influencing the randomness or conservativeness of the model's output during fine-tuning.</p>

    <h3>Role of Temperature</h3>
    <p>The temperature setting controls the model’s creativity. Lower values make the model more conservative, while higher values encourage riskier, more creative outputs.</p>

    <h3>Practical Uses</h3>
    <ul>
        <li><strong>Lower temperatures (e.g., 0.2, 0.5):</strong> More focused, less diverse outputs. Ideal for tasks like text summarization or translation.</li>
        <li><strong>Higher temperatures (e.g., 1.0, 2.0):</strong> More creative but possibly less coherent. Best for tasks like creative writing or brainstorming.</li>
    </ul>

    <p>Experimenting with different values helps strike the right balance between creativity and coherence for various tasks.</p>
            </React.Fragment>
          }
          placement="top"
        >
          <HelpIcon style={{"fontSize": 17, "marginLeft": 5}}/>
        </HtmlTooltip>
    );
  }