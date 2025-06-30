import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
  Avatar,
  IconButton,
  Chip,
  useTheme,
} from '@mui/material';
import { Launch, Bookmark } from '@mui/icons-material';
import * as api from '../../api';

const BookmarksWidget = ({ config = {} }) => {
  const theme = useTheme();
  const [sites, setSites] = useState([]);
  const [categories, setCategories] = useState([]);
  
  const { showRecent = true, maxItems = 8 } = config;

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [sitesData, categoriesData] = await Promise.all([
        api.fetchSites(),
        api.fetchCategories(),
      ]);
      setSites(sitesData);
      setCategories(categoriesData);
    } catch (error) {
      console.error('Failed to load bookmarks:', error);
    }
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

  const getCategoryColor = (categoryId) => {
    const category = categories.find(cat => cat.id === categoryId);
    return category ? category.color : theme.palette.primary.main;
  };

  // Get sites to display (most visited or most recent)
  const displaySites = showRecent 
    ? sites.slice(0, maxItems)
    : sites.sort((a, b) => (b.visit_count || 0) - (a.visit_count || 0)).slice(0, maxItems);

  return (
    <Box sx={{ p: 2, height: '100%', display: 'flex', flexDirection: 'column' }}>
      <Typography variant="h6" component="h3" sx={{ mb: 1, fontWeight: 600 }}>
        Quick Access
      </Typography>
      
      <List sx={{ flexGrow: 1, overflow: 'auto', py: 0 }}>
        {displaySites.map((site) => (
          <ListItem
            key={site.id}
            sx={{
              px: 0,
              py: 0.5,
              cursor: 'pointer',
              borderRadius: 1,
              '&:hover': {
                backgroundColor: theme.palette.action.hover,
              },
            }}
            onClick={() => handleSiteClick(site)}
          >
            <ListItemAvatar>
              <Avatar
                sx={{
                  bgcolor: getCategoryColor(site.category_id),
                  width: 32,
                  height: 32,
                }}
              >
                <Bookmark fontSize="small" />
              </Avatar>
            </ListItemAvatar>
            <ListItemText
              primary={
                <Typography variant="body2" noWrap>
                  {site.name}
                </Typography>
              }
              secondary={
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                  <Typography variant="caption" color="text.secondary" noWrap sx={{ flexGrow: 1 }}>
                    {new URL(site.url).hostname}
                  </Typography>
                  {site.visit_count > 0 && (
                    <Chip 
                      label={site.visit_count} 
                      size="small" 
                      sx={{ height: 16, fontSize: '0.6rem' }}
                    />
                  )}
                </Box>
              }
            />
            <IconButton
              size="small"
              onClick={(e) => {
                e.stopPropagation();
                window.open(site.url, '_blank');
              }}
            >
              <Launch fontSize="small" />
            </IconButton>
          </ListItem>
        ))}
      </List>
      
      {displaySites.length === 0 && (
        <Box sx={{ textAlign: 'center', py: 4 }}>
          <Typography variant="body2" color="text.secondary">
            No bookmarks yet
          </Typography>
        </Box>
      )}
    </Box>
  );
};

export default BookmarksWidget;