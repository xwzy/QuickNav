import React, { useState, useEffect } from 'react';
import { Button, Box, AppBar, Toolbar, Typography, Container, Paper, ThemeProvider, CssBaseline, useMediaQuery, IconButton } from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import VisibilityIcon from '@mui/icons-material/Visibility';
import GitHubIcon from '@mui/icons-material/GitHub';
import './App.css';
import CategoryList from './components/CategoryList';
import AddCategoryForm from './components/AddCategoryForm';
import AddSiteForm from './components/AddSiteForm';
import * as apiService from './api';
import { BrowserRouter as Router, Route, Routes, useNavigate, useLocation } from 'react-router-dom';
import EditableCategoryList from './components/EditableCategoryList';
import theme from './theme';

function App() {
  const [categories, setCategories] = useState([]);
  const [sites, setSites] = useState([]);

  useEffect(() => {
    fetchCategories();
    fetchSites();
  }, []);

  const fetchCategories = async () => {
    const data = await apiService.fetchCategories();
    setCategories(data);
  };

  const fetchSites = async () => {
    const data = await apiService.fetchSites();
    setSites(data);
  };

  const addCategory = async (name) => {
    const success = await apiService.addCategory(name);
    if (success) {
      fetchCategories();
    }
  };

  const addSite = async (site) => {
    const success = await apiService.addSite(site);
    if (success) {
      fetchSites();
    }
  };

  const updateCategoryOrder = async (id, newOrder) => {
    const success = await apiService.updateCategoryOrder(id, newOrder);
    if (success) {
      fetchCategories();
    }
  };

  const updateCategory = async (id, name) => {
    const success = await apiService.updateCategory(id, name);
    if (success) {
      fetchCategories();
    }
  };

  const deleteCategory = async (id) => {
    const success = await apiService.deleteCategory(id);
    if (success) {
      fetchCategories();
      fetchSites();
    }
  };

  const updateSite = async (site) => {
    const success = await apiService.updateSite(site);
    if (success) {
      fetchSites();
    }
  };

  const deleteSite = async (id) => {
    const success = await apiService.deleteSite(id);
    if (success) {
      fetchSites();
    }
  };

  const handleReorderCategory = async (categoryId, newIndex) => {
    const updatedCategories = [...categories];
    const currentIndex = updatedCategories.findIndex(cat => cat.id === categoryId);
    const [movedCategory] = updatedCategories.splice(currentIndex, 1);
    updatedCategories.splice(newIndex, 0, movedCategory);

    // 更新本地状态
    setCategories(updatedCategories);

    // 立即调用 API 更新服务器端的顺序
    try {
      await apiService.updateCategoriesOrder(updatedCategories);
    } catch (error) {
      console.error('Failed to update categories order:', error);
      // 如果 API 调用失败，回滚本地状态
      fetchCategories(); // 重新获取类别列表以确保与服务器同步
    }
  };

  function NavigationButton() {
    const navigate = useNavigate();
    const location = useLocation();
    const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

    const handleNavigation = () => {
      if (location.pathname === '/') {
        navigate('/edit');
      } else {
        navigate('/');
      }
    };

    return (
      <Button
        variant="contained"
        color="secondary"
        onClick={handleNavigation}
        startIcon={location.pathname === '/' ? <EditIcon /> : <VisibilityIcon />}
        sx={{
          position: 'fixed',
          bottom: '20px',
          right: '20px',
          borderRadius: isMobile ? '50%' : 'default',
          width: isMobile ? '60px' : 'auto',
          height: isMobile ? '60px' : 'auto',
          minWidth: isMobile ? 'unset' : '64px',
          boxShadow: theme.shadows[4],
        }}
      >
        {!isMobile && (location.pathname === '/' ? 'Edit' : 'View')}
      </Button>
    );
  }

  function MainContent() {
    const location = useLocation();
    const isEditMode = location.pathname === '/edit';

    return (
      <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
        <Routes>
          <Route path="/" element={
            <CategoryList
              categories={categories}
              sites={sites}
              updateCategoryOrder={updateCategoryOrder}
              updateCategory={updateCategory}
              deleteCategory={deleteCategory}
              updateSite={updateSite}
              deleteSite={deleteSite}
              isEditable={false}
            />
          } />
          <Route path="/edit" element={
            <CategoryList
              categories={categories}
              sites={sites}
              updateCategory={updateCategory}
              deleteCategory={deleteCategory}
              updateSite={updateSite}
              deleteSite={deleteSite}
              reorderCategory={handleReorderCategory}
              isEditable={true}
            />
          } />
        </Routes>
        {isEditMode && (
          <Paper elevation={2} sx={{ mt: 4, p: 3, borderRadius: 2 }}>
            <Typography variant="h5" component="h2" gutterBottom sx={{ mb: 3 }}>
              Add New Content
            </Typography>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
              <AddCategoryForm addCategory={addCategory} />
              <AddSiteForm addSite={addSite} categories={categories} />
            </Box>
          </Paper>
        )}
      </Container>
    );
  }

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Router>
        <Box sx={{ flexGrow: 1, minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
          <AppBar position="static" color="inherit" elevation={0}>
            <Toolbar>
              <Typography variant="h4" component="h1" sx={{ flexGrow: 1, fontWeight: 600 }}>
                Quick Navigation
              </Typography>
              <IconButton
                color="inherit"
                aria-label="GitHub repository"
                component="a"
                href="https://github.com/xwzy/QuickNav"
                target="_blank"
                rel="noopener noreferrer"
              >
                <GitHubIcon />
              </IconButton>
            </Toolbar>
          </AppBar>
          <Box component="main" sx={{ flexGrow: 1, bgcolor: 'background.default', py: 3 }}>
            <MainContent />
          </Box>
          <NavigationButton />
        </Box>
      </Router>
    </ThemeProvider>
  );
}

export default App;