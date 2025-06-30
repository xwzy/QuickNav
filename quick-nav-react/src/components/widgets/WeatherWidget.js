import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Avatar,
  useTheme,
} from '@mui/material';
import { WbSunny, Cloud, CloudQueue, Grain } from '@mui/icons-material';
import * as api from '../../api';

const WeatherWidget = ({ config = {} }) => {
  const theme = useTheme();
  const [weather, setWeather] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadWeather();
    const interval = setInterval(loadWeather, 300000); // Update every 5 minutes
    return () => clearInterval(interval);
  }, []);

  const loadWeather = async () => {
    try {
      const weatherData = await api.getWeather();
      setWeather(weatherData);
    } catch (error) {
      console.error('Failed to load weather:', error);
    } finally {
      setLoading(false);
    }
  };

  const getWeatherIcon = (description) => {
    const desc = description?.toLowerCase() || '';
    if (desc.includes('sunny') || desc.includes('clear')) return WbSunny;
    if (desc.includes('cloud')) return Cloud;
    if (desc.includes('rain')) return Grain;
    return CloudQueue;
  };

  const WeatherIcon = weather ? getWeatherIcon(weather.description) : CloudQueue;

  if (loading) {
    return (
      <Box sx={{ p: 2, height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <Typography variant="body2" color="text.secondary">
          Loading weather...
        </Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ p: 2, height: '100%', display: 'flex', flexDirection: 'column' }}>
      <Typography variant="h6" component="h3" sx={{ mb: 2, fontWeight: 600 }}>
        Weather
      </Typography>
      
      {weather ? (
        <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', flexGrow: 1, justifyContent: 'center' }}>
          <Avatar
            sx={{
              bgcolor: theme.palette.primary.main,
              width: 60,
              height: 60,
              mb: 2,
            }}
          >
            <WeatherIcon sx={{ fontSize: 32 }} />
          </Avatar>
          
          <Typography variant="h3" component="div" sx={{ mb: 1, fontWeight: 300 }}>
            {Math.round(weather.temperature)}°
          </Typography>
          
          <Typography variant="body1" color="text.secondary" sx={{ mb: 1, textAlign: 'center' }}>
            {weather.description}
          </Typography>
          
          <Typography variant="caption" color="text.secondary">
            Humidity: {weather.humidity}%
          </Typography>
          
          <Typography variant="caption" color="text.secondary" sx={{ mt: 1 }}>
            {weather.location}
          </Typography>
        </Box>
      ) : (
        <Box sx={{ textAlign: 'center', py: 4 }}>
          <Typography variant="body2" color="text.secondary">
            Weather unavailable
          </Typography>
        </Box>
      )}
    </Box>
  );
};

export default WeatherWidget;