import React, { useState, useEffect } from 'react';
import { Box, Typography, useTheme } from '@mui/material';
import { Responsive, WidthProvider } from 'react-grid-layout';
import BookmarksWidget from './widgets/BookmarksWidget';
import WeatherWidget from './widgets/WeatherWidget';
import ClockWidget from './widgets/ClockWidget';
import TasksWidget from './widgets/TasksWidget';
import NotesWidget from './widgets/NotesWidget';
import SystemWidget from './widgets/SystemWidget';
import * as api from '../api';
import 'react-grid-layout/css/styles.css';
import 'react-resizable/css/styles.css';

const ResponsiveGridLayout = WidthProvider(Responsive);

const DashboardView = () => {
  const theme = useTheme();
  const [widgets, setWidgets] = useState([]);
  const [layouts, setLayouts] = useState({});

  useEffect(() => {
    loadWidgets();
  }, []);

  const loadWidgets = async () => {
    try {
      const widgetsData = await api.fetchWidgets();
      setWidgets(widgetsData);
      
      // Convert widget positions to layout format
      const layoutData = {};
      const breakpoints = ['lg', 'md', 'sm', 'xs', 'xxs'];
      
      breakpoints.forEach(breakpoint => {
        layoutData[breakpoint] = widgetsData.map(widget => {
          const position = JSON.parse(widget.position);
          const size = JSON.parse(widget.size);
          return {
            i: widget.id.toString(),
            x: position.x || 0,
            y: position.y || 0,
            w: size.w || 4,
            h: size.h || 4,
            minW: 2,
            minH: 2,
          };
        });
      });
      
      setLayouts(layoutData);
    } catch (error) {
      console.error('Failed to load widgets:', error);
    }
  };

  const handleLayoutChange = async (layout, layouts) => {
    setLayouts(layouts);
    
    // Save widget positions
    try {
      for (const item of layout) {
        const widget = widgets.find(w => w.id.toString() === item.i);
        if (widget) {
          const position = { x: item.x, y: item.y };
          const size = { w: item.w, h: item.h };
          const config = JSON.parse(widget.config);
          
          await api.updateWidget(widget.id, position, size, config);
        }
      }
    } catch (error) {
      console.error('Failed to save widget positions:', error);
    }
  };

  const renderWidget = (widget) => {
    const config = JSON.parse(widget.config);
    
    switch (widget.type) {
      case 'bookmarks':
        return <BookmarksWidget key={widget.id} config={config} />;
      case 'weather':
        return <WeatherWidget key={widget.id} config={config} />;
      case 'clock':
        return <ClockWidget key={widget.id} config={config} />;
      case 'tasks':
        return <TasksWidget key={widget.id} config={config} />;
      case 'notes':
        return <NotesWidget key={widget.id} config={config} />;
      case 'system':
        return <SystemWidget key={widget.id} config={config} />;
      default:
        return (
          <Box key={widget.id} sx={{ p: 2 }}>
            <Typography>Unknown widget type: {widget.type}</Typography>
          </Box>
        );
    }
  };

  return (
    <Box sx={{ width: '100%', minHeight: '100vh' }}>
      <Typography variant="h4" component="h1" gutterBottom sx={{ mb: 3 }}>
        Dashboard
      </Typography>
      
      <ResponsiveGridLayout
        className="layout"
        layouts={layouts}
        onLayoutChange={handleLayoutChange}
        breakpoints={{ lg: 1200, md: 996, sm: 768, xs: 480, xxs: 0 }}
        cols={{ lg: 12, md: 10, sm: 6, xs: 4, xxs: 2 }}
        rowHeight={60}
        margin={[16, 16]}
        containerPadding={[0, 0]}
        isDraggable={true}
        isResizable={true}
        style={{
          background: theme.palette.background.default,
        }}
      >
        {widgets.map(widget => (
          <Box
            key={widget.id.toString()}
            sx={{
              backgroundColor: theme.palette.background.paper,
              borderRadius: 2,
              boxShadow: theme.shadows[2],
              overflow: 'hidden',
              border: `1px solid ${theme.palette.divider}`,
            }}
          >
            {renderWidget(widget)}
          </Box>
        ))}
      </ResponsiveGridLayout>
    </Box>
  );
};

export default DashboardView;