import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';
import reportWebVitals from './reportWebVitals';
import CssBaseline from '@mui/material/CssBaseline';
import { ThemeProvider } from '@mui/material/styles';
import theme from './theme';
import {
    createBrowserRouter,
    RouterProvider,
} from "react-router-dom";
import ErrorPage from "./common/ErrorPage";
import Publisher from "./publisher/Publisher";
import Group from "./groups/Group";
import GroupDetails from "./groups/GroupDetails";
import Feedback from './feedback/Feedbacks';
import Analyzer from './analyzer/Analyzer';
import { PromptBuilder } from './prompts/PromptBuilder';
import Tutorial from './Tutorial';

const root = ReactDOM.createRoot(
  document.getElementById('root') as HTMLElement
);

const router = createBrowserRouter([
    {
        path: "/",
        element: <App />,
        errorElement: <ErrorPage/>,
        children: [
            {
                path: "/",
                element: <Tutorial/>
            },
            {
                path: "publisher",
                element: <Publisher/>,
            },
            {
                path: "prompts",
                element: <Group/>,
            },
            {
                path: "groups/:groupId",
                element: <GroupDetails/>
            },
            {
                path: "feedback",
                element: <Feedback/>
            },
            {
                path: "analyzer",
                element: <Analyzer/>
            },
            {
                path:"groups/:groupId/prompts/:promptId/builder",
                element: <PromptBuilder/>
            }
        ],
    },
]);

root.render(
    <ThemeProvider theme={theme}>
        <CssBaseline />
        <RouterProvider router={router} />
    </ThemeProvider>,
);

reportWebVitals();
