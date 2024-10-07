import React, { useState } from 'react';

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
        <form onSubmit={handleSubmit} className="add-category-form">
            <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="New category name"
            />
            <button type="submit">Add Category</button>
        </form>
    );
};

export default AddCategoryForm;