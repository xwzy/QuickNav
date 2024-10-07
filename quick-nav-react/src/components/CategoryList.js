import React from 'react';

const CategoryList = ({ categories, sites, updateCategoryOrder, updateCategory, deleteCategory, updateSite, deleteSite }) => {
    return (
        <div className="category-list">
            {categories.map((category) => (
                <div key={category.id} className="category">
                    <h2>{category.name}</h2>
                    <ul>
                        {sites
                            .filter((site) => site.category_id === category.id)
                            .map((site) => (
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
};

export default CategoryList;