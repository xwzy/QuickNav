import React, { useState, useEffect } from 'react';
import './App.css';
import CategoryList from './components/CategoryList';
import AddCategoryForm from './components/AddCategoryForm';
import AddSiteForm from './components/AddSiteForm';

function App() {
  const [categories, setCategories] = useState([]);
  const [sites, setSites] = useState([]);

  useEffect(() => {
    fetchCategories();
    fetchSites();
  }, []);

  const fetchCategories = async () => {
    const response = await fetch('/api/categories');
    const data = await response.json();
    setCategories(data);
  };

  const fetchSites = async () => {
    const response = await fetch('/api/sites');
    const data = await response.json();
    setSites(data);
  };

  const addCategory = async (name) => {
    const response = await fetch('/api/categories', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name }),
    });
    if (response.ok) {
      fetchCategories();
    }
  };

  const addSite = async (site) => {
    const response = await fetch('/api/sites', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(site),
    });
    if (response.ok) {
      fetchSites();
    }
  };

  const updateCategoryOrder = async (id, newOrder) => {
    const response = await fetch('/api/categories', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id, order: newOrder }),
    });
    if (response.ok) {
      fetchCategories();
    }
  };

  const updateCategory = async (id, name) => {
    const response = await fetch('/api/categories', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id, name }),
    });
    if (response.ok) {
      fetchCategories();
    }
  };

  const deleteCategory = async (id) => {
    const response = await fetch(`/api/categories?id=${id}`, {
      method: 'DELETE',
    });
    if (response.ok) {
      fetchCategories();
      fetchSites();
    }
  };

  const updateSite = async (site) => {
    const response = await fetch('/api/sites', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(site),
    });
    if (response.ok) {
      fetchSites();
    }
  };

  const deleteSite = async (id) => {
    const response = await fetch(`/api/sites?id=${id}`, {
      method: 'DELETE',
    });
    if (response.ok) {
      fetchSites();
    }
  };

  return (
    <div className="App">
      <header className="App-header">
        <h1>Quick Navigation</h1>
      </header>
      <main>
        <div className="forms-container">
          <AddCategoryForm addCategory={addCategory} />
          <AddSiteForm addSite={addSite} categories={categories} />
        </div>
        <CategoryList
          categories={categories}
          sites={sites}
          updateCategoryOrder={updateCategoryOrder}
          updateCategory={updateCategory}
          deleteCategory={deleteCategory}
          updateSite={updateSite}
          deleteSite={deleteSite}
        />
      </main>
    </div>
  );
}

export default App;
