import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  LinearProgress,
  Grid,
  useTheme,
} from '@mui/material';
import { Memory, Storage, Speed } from '@mui/icons-material';
import * as api from '../../api';

const SystemWidget = ({ config = {} }) => {
  const theme = useTheme();
  const [systemInfo, setSystemInfo] = useState(null);
  const [loading, setLoading] = useState(true);
  const { showCPU = true, showMemory = true, showDisk = true } = config;

  useEffect(() => {
    loadSystemInfo();
    const interval = setInterval(loadSystemInfo, 5000); // Update every 5 seconds
    return () => clearInterval(interval);
  }, []);

  const loadSystemInfo = async () => {
    try {
      const sysInfo = await api.getSystemInfo();
      setSystemInfo(sysInfo);
    } catch (error) {
      console.error('Failed to load system info:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatBytes = (bytes) => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
  };

  const getProgressColor = (percentage) => {
    if (percentage < 50) return 'success';
    if (percentage < 80) return 'warning';
    return 'error';
  };

  if (loading) {
    return (
      <Box sx={{ p: 2, height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <Typography variant="body2" color="text.secondary">
          Loading system info...
        </Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ p: 2, height: '100%', display: 'flex', flexDirection: 'column' }}>
      <Typography variant="h6" component="h3" sx={{ mb: 2, fontWeight: 600 }}>
        System Info
      </Typography>
      
      <Box sx={{ flexGrow: 1, display: 'flex', flexDirection: 'column', justifyContent: 'space-around' }}>
        {showCPU && systemInfo?.cpu !== undefined && (
          <Box sx={{ mb: 2 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
              <Speed sx={{ mr: 1, fontSize: 18 }} />
              <Typography variant="body2" sx={{ fontWeight: 500 }}>
                CPU
              </Typography>
              <Typography variant="body2" sx={{ ml: 'auto' }}>
                {Math.round(systemInfo.cpu)}%
              </Typography>
            </Box>
            <LinearProgress
              variant="determinate"
              value={systemInfo.cpu}
              color={getProgressColor(systemInfo.cpu)}
              sx={{ height: 6, borderRadius: 3 }}
            />
          </Box>
        )}

        {showMemory && systemInfo?.memory && (
          <Box sx={{ mb: 2 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
              <Memory sx={{ mr: 1, fontSize: 18 }} />
              <Typography variant="body2" sx={{ fontWeight: 500 }}>
                Memory
              </Typography>
              <Typography variant="body2" sx={{ ml: 'auto' }}>
                {Math.round(systemInfo.memory.percent)}%
              </Typography>
            </Box>
            <LinearProgress
              variant="determinate"
              value={systemInfo.memory.percent}
              color={getProgressColor(systemInfo.memory.percent)}
              sx={{ height: 6, borderRadius: 3 }}
            />
            <Typography variant="caption" color="text.secondary" sx={{ mt: 0.5, display: 'block' }}>
              {formatBytes(systemInfo.memory.used)} / {formatBytes(systemInfo.memory.total)}
            </Typography>
          </Box>
        )}

        {showDisk && systemInfo?.disk && (
          <Box>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
              <Storage sx={{ mr: 1, fontSize: 18 }} />
              <Typography variant="body2" sx={{ fontWeight: 500 }}>
                Disk
              </Typography>
              <Typography variant="body2" sx={{ ml: 'auto' }}>
                {Math.round(systemInfo.disk.percent)}%
              </Typography>
            </Box>
            <LinearProgress
              variant="determinate"
              value={systemInfo.disk.percent}
              color={getProgressColor(systemInfo.disk.percent)}
              sx={{ height: 6, borderRadius: 3 }}
            />
            <Typography variant="caption" color="text.secondary" sx={{ mt: 0.5, display: 'block' }}>
              {formatBytes(systemInfo.disk.used)} / {formatBytes(systemInfo.disk.total)}
            </Typography>
          </Box>
        )}
      </Box>

      {!systemInfo && (
        <Box sx={{ textAlign: 'center', py: 4 }}>
          <Typography variant="body2" color="text.secondary">
            System info unavailable
          </Typography>
        </Box>
      )}
    </Box>
  );
};

export default SystemWidget;