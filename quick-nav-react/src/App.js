import React, { useState, useEffect } from 'react';
import { 
  ThemeProvider, 
  CssBaseline, 
  Box, 
  AppBar, 
  Toolbar, 
  Typography, 
  IconButton,
  Switch,
  Tooltip,
  Menu,
  MenuItem,
  Drawer,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Divider,
  useMediaQuery
} from '@mui/material';
import {
  Brightness4,
  Brightness7,
  Settings,
  Dashboard,
  BookmarkBorder,
  Note,
  Task,
  Build,
  Menu as MenuIcon,
  GitHub
} from '@mui/icons-material';
import { BrowserRouter as Router, Route, Routes, useNavigate, useLocation } from 'react-router-dom';
import { lightTheme, darkTheme } from './theme';
import DashboardView from './components/DashboardView';
import BookmarksView from './components/BookmarksView';
import NotesView from './components/NotesView';
import TasksView from './components/TasksView';
import SettingsView from './components/SettingsView';
import * as api from './api';
import './App.css';

function App() {
  const [darkMode, setDarkMode] = useState(false);
  const [settings, setSettings] = useState({});
  const [mobileOpen, setMobileOpen] = useState(false);
  const isMobile = useMediaQuery(lightTheme.breakpoints.down('md'));

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      const settingsData = await api.getSettings();
      setSettings(settingsData);
      setDarkMode(settingsData.theme === 'dark');
    } catch (error) {
      console.error('Failed to load settings:', error);
    }
  };

  const handleThemeToggle = async () => {
    const newTheme = !darkMode ? 'dark' : 'light';
    setDarkMode(!darkMode);
    try {
      await api.updateSetting('theme', newTheme);
    } catch (error) {
      console.error('Failed to save theme preference:', error);
    }
  };

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };

  const Navigation = () => {
    const navigate = useNavigate();
    const location = useLocation();

    const navigationItems = [
      { text: 'Dashboard', icon: <Dashboard />, path: '/' },
      { text: 'Bookmarks', icon: <BookmarkBorder />, path: '/bookmarks' },
      { text: 'Notes', icon: <Note />, path: '/notes' },
      { text: 'Tasks', icon: <Task />, path: '/tasks' },
      { text: 'Settings', icon: <Settings />, path: '/settings' },
    ];

    const drawer = (
      <Box sx={{ width: 250 }}>
        <Toolbar>
          <Typography variant="h6" noWrap component="div">
            Dashboard
          </Typography>
        </Toolbar>
        <Divider />
        <List>
          {navigationItems.map((item) => (
            <ListItem 
              button 
              key={item.text}
              selected={location.pathname === item.path}
              onClick={() => {
                navigate(item.path);
                if (isMobile) setMobileOpen(false);
              }}
            >
              <ListItemIcon>{item.icon}</ListItemIcon>
              <ListItemText primary={item.text} />
            </ListItem>
          ))}
        </List>
        <Divider />
        <List>
          <ListItem button onClick={() => window.open('https://github.com/xwzy/QuickNav', '_blank')}>
            <ListItemIcon><GitHub /></ListItemIcon>
            <ListItemText primary="GitHub" />
          </ListItem>
        </List>
      </Box>
    );

    return (
      <>
        {isMobile ? (
          <Drawer
            variant="temporary"
            anchor="left"
            open={mobileOpen}
            onClose={handleDrawerToggle}
            ModalProps={{ keepMounted: true }}
            sx={{
              '& .MuiDrawer-paper': { boxSizing: 'border-box', width: 250 },
            }}
          >
            {drawer}
          </Drawer>
        ) : (
          <Drawer
            variant="permanent"
            sx={{
              width: 250,
              flexShrink: 0,
              '& .MuiDrawer-paper': {
                width: 250,
                boxSizing: 'border-box',
              },
            }}
          >
            {drawer}
          </Drawer>
        )}
      </>
    );
  };

  const MainContent = () => (
    <Box
      component="main"
      sx={{
        flexGrow: 1,
        p: 3,
        width: { sm: `calc(100% - 250px)` },
        ml: { sm: '250px' },
        mt: 8,
      }}
    >
      <Routes>
        <Route path="/" element={<DashboardView />} />
        <Route path="/bookmarks" element={<BookmarksView />} />
        <Route path="/notes" element={<NotesView />} />
        <Route path="/tasks" element={<TasksView />} />
        <Route path="/settings" element={<SettingsView onSettingsChange={loadSettings} />} />
      </Routes>
    </Box>
  );

  return (
    <ThemeProvider theme={darkMode ? darkTheme : lightTheme}>
      <CssBaseline />
      <Router>
        <Box sx={{ display: 'flex' }}>
          <AppBar
            position="fixed"
            sx={{
              width: { sm: `calc(100% - 250px)` },
              ml: { sm: '250px' },
            }}
          >
            <Toolbar>
              {isMobile && (
                <IconButton
                  color="inherit"
                  aria-label="open drawer"
                  edge="start"
                  onClick={handleDrawerToggle}
                  sx={{ mr: 2, display: { sm: 'none' } }}
                >
                  <MenuIcon />
                </IconButton>
              )}
              <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
                Personal Productivity Dashboard
              </Typography>
              <Tooltip title="Toggle theme">
                <IconButton color="inherit" onClick={handleThemeToggle}>
                  {darkMode ? <Brightness7 /> : <Brightness4 />}
                </IconButton>
              </Tooltip>
            </Toolbar>
          </AppBar>
          <Navigation />
          <MainContent />
        </Box>
      </Router>
    </ThemeProvider>
  );
}

export default App;