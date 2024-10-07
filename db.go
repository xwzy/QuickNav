package main

import (
	"database/sql"
	"log"

	_ "github.com/mattn/go-sqlite3"
)

var db *sql.DB

const schema = `
CREATE TABLE IF NOT EXISTS categories (
	id INTEGER PRIMARY KEY AUTOINCREMENT,
	name TEXT NOT NULL,
	order_num INTEGER NOT NULL UNIQUE
);

CREATE TABLE IF NOT EXISTS sites (
	id INTEGER PRIMARY KEY AUTOINCREMENT,
	name TEXT NOT NULL,
	url TEXT NOT NULL,
	category_id INTEGER,
	FOREIGN KEY (category_id) REFERENCES categories(id)
);
`

func initDB() {
	var err error
	db, err = sql.Open("sqlite3", "./nav.db")
	if err != nil {
		log.Fatal(err)
	}

	_, err = db.Exec(schema)
	if err != nil {
		log.Fatal(err)
	}
}

func getCategories() ([]Category, error) {
	rows, err := db.Query("SELECT id, name, order_num FROM categories ORDER BY order_num")
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var categories []Category
	for rows.Next() {
		var category Category
		err := rows.Scan(&category.ID, &category.Name, &category.Order)
		if err != nil {
			return nil, err
		}
		categories = append(categories, category)
	}
	return categories, nil
}

func getSites() ([]Site, error) {
	rows, err := db.Query("SELECT id, name, url, category_id FROM sites")
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var sites []Site
	for rows.Next() {
		var site Site
		err := rows.Scan(&site.ID, &site.Name, &site.URL, &site.CategoryID)
		if err != nil {
			return nil, err
		}
		sites = append(sites, site)
	}
	return sites, nil
}

func addSite(name, url string, categoryID int) error {
	_, err := db.Exec("INSERT INTO sites (name, url, category_id) VALUES (?, ?, ?)", name, url, categoryID)
	return err
}

func addCategory(name string) (Category, error) {
	result, err := db.Exec("INSERT INTO categories (name, order_num) VALUES (?, (SELECT COALESCE(MAX(order_num), 0) + 1 FROM categories))", name)
	if err != nil {
		return Category{}, err
	}

	id, err := result.LastInsertId()
	if err != nil {
		return Category{}, err
	}

	var category Category
	err = db.QueryRow("SELECT id, name, order_num FROM categories WHERE id = ?", id).Scan(&category.ID, &category.Name, &category.Order)
	if err != nil {
		return Category{}, err
	}

	return category, nil
}

func updateCategoryOrder(id, newOrder int) error {
	tx, err := db.Begin()
	if err != nil {
		return err
	}
	defer tx.Rollback()

	if newOrder < 1 {
		newOrder = 1
	}
	_, err = tx.Exec("UPDATE categories SET order_num = order_num + 1 WHERE order_num >= ? AND id != ?", newOrder, id)
	if err != nil {
		return err
	}

	_, err = tx.Exec("UPDATE categories SET order_num = ? WHERE id = ?", newOrder, id)
	if err != nil {
		return err
	}

	return tx.Commit()
}

func closeDB() {
	if db != nil {
		db.Close()
	}
}

func updateSite(id int, name, url string, categoryID int) error {
	_, err := db.Exec("UPDATE sites SET name = ?, url = ?, category_id = ? WHERE id = ?", name, url, categoryID, id)
	return err
}

func deleteSite(id int) error {
	_, err := db.Exec("DELETE FROM sites WHERE id = ?", id)
	return err
}

func updateCategory(id int, name string) error {
	_, err := db.Exec("UPDATE categories SET name = ? WHERE id = ?", name, id)
	return err
}

func deleteCategory(id int) error {
	_, err := db.Exec("DELETE FROM categories WHERE id = ?", id)
	return err
}
