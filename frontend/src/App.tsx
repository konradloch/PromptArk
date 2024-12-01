import React from 'react';
import Container from '@mui/material/Container';
import MiniDrawer from "./Drawer";

export default function App() {
  return (
      <Container maxWidth={false}>
          <MiniDrawer/>
      </Container>
  );
}