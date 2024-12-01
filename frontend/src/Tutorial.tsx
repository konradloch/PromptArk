import React, { useState } from 'react';
import {
  Box,
  Paper,
  Typography,
  Button,
  Stepper,
  Step,
  StepLabel,
} from '@mui/material';

interface TutorialStep {
  title: string;
  content: string;
}

const tutorialSteps: TutorialStep[] = [
  {
    title: 'Welcome',
    content: 'Welcome to our application! Let\'s get you started with a quick tutorial.',
  },
  {
    title: 'Step 1',
    content: 'This is the first step of our tutorial. Here you can learn about basic features.',
  },
  {
    title: 'Step 2',
    content: 'Now let\'s explore some more advanced features of our application.',
  },
  {
    title: 'Finish',
    content: 'Congratulations! You\'ve completed the tutorial. You\'re ready to start using the application.',
  },
];

const Tutorial: React.FC = () => {
  const [currentStep, setCurrentStep] = useState(0);

  const handleNext = () => {
    if (currentStep < tutorialSteps.length - 1) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handlePrevious = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleFinish = () => {
    console.log('Tutorial completed!');
  };

  return (
      <Box sx={{ mt: 4, mb: 4 }}>
        <Paper elevation={3} sx={{ p: 4 }}>
          <Stepper activeStep={currentStep} alternativeLabel>
            {tutorialSteps.map((step) => (
              <Step key={step.title}>
                <StepLabel>{step.title}</StepLabel>
              </Step>
            ))}
          </Stepper>

          <Box sx={{ mt: 4, mb: 4 }}>
            <Typography variant="h5" gutterBottom>
              {tutorialSteps[currentStep].title}
            </Typography>
            <Typography variant="body1" sx={{ mt: 2 }}>
              {tutorialSteps[currentStep].content}
            </Typography>
          </Box>

          <Box sx={{ 
            display: 'flex', 
            justifyContent: 'space-between',
            mt: 4 
          }}>
            <Button
              variant="contained"
              onClick={handlePrevious}
              disabled={currentStep === 0}
            >
              Back
            </Button>

            {currentStep === tutorialSteps.length - 1 ? (
              <Button
                variant="contained"
                color="success"
                onClick={handleFinish}
              >
                Finish
              </Button>
            ) : (
              <Button
                variant="contained"
                onClick={handleNext}
              >
                Next
              </Button>
            )}
          </Box>
        </Paper>
      </Box>
  );
};

export default Tutorial;

