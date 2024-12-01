import { Input, styled } from "@mui/material";

export const StyledInput = styled(Input)(({ theme }) => ({
    backgroundColor: theme.palette.background.default,
    width: "100%",
}));