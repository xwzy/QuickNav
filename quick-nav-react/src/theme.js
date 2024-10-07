import { createTheme } from '@mui/material/styles';

const theme = createTheme({
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
            secondary: '#b0bec5',
        },
    },
    typography: {
        fontFamily: '"Poppins", "Roboto", "Helvetica", "Arial", sans-serif',
        h1: {
            fontWeight: 600,
            letterSpacing: '-0.5px',
            fontSize: '2.5rem', // 增加字体大小
        },
        h4: {
            fontWeight: 600,
            letterSpacing: '0.25px',
            fontSize: '2rem', // 增加字体大小
        },
        h6: {
            fontWeight: 500,
            letterSpacing: '0.15px',
            fontSize: '1.5rem', // 增加字体大小
        },
        body1: {
            letterSpacing: '0.5px',
            fontSize: '1.1rem', // 增加字体大小
        },
        body2: {
            fontSize: '1rem', // 增加字体大小
        },
        button: {
            letterSpacing: '1.25px',
            fontWeight: 500,
            fontSize: '1rem', // 增加字体大小
        },
    },
    shape: {
        borderRadius: 12,
    },
    components: {
        MuiButton: {
            styleOverrides: {
                root: {
                    textTransform: 'none',
                    padding: '8px 16px',
                },
                contained: {
                    boxShadow: 'none',
                    '&:hover': {
                        boxShadow: '0 2px 4px -1px rgba(0,0,0,0.2), 0 4px 5px 0 rgba(0,0,0,0.14), 0 1px 10px 0 rgba(0,0,0,0.12)',
                    },
                },
            },
        },
        MuiPaper: {
            styleOverrides: {
                root: {
                    backgroundImage: 'none',
                },
                elevation1: {
                    boxShadow: '0 1px 3px rgba(0,0,0,0.12), 0 1px 2px rgba(0,0,0,0.24)',
                },
                elevation2: {
                    boxShadow: '0 3px 6px rgba(0,0,0,0.16), 0 3px 6px rgba(0,0,0,0.23)',
                },
            },
        },
        MuiAppBar: {
            styleOverrides: {
                root: {
                    boxShadow: 'none',
                    borderBottom: '1px solid rgba(255, 255, 255, 0.12)',
                },
            },
        },
    },
});

export default theme;