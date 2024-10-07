import React, { useState, useEffect } from 'react';
import './App.css';

function App() {
  const [categories, setCategories] = useState([]);
  const [sites, setSites] = useState([]);
  const [newCategory, setNewCategory] = useState('');
  const [newSite, setNewSite] = useState({ name: '', url: '', category_id: '' });

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

  const addCategory = async (e) => {
    e.preventDefault();
    const response = await fetch('/api/categories', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: newCategory }),
    });
    if (response.ok) {
      setNewCategory('');
      fetchCategories();
    }
  };

  const addSite = async (e) => {
    e.preventDefault();
    const response = await fetch('/api/sites', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(newSite),
    });
    if (response.ok) {
      setNewSite({ name: '', url: '', category_id: '' });
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

  return (
    <div className="App">
      <h1>Quick Navigation</h1>

      <h2>Add New Category</h2>
      <form onSubmit={addCategory}>
        <input
          type="text"
          value={newCategory}
          onChange={(e) => setNewCategory(e.target.value)}
          placeholder="Category Name"
          required
        />
        <button type="submit">Add Category</button>
      </form>

      <h2>Add New Site</h2>
      <form onSubmit={addSite}>
        <input
          type="text"
          value={newSite.name}
          onChange={(e) => setNewSite({ ...newSite, name: e.target.value })}
          placeholder="Site Name"
          required
        />
        <input
          type="url"
          value={newSite.url}
          onChange={(e) => setNewSite({ ...newSite, url: e.target.value })}
          placeholder="Site URL"
          required
        />
        <select
          value={newSite.category_id}
          onChange={(e) => setNewSite({ ...newSite, category_id: e.target.value })}
          required
        >
          <option value="">Select Category</option>
          {categories.map(category => (
            <option key={category.id} value={category.id}>{category.name}</option>
          ))}
        </select>
        <button type="submit">Add Site</button>
      </form>

      {categories.map(category => (
        <div key={category.id}>
          <h2>
            {category.name}
            <button onClick={() => updateCategoryOrder(category.id, category.order - 1)}>↑</button>
            <button onClick={() => updateCategoryOrder(category.id, category.order + 1)}>↓</button>
          </h2>
          <ul>
            {sites
              .filter(site => site.category_id === category.id)
              .map(site => (
                <li key={site.id}>
                  <a href={site.url} target="_blank" rel="noopener noreferrer">
                    {site.name}
                  </a>
                </li>
              ))}
          </ul>
        </div>
      ))}
    </div>
  );
}

export default App;
