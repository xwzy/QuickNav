import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  ListItemSecondaryAction,
  Checkbox,
  IconButton,
  Button,
  TextField,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Chip,
  MenuItem,
  InputAdornment,
  Card,
  CardContent,
  Tabs,
  Tab,
  useTheme,
} from '@mui/material';
import {
  Add,
  Edit,
  Delete,
  Search,
  PriorityHigh,
  Schedule,
  CheckCircle,
  RadioButtonUnchecked,
  Assignment,
} from '@mui/icons-material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import dayjs from 'dayjs';
import * as api from '../api';

const TasksView = () => {
  const theme = useTheme();
  const [tasks, setTasks] = useState([]);
  const [filteredTasks, setFilteredTasks] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterTab, setFilterTab] = useState(0); // 0: All, 1: Pending, 2: Completed
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingTask, setEditingTask] = useState(null);
  const [taskForm, setTaskForm] = useState({
    title: '',
    description: '',
    priority: 1,
    due_date: null,
  });

  useEffect(() => {
    loadTasks();
  }, []);

  useEffect(() => {
    filterTasks();
  }, [tasks, searchTerm, filterTab]);

  const loadTasks = async () => {
    try {
      const tasksData = await api.fetchTasks();
      setTasks(tasksData);
    } catch (error) {
      console.error('Failed to load tasks:', error);
    }
  };

  const filterTasks = () => {
    let filtered = tasks;

    // Filter by completion status
    if (filterTab === 1) {
      filtered = filtered.filter(task => !task.completed);
    } else if (filterTab === 2) {
      filtered = filtered.filter(task => task.completed);
    }

    // Filter by search term
    if (searchTerm) {
      filtered = filtered.filter(
        task =>
          task.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
          task.description.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    setFilteredTasks(filtered);
  };

  const handleToggleTask = async (task) => {
    try {
      await api.updateTask(
        task.id,
        task.title,
        task.description,
        !task.completed,
        task.priority,
        task.due_date
      );
      loadTasks();
    } catch (error) {
      console.error('Failed to update task:', error);
    }
  };

  const handleAddTask = () => {
    setEditingTask(null);
    setTaskForm({
      title: '',
      description: '',
      priority: 1,
      due_date: null,
    });
    setDialogOpen(true);
  };

  const handleEditTask = (task) => {
    setEditingTask(task);
    setTaskForm({
      title: task.title,
      description: task.description,
      priority: task.priority,
      due_date: task.due_date ? dayjs(task.due_date) : null,
    });
    setDialogOpen(true);
  };

  const handleDeleteTask = async (taskId) => {
    if (window.confirm('Are you sure you want to delete this task?')) {
      try {
        await api.deleteTask(taskId);
        loadTasks();
      } catch (error) {
        console.error('Failed to delete task:', error);
      }
    }
  };

  const handleSaveTask = async () => {
    try {
      const dueDate = taskForm.due_date ? taskForm.due_date.toISOString() : null;
      
      if (editingTask) {
        await api.updateTask(
          editingTask.id,
          taskForm.title,
          taskForm.description,
          editingTask.completed,
          taskForm.priority,
          dueDate
        );
      } else {
        await api.addTask(
          taskForm.title,
          taskForm.description,
          taskForm.priority,
          dueDate
        );
      }
      setDialogOpen(false);
      loadTasks();
    } catch (error) {
      console.error('Failed to save task:', error);
    }
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 3: return theme.palette.error.main;
      case 2: return theme.palette.warning.main;
      case 1: return theme.palette.info.main;
      default: return theme.palette.grey[500];
    }
  };

  const getPriorityLabel = (priority) => {
    switch (priority) {
      case 3: return 'High';
      case 2: return 'Medium';
      case 1: return 'Low';
      default: return 'None';
    }
  };

  const isOverdue = (dueDate) => {
    if (!dueDate) return false;
    return new Date(dueDate) < new Date();
  };

  const formatDueDate = (dueDate) => {
    if (!dueDate) return '';
    const date = new Date(dueDate);
    const now = new Date();
    const diffTime = date - now;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays < 0) return 'Overdue';
    if (diffDays === 0) return 'Today';
    if (diffDays === 1) return 'Tomorrow';
    if (diffDays < 7) return `${diffDays} days`;
    return date.toLocaleDateString();
  };

  const getTaskStats = () => {
    const total = tasks.length;
    const completed = tasks.filter(task => task.completed).length;
    const pending = total - completed;
    const overdue = tasks.filter(task => !task.completed && isOverdue(task.due_date)).length;
    
    return { total, completed, pending, overdue };
  };

  const stats = getTaskStats();

  return (
    <LocalizationProvider dateAdapter={AdapterDayjs}>
      <Box sx={{ width: '100%' }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
          <Typography variant="h4" component="h1">
            Tasks
          </Typography>
          <Button
            variant="contained"
            startIcon={<Add />}
            onClick={handleAddTask}
          >
            Add Task
          </Button>
        </Box>

        {/* Stats Cards */}
        <Box sx={{ mb: 3, display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 2 }}>
          <Card>
            <CardContent>
              <Typography color="text.secondary" gutterBottom>
                Total Tasks
              </Typography>
              <Typography variant="h4">
                {stats.total}
              </Typography>
            </CardContent>
          </Card>
          <Card>
            <CardContent>
              <Typography color="text.secondary" gutterBottom>
                Pending
              </Typography>
              <Typography variant="h4" color="warning.main">
                {stats.pending}
              </Typography>
            </CardContent>
          </Card>
          <Card>
            <CardContent>
              <Typography color="text.secondary" gutterBottom>
                Completed
              </Typography>
              <Typography variant="h4" color="success.main">
                {stats.completed}
              </Typography>
            </CardContent>
          </Card>
          <Card>
            <CardContent>
              <Typography color="text.secondary" gutterBottom>
                Overdue
              </Typography>
              <Typography variant="h4" color="error.main">
                {stats.overdue}
              </Typography>
            </CardContent>
          </Card>
        </Box>

        {/* Search and Filter Controls */}
        <Box sx={{ mb: 3 }}>
          <TextField
            placeholder="Search tasks..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <Search />
                </InputAdornment>
              ),
            }}
            sx={{ minWidth: 400 }}
          />
        </Box>

        {/* Filter Tabs */}
        <Tabs value={filterTab} onChange={(e, newValue) => setFilterTab(newValue)} sx={{ mb: 3 }}>
          <Tab label="All Tasks" />
          <Tab label="Pending" />
          <Tab label="Completed" />
        </Tabs>

        {/* Tasks List */}
        <Card>
          <List>
            {filteredTasks.map((task, index) => (
              <ListItem
                key={task.id}
                divider={index < filteredTasks.length - 1}
                sx={{
                  opacity: task.completed ? 0.7 : 1,
                }}
              >
                <ListItemIcon>
                  <Checkbox
                    checked={task.completed}
                    onChange={() => handleToggleTask(task)}
                    icon={<RadioButtonUnchecked />}
                    checkedIcon={<CheckCircle />}
                  />
                </ListItemIcon>
                
                <ListItemText
                  primary={
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <Typography
                        variant="h6"
                        sx={{
                          textDecoration: task.completed ? 'line-through' : 'none',
                          flexGrow: 1,
                        }}
                      >
                        {task.title}
                      </Typography>
                      
                      {task.priority > 1 && (
                        <Chip
                          size="small"
                          label={getPriorityLabel(task.priority)}
                          sx={{
                            backgroundColor: getPriorityColor(task.priority),
                            color: 'white',
                          }}
                        />
                      )}
                    </Box>
                  }
                  secondary={
                    <Box>
                      {task.description && (
                        <Typography variant="body2" color="text.secondary" sx={{ mb: 0.5 }}>
                          {task.description}
                        </Typography>
                      )}
                      
                      {task.due_date && (
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                          <Schedule sx={{ fontSize: 16 }} />
                          <Typography
                            variant="caption"
                            sx={{
                              color: isOverdue(task.due_date) ? theme.palette.error.main : 'text.secondary',
                            }}
                          >
                            {formatDueDate(task.due_date)}
                          </Typography>
                        </Box>
                      )}
                    </Box>
                  }
                />
                
                <ListItemSecondaryAction>
                  <IconButton
                    edge="end"
                    onClick={() => handleEditTask(task)}
                    sx={{ mr: 1 }}
                  >
                    <Edit />
                  </IconButton>
                  <IconButton
                    edge="end"
                    onClick={() => handleDeleteTask(task.id)}
                  >
                    <Delete />
                  </IconButton>
                </ListItemSecondaryAction>
              </ListItem>
            ))}
          </List>
        </Card>

        {filteredTasks.length === 0 && (
          <Box sx={{ textAlign: 'center', py: 8 }}>
            <Assignment sx={{ fontSize: 64, color: 'text.secondary', mb: 2 }} />
            <Typography variant="h6" color="text.secondary" gutterBottom>
              {searchTerm ? 'No tasks found' : 'No tasks yet'}
            </Typography>
            {!searchTerm && (
              <Button
                variant="contained"
                startIcon={<Add />}
                onClick={handleAddTask}
                sx={{ mt: 2 }}
              >
                Create your first task
              </Button>
            )}
          </Box>
        )}

        {/* Add/Edit Dialog */}
        <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)} maxWidth="sm" fullWidth>
          <DialogTitle>
            {editingTask ? 'Edit Task' : 'Add New Task'}
          </DialogTitle>
          <DialogContent>
            <TextField
              autoFocus
              margin="dense"
              label="Title"
              fullWidth
              variant="outlined"
              value={taskForm.title}
              onChange={(e) => setTaskForm({ ...taskForm, title: e.target.value })}
              sx={{ mb: 2 }}
            />
            <TextField
              margin="dense"
              label="Description"
              fullWidth
              multiline
              rows={3}
              variant="outlined"
              value={taskForm.description}
              onChange={(e) => setTaskForm({ ...taskForm, description: e.target.value })}
              sx={{ mb: 2 }}
            />
            <TextField
              select
              margin="dense"
              label="Priority"
              fullWidth
              variant="outlined"
              value={taskForm.priority}
              onChange={(e) => setTaskForm({ ...taskForm, priority: parseInt(e.target.value) })}
              sx={{ mb: 2 }}
            >
              <MenuItem value={1}>Low</MenuItem>
              <MenuItem value={2}>Medium</MenuItem>
              <MenuItem value={3}>High</MenuItem>
            </TextField>
            <DatePicker
              label="Due Date"
              value={taskForm.due_date}
              onChange={(newValue) => setTaskForm({ ...taskForm, due_date: newValue })}
              renderInput={(params) => <TextField {...params} fullWidth sx={{ mb: 2 }} />}
            />
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setDialogOpen(false)}>Cancel</Button>
            <Button onClick={handleSaveTask} variant="contained">
              {editingTask ? 'Update' : 'Add'}
            </Button>
          </DialogActions>
        </Dialog>
      </Box>
    </LocalizationProvider>
  );
};

export default TasksView;