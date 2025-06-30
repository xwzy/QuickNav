import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  List,
  ListItem,
  ListItemText,
  Checkbox,
  IconButton,
  Chip,
  useTheme,
} from '@mui/material';
import { Add, PriorityHigh, Schedule } from '@mui/icons-material';
import * as api from '../../api';

const TasksWidget = ({ config = {} }) => {
  const theme = useTheme();
  const [tasks, setTasks] = useState([]);
  const { showCompleted = false, maxItems = 5 } = config;

  useEffect(() => {
    loadTasks();
  }, []);

  const loadTasks = async () => {
    try {
      const tasksData = await api.fetchTasks();
      setTasks(tasksData);
    } catch (error) {
      console.error('Failed to load tasks:', error);
    }
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

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 3: return theme.palette.error.main;
      case 2: return theme.palette.warning.main;
      case 1: return theme.palette.info.main;
      default: return theme.palette.grey[500];
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

  // Filter and limit tasks
  const displayTasks = tasks
    .filter(task => showCompleted || !task.completed)
    .slice(0, maxItems);

  return (
    <Box sx={{ p: 2, height: '100%', display: 'flex', flexDirection: 'column' }}>
      <Typography variant="h6" component="h3" sx={{ mb: 1, fontWeight: 600 }}>
        Tasks
      </Typography>
      
      <List sx={{ flexGrow: 1, overflow: 'auto', py: 0 }}>
        {displayTasks.map((task) => (
          <ListItem
            key={task.id}
            sx={{
              px: 0,
              py: 0.5,
              alignItems: 'flex-start',
            }}
          >
            <Checkbox
              checked={task.completed}
              onChange={() => handleToggleTask(task)}
              size="small"
              sx={{ pt: 0.5 }}
            />
            <ListItemText
              primary={
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                  <Typography
                    variant="body2"
                    sx={{
                      textDecoration: task.completed ? 'line-through' : 'none',
                      opacity: task.completed ? 0.6 : 1,
                      flexGrow: 1,
                    }}
                  >
                    {task.title}
                  </Typography>
                  {task.priority > 1 && (
                    <PriorityHigh
                      sx={{
                        fontSize: 16,
                        color: getPriorityColor(task.priority),
                      }}
                    />
                  )}
                </Box>
              }
              secondary={
                task.due_date && (
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mt: 0.5 }}>
                    <Schedule sx={{ fontSize: 12 }} />
                    <Typography
                      variant="caption"
                      sx={{
                        color: isOverdue(task.due_date) ? theme.palette.error.main : 'text.secondary',
                      }}
                    >
                      {formatDueDate(task.due_date)}
                    </Typography>
                  </Box>
                )
              }
            />
          </ListItem>
        ))}
      </List>
      
      {displayTasks.length === 0 && (
        <Box sx={{ textAlign: 'center', py: 4 }}>
          <Typography variant="body2" color="text.secondary">
            {showCompleted ? 'No tasks' : 'No pending tasks'}
          </Typography>
        </Box>
      )}
    </Box>
  );
};

export default TasksWidget;