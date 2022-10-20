import {
  Typography,
  Icon,
  Box,
  Checkbox,
  Button,
  Paper,
  Grid,
  CircularProgress,
} from "@mui/material";

export function TodosList({
  todos,
  lastTodoElementRef,
  classes,
  toggleTodoCompleted,
  loading,
  hasMore,
  deleteTodo,
}) {
  return (
    <Paper className={classes.todosContainer}>
      {todos.length > 0 && (
        <Box display="flex" flexDirection="column" alignItems="space-between">
          {todos.map(({ id, text, due_date, completed }, index) => (
            <Box
              key={id}
              ref={todos.length - 1 === index ? lastTodoElementRef : undefined}
              display="flex"
              flexDirection="row"
              alignItems="center"
              className={classes.todoContainer}
            >
              <Checkbox
                checked={completed}
                onChange={() => toggleTodoCompleted(id)}
              ></Checkbox>
              <Box width="50%">
                <Typography
                  className={completed ? classes.todoTextCompleted : ""}
                  variant="body1"
                >
                  {text}
                </Typography>
              </Box>
              <Box width="50%">
                <Typography
                  className={completed ? classes.todoTextCompleted : ""}
                  variant="body1"
                >
                  {due_date}
                </Typography>
              </Box>
              <Button
                className={classes.deleteTodo}
                startIcon={<Icon>delete</Icon>}
                onClick={() => deleteTodo(id)}
              >
                Delete
              </Button>
            </Box>
          ))}
        </Box>
      )}
      <Grid container direction="row" justifyContent="space-around">
        {loading && <CircularProgress />}
        {!hasMore && "No more todos to load."}
      </Grid>
    </Paper>
  );
}
