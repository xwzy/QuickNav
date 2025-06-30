import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  useTheme,
} from '@mui/material';

const ClockWidget = ({ config = {} }) => {
  const theme = useTheme();
  const [time, setTime] = useState(new Date());
  const { format = '24h' } = config;

  useEffect(() => {
    const timer = setInterval(() => {
      setTime(new Date());
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const formatTime = (date) => {
    if (format === '12h') {
      return date.toLocaleTimeString('en-US', {
        hour: 'numeric',
        minute: '2-digit',
        hour12: true,
      });
    }
    return date.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: false,
    });
  };

  const formatDate = (date) => {
    return date.toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  return (
    <Box sx={{ p: 2, height: '100%', display: 'flex', flexDirection: 'column' }}>
      <Typography variant="h6" component="h3" sx={{ mb: 2, fontWeight: 600 }}>
        Clock
      </Typography>
      
      <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', flexGrow: 1, justifyContent: 'center', textAlign: 'center' }}>
        <Typography
          variant="h2"
          component="div"
          sx={{
            mb: 1,
            fontWeight: 300,
            fontFamily: 'monospace',
            fontSize: { xs: '2rem', sm: '2.5rem', md: '3rem' },
          }}
        >
          {formatTime(time)}
        </Typography>
        
        <Typography
          variant="body1"
          color="text.secondary"
          sx={{ mb: 1, fontSize: { xs: '0.8rem', sm: '1rem' } }}
        >
          {time.toLocaleDateString('en-US', {
            weekday: 'long',
            month: 'short',
            day: 'numeric',
          })}
        </Typography>
        
        <Typography variant="caption" color="text.secondary">
          {time.getFullYear()}
        </Typography>
      </Box>
    </Box>
  );
};

export default ClockWidget;