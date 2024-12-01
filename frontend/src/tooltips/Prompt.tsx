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
  
  export default function Prompt() {
    return (
        <HtmlTooltip
          title={
            <React.Fragment>
              <Typography color="inherit">Prompt</Typography>
    <p>Main part of the prompt. For better model response conside to use bellow techniques:</p>
    <h3>Delimiter</h3>
    <p>Use unique delimiters (e.g., {`{{ }}`} or &lt;|data|&gt;) to clearly separate instructions from data. Keep the format consistent for better model responses.</p>

    <h3>Style</h3>
    <p>Specify the tone (e.g., formal, casual) in your prompt. Use phrases like "in a professional manner" to guide the model’s writing style.</p>

    <h3>Condition</h3>
    <p>Add conditions to your prompt (e.g., extract recipe steps or provide alternative output if no recipe is found) for more targeted responses.</p>

    <h3>Instructions</h3>
    <p>Provide clear, detailed instructions to ensure the model focuses on accurate solutions rather than rushing to conclusions.</p>
            </React.Fragment>
          }
          placement="top"
        >
          <HelpIcon style={{"fontSize": 17, "marginLeft": 5}}/>
        </HtmlTooltip>
    );
  }