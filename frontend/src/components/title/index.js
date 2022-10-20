import { Typography } from "@mui/material";

export function Title({ text }) {
  return (
    <Typography variant="h3" component="h1" gutterBottom>
      {text}
    </Typography>
  );
}
