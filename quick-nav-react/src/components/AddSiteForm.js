import React, { useState } from 'react';

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
        <form onSubmit={handleSubmit} className="add-site-form">
            <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Site name"
            />
            <input
                type="url"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                placeholder="Site URL"
            />
            <select
                value={categoryId}
                onChange={(e) => setCategoryId(e.target.value)}
            >
                <option value="">Select a category</option>
                {categories.map((category) => (
                    <option key={category.id} value={category.id}>
                        {category.name}
                    </option>
                ))}
            </select>
            <button type="submit">Add Site</button>
        </form>
    );
};

export default AddSiteForm;