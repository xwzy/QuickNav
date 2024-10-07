import React, { useState } from 'react';
import { TextField, Button, Box } from '@mui/material';

const AddCategoryForm = ({ addCategory }) => {
    const [name, setName] = useState('');

    const handleSubmit = (e) => {
        e.preventDefault();
        if (name.trim()) {
            addCategory(name);
            setName('');
        }
    };

    return (
        <Box component="form" onSubmit={handleSubmit} sx={{ display: 'flex', gap: 2 }}>
            <TextField
                fullWidth
                variant="outlined"
                size="small"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="New category name"
            />
            <Button type="submit" variant="contained" color="primary" sx={{ width: '200px' }}>
                Add Category
            </Button>
        </Box>
    );
};

export default AddCategoryForm;