import { createTheme } from '@mui/material/styles';

const baseTheme = {
    typography: {
        fontFamily: '"Inter", "Roboto", "Helvetica", "Arial", sans-serif',
        h1: {
            fontWeight: 700,
        },
        h2: {
            fontWeight: 600,
        },
        h3: {
            fontWeight: 600,
        },
        h4: {
            fontWeight: 600,
        },
        h5: {
            fontWeight: 500,
        },
        h6: {
            fontWeight: 500,
        },
    },
    shape: {
        borderRadius: 12,
    },
    components: {
        MuiCard: {
            styleOverrides: {
                root: {
                    boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
                    borderRadius: 12,
                },
            },
        },
        MuiButton: {
            styleOverrides: {
                root: {
                    textTransform: 'none',
                    fontWeight: 500,
                    borderRadius: 8,
                },
            },
        },
        MuiChip: {
            styleOverrides: {
                root: {
                    borderRadius: 8,
                },
            },
        },
    },
};

export const lightTheme = createTheme({
    ...baseTheme,
    palette: {
        mode: 'light',
        primary: {
            main: '#1976d2',
            light: '#42a5f5',
            dark: '#1565c0',
        },
        secondary: {
            main: '#dc004e',
            light: '#ff5983',
            dark: '#9a0036',
        },
        background: {
            default: '#f5f5f5',
            paper: '#ffffff',
        },
        text: {
            primary: '#1a1a1a',
            secondary: '#666666',
        },
        divider: '#e0e0e0',
        success: {
            main: '#2e7d32',
        },
        warning: {
            main: '#ed6c02',
        },
        error: {
            main: '#d32f2f',
        },
        info: {
            main: '#0288d1',
        },
    },
});

export const darkTheme = createTheme({
    ...baseTheme,
    palette: {
        mode: 'dark',
        primary: {
            main: '#90caf9',
            light: '#e3f2fd',
            dark: '#42a5f5',
        },
        secondary: {
            main: '#f48fb1',
            light: '#fce4ec',
            dark: '#f06292',
        },
        background: {
            default: '#121212',
            paper: '#1e1e1e',
        },
        text: {
            primary: '#ffffff',
            secondary: '#b3b3b3',
        },
        divider: '#333333',
        success: {
            main: '#66bb6a',
        },
        warning: {
            main: '#ffa726',
        },
        error: {
            main: '#f44336',
        },
        info: {
            main: '#29b6f6',
        },
    },
});

// Widget color schemes
export const widgetColors = {
    light: {
        bookmarks: '#1976d2',
        weather: '#2e7d32',
        clock: '#7b1fa2',
        tasks: '#d32f2f',
        notes: '#f57c00',
        system: '#455a64',
        calendar: '#1976d2',
        calculator: '#9c27b0',
    },
    dark: {
        bookmarks: '#90caf9',
        weather: '#66bb6a',
        clock: '#ba68c8',
        tasks: '#f44336',
        notes: '#ffb74d',
        system: '#78909c',
        calendar: '#90caf9',
        calculator: '#ce93d8',
    },
};

export default lightTheme;