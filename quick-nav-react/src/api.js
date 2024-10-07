const API_BASE_URL = '/api';

export const fetchCategories = async () => {
    const response = await fetch(`${API_BASE_URL}/categories`);
    return response.json();
};

export const fetchSites = async () => {
    const response = await fetch(`${API_BASE_URL}/sites`);
    return response.json();
};

export const addCategory = async (name) => {
    const response = await fetch(`${API_BASE_URL}/categories`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name }),
    });
    return response.ok;
};

export const addSite = async (site) => {
    const response = await fetch(`${API_BASE_URL}/sites`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(site),
    });
    return response.ok;
};

export const updateCategoriesOrder = async (categories) => {
    const response = await fetch(`${API_BASE_URL}/categories/order`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(categories),
    });
    return response.ok;
};

export const updateCategory = async (id, name) => {
    const response = await fetch(`${API_BASE_URL}/categories`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, name }),
    });
    return response.ok;
};

export const deleteCategory = async (id) => {
    const response = await fetch(`${API_BASE_URL}/categories?id=${id}`, {
        method: 'DELETE',
    });
    return response.ok;
};

export const updateSite = async (id, name, url, categoryId) => {
    const response = await fetch(`${API_BASE_URL}/sites`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, name, url, category_id: categoryId }),
    });
    return response.ok;
};

export const deleteSite = async (id) => {
    const response = await fetch(`${API_BASE_URL}/sites?id=${id}`, {
        method: 'DELETE',
    });
    return response.ok;
};

// Add this function to match the import in App.js
export const updateCategoryOrder = async (id, newOrder) => {
    const response = await fetch(`${API_BASE_URL}/categories`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, order: newOrder }),
    });
    return response.ok;
};