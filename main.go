package main

import (
	"database/sql"
	"embed"
	"encoding/json"
	"fmt"
	"io/fs"
	"log"
	"net/http"
	"os"

	_ "github.com/mattn/go-sqlite3"
)

//go:embed web
var webFS embed.FS

type Site struct {
	ID         int    `json:"id"`
	Name       string `json:"name"`
	URL        string `json:"url"`
	CategoryID int    `json:"category_id"`
}

type Category struct {
	ID    int    `json:"id"`
	Name  string `json:"name"`
	Order int    `json:"order"`
}

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

	// Fetch the newly created category
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

	// Shift categories to maintain unique order_num
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

func apiSitesHandler(w http.ResponseWriter, r *http.Request) {
	w.Header().Set("Content-Type", "application/json")
	switch r.Method {
	case "GET":
		sites, err := getSites()
		if err != nil {
			handleError(w, err, http.StatusInternalServerError)
			return
		}
		json.NewEncoder(w).Encode(sites)
	case "POST":
		var site Site
		err := json.NewDecoder(r.Body).Decode(&site)
		if err != nil {
			handleError(w, err, http.StatusBadRequest)
			return
		}
		err = addSite(site.Name, site.URL, site.CategoryID)
		if err != nil {
			handleError(w, err, http.StatusInternalServerError)
			return
		}
		w.WriteHeader(http.StatusCreated)
		json.NewEncoder(w).Encode(site)
	default:
		handleError(w, fmt.Errorf("method not allowed"), http.StatusMethodNotAllowed)
	}
}

func apiCategoriesHandler(w http.ResponseWriter, r *http.Request) {
	w.Header().Set("Content-Type", "application/json")
	switch r.Method {
	case "GET":
		categories, err := getCategories()
		if err != nil {
			handleError(w, err, http.StatusInternalServerError)
			return
		}
		json.NewEncoder(w).Encode(categories)
	case "POST":
		var category Category
		err := json.NewDecoder(r.Body).Decode(&category)
		if err != nil {
			handleError(w, err, http.StatusBadRequest)
			return
		}
		newCategory, err := addCategory(category.Name)
		if err != nil {
			handleError(w, err, http.StatusInternalServerError)
			return
		}
		w.WriteHeader(http.StatusCreated)
		json.NewEncoder(w).Encode(newCategory)
	case "PUT":
		var category Category
		err := json.NewDecoder(r.Body).Decode(&category)
		if err != nil {
			handleError(w, err, http.StatusBadRequest)
			return
		}
		err = updateCategoryOrder(category.ID, category.Order)
		if err != nil {
			handleError(w, err, http.StatusInternalServerError)
			return
		}
		w.WriteHeader(http.StatusOK)
		json.NewEncoder(w).Encode(map[string]string{"message": "Category order updated successfully"})
	default:
		handleError(w, fmt.Errorf("method not allowed"), http.StatusMethodNotAllowed)
	}
}

func handleError(w http.ResponseWriter, err error, status int) {
	log.Printf("Error: %v", err)
	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(status)
	json.NewEncoder(w).Encode(map[string]string{"error": err.Error()})
}

func main() {
	initDB()
	defer db.Close()

	// Serve static files from embedded web directory
	webContent, err := fs.Sub(webFS, "web")
	if err != nil {
		log.Fatal(err)
	}
	http.Handle("/", http.FileServer(http.FS(webContent)))

	http.HandleFunc("/api/sites", apiSitesHandler)
	http.HandleFunc("/api/categories", apiCategoriesHandler)

	port := os.Getenv("PORT")
	if port == "" {
		port = "8080"
	}

	log.Printf("Server starting on port %s\n", port)
	log.Fatal(http.ListenAndServe("0.0.0.0:"+port, nil))
}
