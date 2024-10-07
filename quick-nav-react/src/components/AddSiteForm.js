import React, { useState } from 'react';
import { TextField, Button, Box, MenuItem } from '@mui/material';

const AddSiteForm = ({ addSite, categories }) => {
    const [name, setName] = useState('');
    const [url, setUrl] = useState('');
    const [categoryId, setCategoryId] = useState('');

    const handleSubmit = (e) => {
        e.preventDefault();
        if (name.trim() && url.trim() && categoryId) {
            addSite({ name, url, category_id: categoryId });
            setName('');
            setUrl('');
            setCategoryId('');
        }
    };

    return (
        <Box component="form" onSubmit={handleSubmit} sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            <TextField
                fullWidth
                variant="outlined"
                size="small"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Site name"
            />
            <TextField
                fullWidth
                variant="outlined"
                size="small"
                type="url"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                placeholder="Site URL"
            />
            <TextField
                select
                fullWidth
                variant="outlined"
                size="small"
                value={categoryId}
                onChange={(e) => setCategoryId(e.target.value)}
                placeholder="Select a category"
            >
                <MenuItem value="">
                    <em>Select a category</em>
                </MenuItem>
                {categories.map((category) => (
                    <MenuItem key={category.id} value={category.id}>
                        {category.name}
                    </MenuItem>
                ))}
            </TextField>
            <Button type="submit" variant="contained" color="primary">
                Add Site
            </Button>
        </Box>
    );
};

export default AddSiteForm;