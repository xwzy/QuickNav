import React, { useState, useEffect } from 'react';
import { Grid } from '@mui/material';
import { fetchCategories, fetchSites, updateCategoriesOrder, updateCategory as apiUpdateCategory, deleteCategory as apiDeleteCategory, updateSite as apiUpdateSite, deleteSite as apiDeleteSite } from '../api';
import EditableCategoryList from './EditableCategoryList';

const CategoryList = ({ isEditable }) => {
    const [categories, setCategories] = useState([]);
    const [sites, setSites] = useState([]);

    const loadData = async () => {
        const fetchedCategories = await fetchCategories();
        const fetchedSites = await fetchSites();
        setCategories(fetchedCategories);
        setSites(fetchedSites);
    };

    useEffect(() => {
        loadData();
    }, []);

    const handleCategoriesOrderChange = () => {
        loadData();
    };

    const updateCategory = async (id, name) => {
        const success = await apiUpdateCategory(id, name);
        if (success) {
            loadData();
        }
    };

    const deleteCategory = async (id) => {
        const success = await apiDeleteCategory(id);
        if (success) {
            loadData();
        }
    };

    const updateSite = async (id, name, url, categoryId) => {
        const success = await apiUpdateSite(id, name, url, categoryId);
        if (success) {
            loadData();
        }
    };

    const deleteSite = async (id) => {
        const success = await apiDeleteSite(id);
        if (success) {
            loadData();
        }
    };

    return (
        <Grid container spacing={2}>
            <EditableCategoryList
                categories={categories}
                sites={sites}
                updateCategory={updateCategory}
                deleteCategory={deleteCategory}
                updateSite={updateSite}
                deleteSite={deleteSite}
                onCategoriesOrderChange={handleCategoriesOrderChange}
                isEditable={isEditable}
            />
        </Grid>
    );
};

export default CategoryList;