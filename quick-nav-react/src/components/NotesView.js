import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
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
  Grid,
  InputAdornment,
  Fab,
  useTheme,
} from '@mui/material';
import {
  Add,
  Edit,
  Delete,
  Search,
  Note,
} from '@mui/icons-material';
import * as api from '../api';

const NotesView = () => {
  const theme = useTheme();
  const [notes, setNotes] = useState([]);
  const [filteredNotes, setFilteredNotes] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingNote, setEditingNote] = useState(null);
  const [noteForm, setNoteForm] = useState({
    title: '',
    content: '',
    tags: '',
  });

  useEffect(() => {
    loadNotes();
  }, []);

  useEffect(() => {
    filterNotes();
  }, [notes, searchTerm]);

  const loadNotes = async () => {
    try {
      const notesData = await api.fetchNotes();
      setNotes(notesData);
    } catch (error) {
      console.error('Failed to load notes:', error);
    }
  };

  const filterNotes = () => {
    let filtered = notes;

    if (searchTerm) {
      filtered = filtered.filter(
        note =>
          note.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
          note.content.toLowerCase().includes(searchTerm.toLowerCase()) ||
          note.tags.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    setFilteredNotes(filtered);
  };

  const handleAddNote = () => {
    setEditingNote(null);
    setNoteForm({
      title: '',
      content: '',
      tags: '',
    });
    setDialogOpen(true);
  };

  const handleEditNote = (note) => {
    setEditingNote(note);
    setNoteForm({
      title: note.title,
      content: note.content,
      tags: note.tags,
    });
    setDialogOpen(true);
  };

  const handleDeleteNote = async (noteId) => {
    if (window.confirm('Are you sure you want to delete this note?')) {
      try {
        await api.deleteNote(noteId);
        loadNotes();
      } catch (error) {
        console.error('Failed to delete note:', error);
      }
    }
  };

  const handleSaveNote = async () => {
    try {
      if (editingNote) {
        await api.updateNote(
          editingNote.id,
          noteForm.title,
          noteForm.content,
          noteForm.tags
        );
      } else {
        await api.addNote(
          noteForm.title,
          noteForm.content,
          noteForm.tags
        );
      }
      setDialogOpen(false);
      loadNotes();
    } catch (error) {
      console.error('Failed to save note:', error);
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString() + ' ' + date.toLocaleTimeString();
  };

  const renderTags = (tags) => {
    if (!tags) return null;
    return tags.split(',').map((tag, index) => (
      <Chip key={index} label={tag.trim()} size="small" sx={{ mr: 0.5, mb: 0.5 }} />
    ));
  };

  const truncateContent = (content, maxLength = 200) => {
    if (content.length <= maxLength) return content;
    return content.substring(0, maxLength) + '...';
  };

  return (
    <Box sx={{ width: '100%' }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4" component="h1">
          Notes
        </Typography>
        <Button
          variant="contained"
          startIcon={<Add />}
          onClick={handleAddNote}
        >
          Add Note
        </Button>
      </Box>

      {/* Search Control */}
      <Box sx={{ mb: 3 }}>
        <TextField
          placeholder="Search notes..."
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

      {/* Notes Grid */}
      <Grid container spacing={3}>
        {filteredNotes.map(note => (
          <Grid item xs={12} sm={6} md={4} key={note.id}>
            <Card
              sx={{
                height: '100%',
                display: 'flex',
                flexDirection: 'column',
                '&:hover': {
                  boxShadow: theme.shadows[4],
                },
              }}
            >
              <CardContent sx={{ flexGrow: 1 }}>
                <Typography variant="h6" component="h3" gutterBottom>
                  {note.title}
                </Typography>
                
                {note.content && (
                  <Typography
                    variant="body2"
                    color="text.secondary"
                    sx={{ mb: 2 }}
                  >
                    {truncateContent(note.content)}
                  </Typography>
                )}
                
                {note.tags && (
                  <Box sx={{ mb: 2 }}>
                    {renderTags(note.tags)}
                  </Box>
                )}
                
                <Typography variant="caption" color="text.secondary">
                  Updated: {formatDate(note.updated_at)}
                </Typography>
              </CardContent>
              
              <CardActions sx={{ justifyContent: 'space-between' }}>
                <IconButton
                  size="small"
                  onClick={() => handleEditNote(note)}
                >
                  <Edit />
                </IconButton>
                <IconButton
                  size="small"
                  onClick={() => handleDeleteNote(note.id)}
                >
                  <Delete />
                </IconButton>
              </CardActions>
            </Card>
          </Grid>
        ))}
      </Grid>

      {filteredNotes.length === 0 && (
        <Box sx={{ textAlign: 'center', py: 8 }}>
          <Note sx={{ fontSize: 64, color: 'text.secondary', mb: 2 }} />
          <Typography variant="h6" color="text.secondary" gutterBottom>
            {searchTerm ? 'No notes found' : 'No notes yet'}
          </Typography>
          {!searchTerm && (
            <Button
              variant="contained"
              startIcon={<Add />}
              onClick={handleAddNote}
              sx={{ mt: 2 }}
            >
              Create your first note
            </Button>
          )}
        </Box>
      )}

      {/* Add/Edit Dialog */}
      <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)} maxWidth="md" fullWidth>
        <DialogTitle>
          {editingNote ? 'Edit Note' : 'Add New Note'}
        </DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            label="Title"
            fullWidth
            variant="outlined"
            value={noteForm.title}
            onChange={(e) => setNoteForm({ ...noteForm, title: e.target.value })}
            sx={{ mb: 2 }}
          />
          <TextField
            margin="dense"
            label="Content"
            fullWidth
            multiline
            rows={8}
            variant="outlined"
            value={noteForm.content}
            onChange={(e) => setNoteForm({ ...noteForm, content: e.target.value })}
            sx={{ mb: 2 }}
          />
          <TextField
            margin="dense"
            label="Tags (comma-separated)"
            fullWidth
            variant="outlined"
            value={noteForm.tags}
            onChange={(e) => setNoteForm({ ...noteForm, tags: e.target.value })}
            placeholder="work, personal, ideas"
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDialogOpen(false)}>Cancel</Button>
          <Button onClick={handleSaveNote} variant="contained">
            {editingNote ? 'Update' : 'Add'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default NotesView;