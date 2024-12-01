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
  
  export default function TopP() {
    return (
        <HtmlTooltip
          title={
            <React.Fragment>
              <Typography color="inherit">Top P</Typography>
    <p>Top P is a dynamic method for controlling randomness in a model's output, balancing quality and diversity in text generation.</p>

    <h3>How Top P Works</h3>
    <p>Unlike Top K sampling, Top P selects tokens whose cumulative probability equals a given value of P (ranging from 0 to 1), automatically adapting to the token distribution.</p>

    {/* <h3>Advantages of Top P</h3>
    <ul>
        <li><strong>Diverse and coherent outputs:</strong> Balances between conservative and random text for better output quality.</li>
        <li><strong>Adaptive threshold:</strong> Adjusts based on token distribution without manual tuning.</li>
        <li><strong>Prevents OOV tokens:</strong> Avoids selecting out-of-vocabulary tokens.</li>
    </ul> */}

    <h3>Adjusting Top P Value</h3>
    <ul>
        <li><strong>Lower values:</strong> More focused output, less diversity.</li>
        <li><strong>Higher values:</strong> More diverse output, possibly less coherence.</li>
    </ul>

    <p>A common Top P value is 0.9, but experimenting with different values is recommended to find the right balance for your needs.</p>
            </React.Fragment>
          }
          placement="top"
        >
          <HelpIcon style={{"fontSize": 17, "marginLeft": 5}}/>
        </HtmlTooltip>
    );
  }