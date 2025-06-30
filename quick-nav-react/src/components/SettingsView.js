import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Card,
  CardContent,
  CardHeader,
  Switch,
  FormControlLabel,
  TextField,
  Button,
  MenuItem,
  Grid,
  Divider,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  useTheme,
} from '@mui/material';
import {
  Settings,
  Backup,
  Download,
  Upload,
  VpnKey,
  Refresh,
} from '@mui/icons-material';
import * as api from '../api';

const SettingsView = ({ onSettingsChange }) => {
  const theme = useTheme();
  const [settings, setSettings] = useState({});
  const [passwordLength, setPasswordLength] = useState(12);
  const [generatedPassword, setGeneratedPassword] = useState('');
  const [passwordDialogOpen, setPasswordDialogOpen] = useState(false);

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      const settingsData = await api.getSettings();
      setSettings(settingsData);
    } catch (error) {
      console.error('Failed to load settings:', error);
    }
  };

  const updateSetting = async (key, value) => {
    try {
      await api.updateSetting(key, value);
      setSettings(prev => ({ ...prev, [key]: value }));
      if (onSettingsChange) {
        onSettingsChange();
      }
    } catch (error) {
      console.error('Failed to update setting:', error);
    }
  };

  const handleGeneratePassword = async () => {
    try {
      const response = await api.generatePassword(passwordLength);
      setGeneratedPassword(response.password);
      setPasswordDialogOpen(true);
    } catch (error) {
      console.error('Failed to generate password:', error);
    }
  };

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text).then(() => {
      // You could add a toast notification here
      console.log('Copied to clipboard');
    });
  };

  const exportData = async () => {
    try {
      // In a real implementation, you would create an export endpoint
      const [sites, categories, notes, tasks] = await Promise.all([
        api.fetchSites(),
        api.fetchCategories(),
        api.fetchNotes(),
        api.fetchTasks(),
      ]);

      const exportData = {
        export_date: new Date().toISOString(),
        version: '2.0.0',
        sites,
        categories,
        notes,
        tasks,
        settings,
      };

      const dataStr = JSON.stringify(exportData, null, 2);
      const dataBlob = new Blob([dataStr], { type: 'application/json' });
      const url = URL.createObjectURL(dataBlob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `dashboard-export-${new Date().toISOString().split('T')[0]}.json`;
      link.click();
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Failed to export data:', error);
    }
  };

  return (
    <Box sx={{ width: '100%' }}>
      <Typography variant="h4" component="h1" gutterBottom>
        Settings
      </Typography>

      <Grid container spacing={3}>
        {/* Appearance Settings */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardHeader title="Appearance" avatar={<Settings />} />
            <CardContent>
              <FormControlLabel
                control={
                  <Switch
                    checked={settings.theme === 'dark'}
                    onChange={(e) => updateSetting('theme', e.target.checked ? 'dark' : 'light')}
                  />
                }
                label="Dark Mode"
                sx={{ mb: 2 }}
              />
              
              <TextField
                select
                label="Layout"
                value={settings.layout || 'grid'}
                onChange={(e) => updateSetting('layout', e.target.value)}
                fullWidth
                sx={{ mb: 2 }}
              >
                <MenuItem value="grid">Grid Layout</MenuItem>
                <MenuItem value="list">List Layout</MenuItem>
              </TextField>

              <FormControlLabel
                control={
                  <Switch
                    checked={settings.show_visit_count === 'true'}
                    onChange={(e) => updateSetting('show_visit_count', e.target.checked ? 'true' : 'false')}
                  />
                }
                label="Show Visit Count"
                sx={{ mb: 2 }}
              />
            </CardContent>
          </Card>
        </Grid>

        {/* Dashboard Settings */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardHeader title="Dashboard" />
            <CardContent>
              <TextField
                select
                label="Default Category"
                value={settings.default_category || '1'}
                onChange={(e) => updateSetting('default_category', e.target.value)}
                fullWidth
                sx={{ mb: 2 }}
              >
                <MenuItem value="1">Development</MenuItem>
                <MenuItem value="2">Social</MenuItem>
                <MenuItem value="3">Entertainment</MenuItem>
                <MenuItem value="4">News</MenuItem>
                <MenuItem value="5">Shopping</MenuItem>
                <MenuItem value="6">Tools</MenuItem>
              </TextField>

              <FormControlLabel
                control={
                  <Switch
                    checked={settings.auto_backup === 'true'}
                    onChange={(e) => updateSetting('auto_backup', e.target.checked ? 'true' : 'false')}
                  />
                }
                label="Auto Backup"
                sx={{ mb: 2 }}
              />

              <FormControlLabel
                control={
                  <Switch
                    checked={settings.check_health === 'true'}
                    onChange={(e) => updateSetting('check_health', e.target.checked ? 'true' : 'false')}
                  />
                }
                label="Check Website Health"
              />
            </CardContent>
          </Card>
        </Grid>

        {/* Tools */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardHeader title="Tools" avatar={<VpnKey />} />
            <CardContent>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                Generate secure passwords
              </Typography>
              
              <TextField
                label="Password Length"
                type="number"
                value={passwordLength}
                onChange={(e) => setPasswordLength(parseInt(e.target.value))}
                inputProps={{ min: 8, max: 128 }}
                sx={{ mb: 2, width: '120px' }}
              />
              
              <Button
                variant="outlined"
                onClick={handleGeneratePassword}
                startIcon={<VpnKey />}
                fullWidth
              >
                Generate Password
              </Button>
            </CardContent>
          </Card>
        </Grid>

        {/* Data Management */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardHeader title="Data Management" avatar={<Backup />} />
            <CardContent>
              <Button
                variant="outlined"
                onClick={exportData}
                startIcon={<Download />}
                fullWidth
                sx={{ mb: 2 }}
              >
                Export Data
              </Button>
              
              <Button
                variant="outlined"
                startIcon={<Upload />}
                fullWidth
                sx={{ mb: 2 }}
                disabled
              >
                Import Data (Coming Soon)
              </Button>
              
              <Button
                variant="outlined"
                startIcon={<Refresh />}
                fullWidth
                onClick={() => window.location.reload()}
              >
                Refresh Application
              </Button>
            </CardContent>
          </Card>
        </Grid>

        {/* System Information */}
        <Grid item xs={12}>
          <Card>
            <CardHeader title="System Information" />
            <CardContent>
              <Grid container spacing={2}>
                <Grid item xs={12} sm={6} md={3}>
                  <Typography variant="body2" color="text.secondary">
                    Version
                  </Typography>
                  <Typography variant="body1">
                    2.0.0
                  </Typography>
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                  <Typography variant="body2" color="text.secondary">
                    Database
                  </Typography>
                  <Typography variant="body1">
                    SQLite
                  </Typography>
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                  <Typography variant="body2" color="text.secondary">
                    Backend
                  </Typography>
                  <Typography variant="body1">
                    Go 1.22+
                  </Typography>
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                  <Typography variant="body2" color="text.secondary">
                    Frontend
                  </Typography>
                  <Typography variant="body1">
                    React 18
                  </Typography>
                </Grid>
              </Grid>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Password Generation Dialog */}
      <Dialog open={passwordDialogOpen} onClose={() => setPasswordDialogOpen(false)}>
        <DialogTitle>Generated Password</DialogTitle>
        <DialogContent>
          <TextField
            fullWidth
            value={generatedPassword}
            InputProps={{
              readOnly: true,
            }}
            sx={{ mb: 2 }}
          />
          <Typography variant="body2" color="text.secondary">
            Click the button below to copy the password to your clipboard.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setPasswordDialogOpen(false)}>Close</Button>
          <Button 
            onClick={() => copyToClipboard(generatedPassword)} 
            variant="contained"
          >
            Copy to Clipboard
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default SettingsView;