import { useState, useEffect, useCallback, useRef } from "react";
import makeStyles from "@mui/styles/makeStyles";
import { Container } from "@mui/material";
import Snackbar from "./snackbar";
import { todayDate } from "./util";
import { TodosList } from "./components/todos-list";
import { Title } from "./components/title";
import { AddTodoContainer } from "./components/add-todo-container";

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
  const [filters, setFilters] = useState({ due_today: false });
  const [snackbar, setSnackbar] = useState({
    show: false,
    message: "",
    severity: "error",
  });
  const perPage = 20;

  useEffect(() => {
    loadMore();
  }, []);

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
          if (
            (filters.due_today && newTodo.due_date === todayDate()) ||
            !filters.due_today
          ) {
            setTodos([...todos, todo]);
          }

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

  function loadMore(
    { due_today, skip } = { due_today: false, skip: todos.length }
  ) {
    setLoading(true);
    fetch(
      `http://localhost:3001/?skip=${skip}&offset=${perPage}?due_today=${due_today}`
    )
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

  function onChangeDueTodayCheckbox(event) {
    setLoading(true);
    fetch(
      `http://localhost:3001/?skip=${0}?offset=${perPage}&due_today=${
        event.target.checked
      }`
    ).then(async (response) => {
      setLoading(false);
      const { todosList } = await response.json();
      setTodos(todosList);
      setFilters({ due_today: !event.target.checked });
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

      <Title text={"todos"} newTodo={newTodo} />

      <AddTodoContainer
        classes={classes}
        loadingAddButton={loadingAddButton}
        filters={filters}
        newTodo={newTodo}
        onChangeDueTodayCheckbox={onChangeDueTodayCheckbox}
        addTodo={addTodo}
        setNewTodo={setNewTodo}
      />

      <TodosList
        todos={todos}
        lastTodoElementRef={lastTodoElementRef}
        classes={classes}
        toggleTodoCompleted={toggleTodoCompleted}
        loading={loading}
        hasMore={hasMore}
        deleteTodo={deleteTodo}
      />
    </Container>
  );
}

export default Todos;
