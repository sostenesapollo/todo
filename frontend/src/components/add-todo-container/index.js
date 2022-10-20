import {
  Checkbox,
  Box,
  FormControlLabel,
  FormGroup,
  Icon,
  Paper,
  TextField,
} from "@mui/material";
import LoadingButton from "@mui/lab/LoadingButton";

export function AddTodoContainer({
  classes,
  newTodo,
  loadingAddButton,
  filters,
  onChangeDueTodayCheckbox,
  addTodo,
  setNewTodo,
}) {
  return (
    <Paper className={classes.addTodoContainer}>
      <Box display="flex" flexDirection="row">
        <Box flexGrow={1}>
          <TextField
            fullWidth
            placeholder="Todo description"
            value={newTodo.text}
            onKeyPress={(event) => {
              if (event.key === "Enter") {
                addTodo();
              }
            }}
            disabled={loadingAddButton}
            onChange={(event) =>
              setNewTodo({ ...newTodo, text: event.target.value })
            }
          />
        </Box>
        <Box flexGrow={1}>
          <TextField
            fullWidth
            placeholder="YYYY-MM-DD"
            value={newTodo.due_date}
            onKeyPress={(event) => {
              if (event.key === "Enter") {
                addTodo();
              }
            }}
            disabled={loadingAddButton}
            onChange={(event) =>
              setNewTodo({ ...newTodo, due_date: event.target.value })
            }
          />
        </Box>
        <LoadingButton
          className={classes.addTodoButton}
          startIcon={<Icon>add</Icon>}
          onClick={() => addTodo(newTodo.text)}
          disabled={loadingAddButton}
          loading={loadingAddButton}
        >
          Add
        </LoadingButton>
      </Box>

      <FormGroup>
        <p>Filter By:</p>
        <FormControlLabel
          control={
            <Checkbox
              onChange={onChangeDueTodayCheckbox}
              checked={filters.due_today}
            />
          }
          label="Only today todos"
        />
      </FormGroup>
    </Paper>
  );
}
