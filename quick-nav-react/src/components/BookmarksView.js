import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Grid,
  Card,
  CardContent,
  CardActions,
  IconButton,
  Button,
  TextField,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Chip,
  Avatar,
  Menu,
  MenuItem,
  InputAdornment,
  Fab,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  useTheme,
} from '@mui/material';
import {
  Add,
  Edit,
  Delete,
  Link,
  Search,
  FilterList,
  ExpandMore,
  Launch,
  Bookmark,
} from '@mui/icons-material';
import * as api from '../api';

const BookmarksView = () => {
  const theme = useTheme();
  const [sites, setSites] = useState([]);
  const [categories, setCategories] = useState([]);
  const [filteredSites, setFilteredSites] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingSite, setEditingSite] = useState(null);
  const [siteForm, setSiteForm] = useState({
    name: '',
    url: '',
    category_id: '',
    tags: '',
  });

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    filterSites();
  }, [sites, searchTerm, selectedCategory]);

  const loadData = async () => {
    try {
      const [sitesData, categoriesData] = await Promise.all([
        api.fetchSites(),
        api.fetchCategories(),
      ]);
      setSites(sitesData);
      setCategories(categoriesData);
    } catch (error) {
      console.error('Failed to load data:', error);
    }
  };

  const filterSites = () => {
    let filtered = sites;

    if (searchTerm) {
      filtered = filtered.filter(
        site =>
          site.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          site.url.toLowerCase().includes(searchTerm.toLowerCase()) ||
          site.tags.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (selectedCategory) {
      filtered = filtered.filter(site => site.category_id.toString() === selectedCategory);
    }

    setFilteredSites(filtered);
  };

  const handleSiteClick = async (site) => {
    try {
      await api.visitSite(site.id);
      window.open(site.url, '_blank');
      loadData(); // Refresh to update visit count
    } catch (error) {
      console.error('Failed to record visit:', error);
      window.open(site.url, '_blank');
    }
  };

  const handleAddSite = () => {
    setEditingSite(null);
    setSiteForm({
      name: '',
      url: '',
      category_id: categories.length > 0 ? categories[0].id : '',
      tags: '',
    });
    setDialogOpen(true);
  };

  const handleEditSite = (site) => {
    setEditingSite(site);
    setSiteForm({
      name: site.name,
      url: site.url,
      category_id: site.category_id,
      tags: site.tags,
    });
    setDialogOpen(true);
  };

  const handleDeleteSite = async (siteId) => {
    if (window.confirm('Are you sure you want to delete this bookmark?')) {
      try {
        await api.deleteSite(siteId);
        loadData();
      } catch (error) {
        console.error('Failed to delete site:', error);
      }
    }
  };

  const handleSaveSite = async () => {
    try {
      if (editingSite) {
        await api.updateSite(
          editingSite.id,
          siteForm.name,
          siteForm.url,
          siteForm.category_id,
          siteForm.tags
        );
      } else {
        await api.addSite(
          siteForm.name,
          siteForm.url,
          siteForm.category_id,
          siteForm.tags
        );
      }
      setDialogOpen(false);
      loadData();
    } catch (error) {
      console.error('Failed to save site:', error);
    }
  };

  const getCategoryName = (categoryId) => {
    const category = categories.find(cat => cat.id === categoryId);
    return category ? category.name : 'Unknown';
  };

  const getCategoryColor = (categoryId) => {
    const category = categories.find(cat => cat.id === categoryId);
    return category ? category.color : theme.palette.primary.main;
  };

  const renderTags = (tags) => {
    if (!tags) return null;
    return tags.split(',').map((tag, index) => (
      <Chip key={index} label={tag.trim()} size="small" sx={{ mr: 0.5, mb: 0.5 }} />
    ));
  };

  const groupedSites = categories.map(category => ({
    ...category,
    sites: filteredSites.filter(site => site.category_id === category.id),
  }));

  return (
    <Box sx={{ width: '100%' }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4" component="h1">
          Bookmarks
        </Typography>
        <Button
          variant="contained"
          startIcon={<Add />}
          onClick={handleAddSite}
        >
          Add Bookmark
        </Button>
      </Box>

      {/* Search and Filter Controls */}
      <Box sx={{ mb: 3, display: 'flex', gap: 2, flexWrap: 'wrap' }}>
        <TextField
          placeholder="Search bookmarks..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <Search />
              </InputAdornment>
            ),
          }}
          sx={{ minWidth: 300 }}
        />
        <TextField
          select
          label="Category"
          value={selectedCategory}
          onChange={(e) => setSelectedCategory(e.target.value)}
          sx={{ minWidth: 150 }}
        >
          <MenuItem value="">All Categories</MenuItem>
          {categories.map(category => (
            <MenuItem key={category.id} value={category.id.toString()}>
              {category.name}
            </MenuItem>
          ))}
        </TextField>
      </Box>

      {/* Bookmarks by Category */}
      {groupedSites.map(category => (
        category.sites.length > 0 && (
          <Accordion key={category.id} defaultExpanded>
            <AccordionSummary expandIcon={<ExpandMore />}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Avatar
                  sx={{
                    bgcolor: category.color,
                    width: 24,
                    height: 24,
                    fontSize: '0.75rem',
                  }}
                >
                  {category.name.charAt(0).toUpperCase()}
                </Avatar>
                <Typography variant="h6">
                  {category.name} ({category.sites.length})
                </Typography>
              </Box>
            </AccordionSummary>
            <AccordionDetails>
              <Grid container spacing={2}>
                {category.sites.map(site => (
                  <Grid item xs={12} sm={6} md={4} lg={3} key={site.id}>
                    <Card
                      sx={{
                        height: '100%',
                        display: 'flex',
                        flexDirection: 'column',
                        cursor: 'pointer',
                        '&:hover': {
                          boxShadow: theme.shadows[4],
                        },
                      }}
                      onClick={() => handleSiteClick(site)}
                    >
                      <CardContent sx={{ flexGrow: 1, pb: 1 }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                          <Avatar
                            sx={{
                              bgcolor: getCategoryColor(site.category_id),
                              width: 32,
                              height: 32,
                              mr: 1,
                            }}
                          >
                            <Bookmark />
                          </Avatar>
                          <Typography variant="h6" component="h3" noWrap>
                            {site.name}
                          </Typography>
                        </Box>
                        <Typography
                          variant="body2"
                          color="text.secondary"
                          sx={{ mb: 1 }}
                          noWrap
                        >
                          {site.url}
                        </Typography>
                        {site.tags && (
                          <Box sx={{ mb: 1 }}>
                            {renderTags(site.tags)}
                          </Box>
                        )}
                        <Typography variant="caption" color="text.secondary">
                          Visits: {site.visit_count || 0}
                        </Typography>
                      </CardContent>
                      <CardActions sx={{ justifyContent: 'space-between', pt: 0 }}>
                        <IconButton
                          size="small"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleEditSite(site);
                          }}
                        >
                          <Edit />
                        </IconButton>
                        <IconButton
                          size="small"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDeleteSite(site.id);
                          }}
                        >
                          <Delete />
                        </IconButton>
                      </CardActions>
                    </Card>
                  </Grid>
                ))}
              </Grid>
            </AccordionDetails>
          </Accordion>
        )
      ))}

      {/* Add/Edit Dialog */}
      <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>
          {editingSite ? 'Edit Bookmark' : 'Add New Bookmark'}
        </DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            label="Name"
            fullWidth
            variant="outlined"
            value={siteForm.name}
            onChange={(e) => setSiteForm({ ...siteForm, name: e.target.value })}
            sx={{ mb: 2 }}
          />
          <TextField
            margin="dense"
            label="URL"
            fullWidth
            variant="outlined"
            value={siteForm.url}
            onChange={(e) => setSiteForm({ ...siteForm, url: e.target.value })}
            sx={{ mb: 2 }}
          />
          <TextField
            select
            margin="dense"
            label="Category"
            fullWidth
            variant="outlined"
            value={siteForm.category_id}
            onChange={(e) => setSiteForm({ ...siteForm, category_id: e.target.value })}
            sx={{ mb: 2 }}
          >
            {categories.map(category => (
              <MenuItem key={category.id} value={category.id}>
                {category.name}
              </MenuItem>
            ))}
          </TextField>
          <TextField
            margin="dense"
            label="Tags (comma-separated)"
            fullWidth
            variant="outlined"
            value={siteForm.tags}
            onChange={(e) => setSiteForm({ ...siteForm, tags: e.target.value })}
            placeholder="programming, tools, documentation"
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDialogOpen(false)}>Cancel</Button>
          <Button onClick={handleSaveSite} variant="contained">
            {editingSite ? 'Update' : 'Add'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default BookmarksView;