import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  List,
  ListItem,
  ListItemText,
  IconButton,
  useTheme,
} from '@mui/material';
import { Edit, Note } from '@mui/icons-material';
import * as api from '../../api';

const NotesWidget = ({ config = {} }) => {
  const theme = useTheme();
  const [notes, setNotes] = useState([]);
  const { maxItems = 3, showPreview = true } = config;

  useEffect(() => {
    loadNotes();
  }, []);

  const loadNotes = async () => {
    try {
      const notesData = await api.fetchNotes();
      setNotes(notesData);
    } catch (error) {
      console.error('Failed to load notes:', error);
    }
  };

  const truncateText = (text, maxLength = 100) => {
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength) + '...';
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = now - date;
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays === 0) return 'Today';
    if (diffDays === 1) return 'Yesterday';
    if (diffDays < 7) return `${diffDays} days ago`;
    return date.toLocaleDateString();
  };

  // Get recent notes
  const displayNotes = notes.slice(0, maxItems);

  return (
    <Box sx={{ p: 2, height: '100%', display: 'flex', flexDirection: 'column' }}>
      <Typography variant="h6" component="h3" sx={{ mb: 1, fontWeight: 600 }}>
        Quick Notes
      </Typography>
      
      <List sx={{ flexGrow: 1, overflow: 'auto', py: 0 }}>
        {displayNotes.map((note) => (
          <ListItem
            key={note.id}
            sx={{
              px: 0,
              py: 1,
              alignItems: 'flex-start',
              borderBottom: `1px solid ${theme.palette.divider}`,
              '&:last-child': {
                borderBottom: 'none',
              },
            }}
          >
            <ListItemText
              primary={
                <Typography variant="body2" sx={{ fontWeight: 500, mb: 0.5 }}>
                  {note.title}
                </Typography>
              }
              secondary={
                <Box>
                  {showPreview && note.content && (
                    <Typography
                      variant="caption"
                      color="text.secondary"
                      sx={{ display: 'block', mb: 0.5 }}
                    >
                      {truncateText(note.content, 80)}
                    </Typography>
                  )}
                  <Typography variant="caption" color="text.secondary">
                    {formatDate(note.updated_at)}
                  </Typography>
                </Box>
              }
            />
            <IconButton size="small" sx={{ mt: 0.5 }}>
              <Edit fontSize="small" />
            </IconButton>
          </ListItem>
        ))}
      </List>
      
      {displayNotes.length === 0 && (
        <Box sx={{ textAlign: 'center', py: 4 }}>
          <Typography variant="body2" color="text.secondary">
            No notes yet
          </Typography>
        </Box>
      )}
    </Box>
  );
};

export default NotesWidget;