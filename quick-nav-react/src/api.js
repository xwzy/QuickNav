const API_BASE_URL = '/api';

// Helper function for API calls
const apiCall = async (endpoint, options = {}) => {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
        headers: {
            'Content-Type': 'application/json',
            ...options.headers,
        },
        ...options,
    });
    
    if (!response.ok) {
        throw new Error(`API call failed: ${response.statusText}`);
    }
    
    const text = await response.text();
    return text ? JSON.parse(text) : {};
};

// Categories API
export const fetchCategories = async () => {
    return await apiCall('/categories');
};

export const addCategory = async (name, color = '#1976d2', icon = 'folder') => {
    await apiCall('/categories', {
        method: 'POST',
        body: JSON.stringify({ name, color, icon }),
    });
    return true;
};

export const updateCategory = async (id, name, color, icon) => {
    await apiCall('/categories', {
        method: 'PUT',
        body: JSON.stringify({ id, name, color, icon }),
    });
    return true;
};

export const deleteCategory = async (id) => {
    await apiCall(`/categories?id=${id}`, {
        method: 'DELETE',
    });
    return true;
};

export const updateCategoriesOrder = async (categories) => {
    await apiCall('/categories/order', {
        method: 'PUT',
        body: JSON.stringify(categories),
    });
    return true;
};

// Sites/Bookmarks API
export const fetchSites = async () => {
    return await apiCall('/sites');
};

export const addSite = async (name, url, categoryId, tags = '') => {
    await apiCall('/sites', {
        method: 'POST',
        body: JSON.stringify({ 
            name, 
            url, 
            category_id: categoryId, 
            tags 
        }),
    });
    return true;
};

export const updateSite = async (id, name, url, categoryId, tags = '') => {
    await apiCall('/sites', {
        method: 'PUT',
        body: JSON.stringify({ 
            id, 
            name, 
            url, 
            category_id: categoryId, 
            tags 
        }),
    });
    return true;
};

export const deleteSite = async (id) => {
    await apiCall(`/sites?id=${id}`, {
        method: 'DELETE',
    });
    return true;
};

export const getSiteTitle = async (url) => {
    return await apiCall(`/sites/title?url=${encodeURIComponent(url)}`);
};

export const visitSite = async (id) => {
    await apiCall(`/sites/visit?id=${id}`, {
        method: 'POST',
    });
    return true;
};

// Notes API
export const fetchNotes = async () => {
    return await apiCall('/notes');
};

export const addNote = async (title, content = '', tags = '') => {
    await apiCall('/notes', {
        method: 'POST',
        body: JSON.stringify({ title, content, tags }),
    });
    return true;
};

export const updateNote = async (id, title, content, tags = '') => {
    await apiCall('/notes', {
        method: 'PUT',
        body: JSON.stringify({ id, title, content, tags }),
    });
    return true;
};

export const deleteNote = async (id) => {
    await apiCall(`/notes?id=${id}`, {
        method: 'DELETE',
    });
    return true;
};

// Tasks API
export const fetchTasks = async () => {
    return await apiCall('/tasks');
};

export const addTask = async (title, description = '', priority = 1, dueDate = null) => {
    await apiCall('/tasks', {
        method: 'POST',
        body: JSON.stringify({ 
            title, 
            description, 
            priority, 
            due_date: dueDate 
        }),
    });
    return true;
};

export const updateTask = async (id, title, description, completed, priority, dueDate) => {
    await apiCall('/tasks', {
        method: 'PUT',
        body: JSON.stringify({ 
            id, 
            title, 
            description, 
            completed, 
            priority, 
            due_date: dueDate 
        }),
    });
    return true;
};

export const deleteTask = async (id) => {
    await apiCall(`/tasks?id=${id}`, {
        method: 'DELETE',
    });
    return true;
};

// Widgets API
export const fetchWidgets = async () => {
    return await apiCall('/widgets');
};

export const updateWidget = async (id, position, size, config) => {
    await apiCall('/widgets', {
        method: 'PUT',
        body: JSON.stringify({ 
            id, 
            position: JSON.stringify(position), 
            size: JSON.stringify(size), 
            config: JSON.stringify(config) 
        }),
    });
    return true;
};

// Settings API
export const getSettings = async () => {
    return await apiCall('/settings');
};

export const updateSetting = async (key, value) => {
    await apiCall('/settings', {
        method: 'PUT',
        body: JSON.stringify({ key, value }),
    });
    return true;
};

// System Info API
export const getSystemInfo = async () => {
    return await apiCall('/system');
};

// Weather API
export const getWeather = async () => {
    return await apiCall('/weather');
};

// Utility API
export const generatePassword = async (length = 12) => {
    return await apiCall(`/password?length=${length}`);
};

// Legacy function compatibility
export const updateCategoryOrder = async (id, newOrder) => {
    // This function is kept for backward compatibility
    const categories = await fetchCategories();
    const categoryToMove = categories.find(cat => cat.id === id);
    if (!categoryToMove) return false;
    
    const updatedCategories = categories.filter(cat => cat.id !== id);
    updatedCategories.splice(newOrder - 1, 0, { ...categoryToMove, order: newOrder });
    
    // Update order numbers
    updatedCategories.forEach((cat, index) => {
        cat.order = index + 1;
    });
    
    return await updateCategoriesOrder(updatedCategories);
};