import React, { useState } from 'react';
import {
    Grid, Card, CardContent, Typography, Link, IconButton, TextField, Box
} from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import SaveIcon from '@mui/icons-material/Save';
import CancelIcon from '@mui/icons-material/Cancel';
import ArrowUpwardIcon from '@mui/icons-material/ArrowUpward';
import ArrowDownwardIcon from '@mui/icons-material/ArrowDownward';
import { updateCategoriesOrder } from '../api';

function EditableCategoryList({ categories, sites, updateCategory, deleteCategory, updateSite, deleteSite, onCategoriesOrderChange, isEditable }) {
    const [editingCategory, setEditingCategory] = useState(null);
    const [editedCategoryName, setEditedCategoryName] = useState('');

    const handleEditCategory = (category) => {
        setEditingCategory(category.id);
        setEditedCategoryName(category.name);
    };

    const handleSaveCategory = (id) => {
        updateCategory(id, editedCategoryName);
        setEditingCategory(null);
        setEditedCategoryName('');
    };

    const handleCancelEdit = () => {
        setEditingCategory(null);
        setEditedCategoryName('');
    };

    const handleMoveCategory = async (categoryId, direction) => {
        const currentIndex = categories.findIndex(category => category.id === categoryId);
        const newIndex = direction === 'up' ? currentIndex - 1 : currentIndex + 1;
        if (newIndex >= 0 && newIndex < categories.length) {
            const newCategories = [...categories];
            const [movedCategory] = newCategories.splice(currentIndex, 1);
            newCategories.splice(newIndex, 0, movedCategory);

            // Update the order property for each category
            const updatedCategories = newCategories.map((category, index) => ({
                ...category,
                order: index + 1
            }));

            const success = await updateCategoriesOrder(updatedCategories);
            if (success) {
                console.log('Categories order updated successfully');
                // Call the callback function to trigger data refresh
                onCategoriesOrderChange();
            }
        }
    };

    return (
        <Grid container spacing={2}>
            {categories.map((category, index) => (
                <Grid item xs={12} sm={6} md={4} key={category.id}>
                    <Card>
                        <CardContent>
                            <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
                                {editingCategory === category.id ? (
                                    <TextField
                                        fullWidth
                                        value={editedCategoryName}
                                        onChange={(e) => setEditedCategoryName(e.target.value)}
                                        variant="outlined"
                                        size="small"
                                    />
                                ) : (
                                    <Typography variant="h6" component="div">
                                        {category.name}
                                    </Typography>
                                )}
                                {isEditable && (
                                    <Box>
                                        {editingCategory === category.id ? (
                                            <>
                                                <IconButton size="small" onClick={() => handleSaveCategory(category.id)}>
                                                    <SaveIcon />
                                                </IconButton>
                                                <IconButton size="small" onClick={handleCancelEdit}>
                                                    <CancelIcon />
                                                </IconButton>
                                            </>
                                        ) : (
                                            <>
                                                <IconButton size="small" onClick={() => handleEditCategory(category)}>
                                                    <EditIcon />
                                                </IconButton>
                                                <IconButton size="small" onClick={() => deleteCategory(category.id)}>
                                                    <DeleteIcon />
                                                </IconButton>
                                                <IconButton size="small" onClick={() => handleMoveCategory(category.id, 'up')} disabled={index === 0}>
                                                    <ArrowUpwardIcon />
                                                </IconButton>
                                                <IconButton size="small" onClick={() => handleMoveCategory(category.id, 'down')} disabled={index === categories.length - 1}>
                                                    <ArrowDownwardIcon />
                                                </IconButton>
                                            </>
                                        )}
                                    </Box>
                                )}
                            </Box>
                            {Array.isArray(sites) && sites.filter(site => site.category_id === category.id).map((site) => (
                                <Box key={site.id} display="flex" alignItems="center" mt={1}>
                                    <Link
                                        href={site.url}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        display="block"
                                        sx={{ flexGrow: 1 }}
                                    >
                                        <Typography variant="body2">
                                            {site.name}
                                        </Typography>
                                    </Link>
                                    {isEditable && (
                                        <>
                                            <IconButton size="small" onClick={() => updateSite(site.id)}>
                                                <EditIcon fontSize="small" />
                                            </IconButton>
                                            <IconButton size="small" onClick={() => deleteSite(site.id)}>
                                                <DeleteIcon fontSize="small" />
                                            </IconButton>
                                        </>
                                    )}
                                </Box>
                            ))}
                        </CardContent>
                    </Card>
                </Grid>
            ))}
        </Grid>
    );
}

export default EditableCategoryList;