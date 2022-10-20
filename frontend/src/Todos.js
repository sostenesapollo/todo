import { useState, useEffect, useCallback, useRef } from "react";
import makeStyles from "@mui/styles/makeStyles";
import CircularProgress from "@mui/material/CircularProgress";
import LoadingButton from "@mui/lab/LoadingButton";
import {
  Container,
  Typography,
  Icon,
  Paper,
  Box,
  TextField,
  Checkbox,
  Grid,
  Button,
} from "@mui/material";
import Snackbar from "./snackbar";

const useStyles = makeStyles({
  addTodoContainer: { padding: 10 },
  addTodoButton: { marginLeft: 5 },
  todosContainer: { marginTop: 10, padding: 10 },
  todoContainer: {
    borderTop: "1px solid #bfbfbf",
    marginTop: 5,
    "&:first-child": {
      margin: 0,
      borderTop: "none",
    },
    "&:hover": {
      "& $deleteTodo": {
        visibility: "visible",
      },
    },
  },
  todoTextCompleted: {
    textDecoration: "line-through",
  },
  deleteTodo: {
    visibility: "hidden",
  },
});

const uniqueArray = (a) =>
  [...new Set(a.map((o) => JSON.stringify(o)))].map((s) => JSON.parse(s));

function Todos() {
  const classes = useStyles();
  const [todos, setTodos] = useState([]);
  const [newTodo, setNewTodo] = useState({ text: "", due_date: "" });
  const [loading, setLoading] = useState(false);
  const [loadingAddButton, setLoadingAddButton] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [snackbar, setSnackbar] = useState({
    show: false,
    message: "",
    severity: "error",
  });
  const perPage = 20;

  useEffect(() => {
    loadMore();
  }, [setTodos]);

  function addTodo() {
    setLoadingAddButton(true);
    fetch("http://localhost:3001/", {
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
      },
      method: "POST",
      body: JSON.stringify(newTodo),
    })
      .then(async (response) => {
        if (!response.ok) {
          const { message } = await response.json();
          setSnackbar({ show: true, message, severity: "error" });
        } else {
          const todo = await response.json();
          setTodos([...todos, todo]);
          setSnackbar({
            show: true,
            message: "Todo added successfully.",
            severity: "success",
          });
        }
        setLoadingAddButton(false);
      })
      .catch(() => {
        setSnackbar({
          show: true,
          message: "Error to create.",
          severity: "error",
        });
        setLoadingAddButton(false);
      });
    // setNewTodo({...newTodo, text: todoText});
  }

  function toggleTodoCompleted(id) {
    fetch(`http://localhost:3001/${id}`, {
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
      },
      method: "PUT",
      body: JSON.stringify({
        completed: !todos.find((todo) => todo.id === id).completed,
      }),
    }).then(() => {
      const newTodos = [...todos];
      const modifiedTodoIndex = newTodos.findIndex((todo) => todo.id === id);
      newTodos[modifiedTodoIndex] = {
        ...newTodos[modifiedTodoIndex],
        completed: !newTodos[modifiedTodoIndex].completed,
      };
      setTodos(newTodos);
    });
  }

  function deleteTodo(id) {
    fetch(`http://localhost:3001/${id}`, {
      method: "DELETE",
    }).then(() => setTodos(todos.filter((todo) => todo.id !== id)));
  }

  const observer = useRef();

  function loadMore() {
    setLoading(true);
    fetch(`http://localhost:3001/?skip=${todos.length}&offset=${perPage}`)
      .then((response) => response.json())
      .then(({ todosList }) => {
        const newTodos = uniqueArray([...todos, ...todosList]);
        if (newTodos.length === todos.length) {
          setHasMore(false);
        }
        setTodos(newTodos);
        setLoading(false);
      });
  }

  const lastTodoElementRef = useCallback(
    (node) => {
      if (!hasMore) return;
      if (loading) return;
      if (observer.current) observer.current.disconnect();
      observer.current = new IntersectionObserver((entries) => {
        if (entries[0].isIntersecting && !loading) {
          loadMore();
        }
      });
      if (node) observer.current.observe(node);
    },
    [todos, loadMore, loading]
  );

  return (
    <Container maxWidth="md">
      <Snackbar
        severity={snackbar.severity}
        message={snackbar.message}
        show={snackbar.show}
        setShow={(show) => setSnackbar({ ...snackbar, show })}
      />
      <Typography variant="h3" component="h1" gutterBottom>
        Todos
      </Typography>
      <Paper className={classes.addTodoContainer}>
        <Box display="flex" flexDirection="row">
          <Box flexGrow={1}>
            <TextField
              fullWidth
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
      </Paper>
      <Paper className={classes.todosContainer}>
        {todos.length > 0 && (
          <Box display="flex" flexDirection="column" alignItems="space-between">
            {todos.map(({ id, text, due_date, completed }, index) => (
              <Box
                key={id}
                ref={
                  todos.length - 1 === index ? lastTodoElementRef : undefined
                }
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
    </Container>
  );
}

export default Todos;
