package main

import (
	"database/sql"
	"encoding/json"
	"log"
	"os"
	"time"

	_ "modernc.org/sqlite"
)

var db *sql.DB

// Enhanced data structures
type Site struct {
	ID         int       `json:"id"`
	Name       string    `json:"name"`
	URL        string    `json:"url"`
	CategoryID int       `json:"category_id"`
	Favicon    string    `json:"favicon"`
	Tags       string    `json:"tags"`
	VisitCount int       `json:"visit_count"`
	LastVisit  time.Time `json:"last_visit"`
	IsHealthy  bool      `json:"is_healthy"`
	CreatedAt  time.Time `json:"created_at"`
	UpdatedAt  time.Time `json:"updated_at"`
}

type Category struct {
	ID        int       `json:"id"`
	Name      string    `json:"name"`
	Order     int       `json:"order"`
	Color     string    `json:"color"`
	Icon      string    `json:"icon"`
	CreatedAt time.Time `json:"created_at"`
	UpdatedAt time.Time `json:"updated_at"`
}

type Widget struct {
	ID       int    `json:"id"`
	Type     string `json:"type"`
	Title    string `json:"title"`
	Position string `json:"position"`
	Size     string `json:"size"`
	Config   string `json:"config"`
	Enabled  bool   `json:"enabled"`
}

type Note struct {
	ID        int       `json:"id"`
	Title     string    `json:"title"`
	Content   string    `json:"content"`
	Tags      string    `json:"tags"`
	CreatedAt time.Time `json:"created_at"`
	UpdatedAt time.Time `json:"updated_at"`
}

type Task struct {
	ID          int       `json:"id"`
	Title       string    `json:"title"`
	Description string    `json:"description"`
	Completed   bool      `json:"completed"`
	Priority    int       `json:"priority"`
	DueDate     time.Time `json:"due_date"`
	CreatedAt   time.Time `json:"created_at"`
	UpdatedAt   time.Time `json:"updated_at"`
}

type Setting struct {
	Key   string `json:"key"`
	Value string `json:"value"`
}

const schema = `
CREATE TABLE IF NOT EXISTS categories (
	id INTEGER PRIMARY KEY AUTOINCREMENT,
	name TEXT NOT NULL,
	order_num INTEGER NOT NULL UNIQUE,
	color TEXT DEFAULT '#1976d2',
	icon TEXT DEFAULT 'folder',
	created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
	updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS sites (
	id INTEGER PRIMARY KEY AUTOINCREMENT,
	name TEXT NOT NULL,
	url TEXT NOT NULL,
	category_id INTEGER,
	favicon TEXT DEFAULT '',
	tags TEXT DEFAULT '',
	visit_count INTEGER DEFAULT 0,
	last_visit DATETIME,
	is_healthy BOOLEAN DEFAULT TRUE,
	created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
	updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
	FOREIGN KEY (category_id) REFERENCES categories(id)
);

CREATE TABLE IF NOT EXISTS widgets (
	id INTEGER PRIMARY KEY AUTOINCREMENT,
	type TEXT NOT NULL,
	title TEXT NOT NULL,
	position TEXT DEFAULT '{"x":0,"y":0}',
	size TEXT DEFAULT '{"w":4,"h":4}',
	config TEXT DEFAULT '{}',
	enabled BOOLEAN DEFAULT TRUE
);

CREATE TABLE IF NOT EXISTS notes (
	id INTEGER PRIMARY KEY AUTOINCREMENT,
	title TEXT NOT NULL,
	content TEXT DEFAULT '',
	tags TEXT DEFAULT '',
	created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
	updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS tasks (
	id INTEGER PRIMARY KEY AUTOINCREMENT,
	title TEXT NOT NULL,
	description TEXT DEFAULT '',
	completed BOOLEAN DEFAULT FALSE,
	priority INTEGER DEFAULT 1,
	due_date DATETIME,
	created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
	updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS settings (
	key TEXT PRIMARY KEY,
	value TEXT NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_sites_category ON sites(category_id);
CREATE INDEX IF NOT EXISTS idx_sites_visit_count ON sites(visit_count DESC);
CREATE INDEX IF NOT EXISTS idx_tasks_completed ON tasks(completed);
CREATE INDEX IF NOT EXISTS idx_tasks_due_date ON tasks(due_date);
`

func initDB() {
	var err error
	dbFile := "./dashboard.db"

	// Check if the database file exists
	_, err = os.Stat(dbFile)
	dbExists := !os.IsNotExist(err)

	db, err = sql.Open("sqlite", dbFile)
	if err != nil {
		log.Fatal(err)
	}

	_, err = db.Exec(schema)
	if err != nil {
		log.Fatal(err)
	}

	// If the database didn't exist, insert sample data
	if !dbExists {
		err = insertSampleData()
		if err != nil {
			log.Fatal(err)
		}
	}
}

func insertSampleData() error {
	categories := []struct {
		name  string
		color string
		icon  string
	}{
		{"Development", "#2e7d32", "code"},
		{"Social", "#1976d2", "people"},
		{"Entertainment", "#7b1fa2", "movie"},
		{"News", "#d32f2f", "article"},
		{"Shopping", "#f57c00", "shopping_cart"},
		{"Tools", "#455a64", "build"},
	}

	sites := []struct {
		name       string
		url        string
		categoryID int
		tags       string
	}{
		{"GitHub", "https://github.com", 1, "coding,git,repository"},
		{"Stack Overflow", "https://stackoverflow.com", 1, "programming,help,community"},
		{"VS Code", "https://code.visualstudio.com", 1, "editor,ide,microsoft"},
		{"Facebook", "https://facebook.com", 2, "social,media,friends"},
		{"Twitter", "https://twitter.com", 2, "social,microblog,news"},
		{"LinkedIn", "https://linkedin.com", 2, "professional,network,career"},
		{"YouTube", "https://youtube.com", 3, "video,streaming,entertainment"},
		{"Netflix", "https://netflix.com", 3, "streaming,movies,tv"},
		{"Spotify", "https://spotify.com", 3, "music,streaming,audio"},
		{"BBC News", "https://bbc.com/news", 4, "news,world,politics"},
		{"CNN", "https://cnn.com", 4, "news,breaking,international"},
		{"Amazon", "https://amazon.com", 5, "shopping,ecommerce,retail"},
		{"Google", "https://google.com", 6, "search,tools,productivity"},
		{"Gmail", "https://gmail.com", 6, "email,communication,google"},
	}

	widgets := []struct {
		widgetType string
		title      string
		position   string
		size       string
		config     string
	}{
		{"bookmarks", "Quick Access", `{"x":0,"y":0}`, `{"w":6,"h":8}`, `{"showRecent":true,"maxItems":12}`},
		{"weather", "Weather", `{"x":6,"y":0}`, `{"w":3,"h":4}`, `{"location":"auto","units":"metric"}`},
		{"clock", "Clock", `{"x":9,"y":0}`, `{"w":3,"h":4}`, `{"format":"24h","timezone":"auto"}`},
		{"tasks", "Todo List", `{"x":6,"y":4}`, `{"w":6,"h":4}`, `{"showCompleted":false,"maxItems":5}`},
		{"notes", "Quick Notes", `{"x":0,"y":8}`, `{"w":6,"h":4}`, `{"maxItems":3,"showPreview":true}`},
		{"system", "System Info", `{"x":6,"y":8}`, `{"w":6,"h":4}`, `{"showCPU":true,"showMemory":true,"showDisk":true}`},
	}

	notes := []struct {
		title   string
		content string
		tags    string
	}{
		{"Welcome to Your Dashboard", "This is your personal productivity hub. You can add bookmarks, manage tasks, take notes, and more!", "welcome,getting-started"},
		{"Keyboard Shortcuts", "Ctrl+N: New note\nCtrl+T: New task\nCtrl+B: New bookmark\nCtrl+/: Search", "shortcuts,help"},
		{"Project Ideas", "1. Build a Chrome extension\n2. Learn React Native\n3. Create a mobile app\n4. Write a blog post", "ideas,projects,todo"},
	}

	tasks := []struct {
		title       string
		description string
		priority    int
		dueDate     string
	}{
		{"Review dashboard features", "Test all widgets and functionality", 2, "2024-12-31"},
		{"Update project documentation", "Add new features to README", 1, "2024-12-30"},
		{"Backup important data", "Create backup of all personal data", 3, "2024-12-29"},
		{"Organize bookmarks", "Clean up and categorize all saved bookmarks", 1, "2024-12-28"},
	}

	settings := []struct {
		key   string
		value string
	}{
		{"theme", "light"},
		{"layout", "grid"},
		{"weather_location", "auto"},
		{"default_category", "1"},
		{"auto_backup", "true"},
		{"show_visit_count", "true"},
		{"check_health", "true"},
	}

	tx, err := db.Begin()
	if err != nil {
		return err
	}
	defer tx.Rollback()

	// Insert categories
	for i, category := range categories {
		_, err := tx.Exec("INSERT INTO categories (name, order_num, color, icon) VALUES (?, ?, ?, ?)", 
			category.name, i+1, category.color, category.icon)
		if err != nil {
			return err
		}
	}

	// Insert sites
	for _, site := range sites {
		_, err := tx.Exec("INSERT INTO sites (name, url, category_id, tags) VALUES (?, ?, ?, ?)", 
			site.name, site.url, site.categoryID, site.tags)
		if err != nil {
			return err
		}
	}

	// Insert widgets
	for _, widget := range widgets {
		_, err := tx.Exec("INSERT INTO widgets (type, title, position, size, config) VALUES (?, ?, ?, ?, ?)", 
			widget.widgetType, widget.title, widget.position, widget.size, widget.config)
		if err != nil {
			return err
		}
	}

	// Insert notes
	for _, note := range notes {
		_, err := tx.Exec("INSERT INTO notes (title, content, tags) VALUES (?, ?, ?)", 
			note.title, note.content, note.tags)
		if err != nil {
			return err
		}
	}

	// Insert tasks
	for _, task := range tasks {
		_, err := tx.Exec("INSERT INTO tasks (title, description, priority, due_date) VALUES (?, ?, ?, ?)", 
			task.title, task.description, task.priority, task.dueDate)
		if err != nil {
			return err
		}
	}

	// Insert settings
	for _, setting := range settings {
		_, err := tx.Exec("INSERT INTO settings (key, value) VALUES (?, ?)", 
			setting.key, setting.value)
		if err != nil {
			return err
		}
	}

	return tx.Commit()
}

// Enhanced database functions
func getCategories() ([]Category, error) {
	rows, err := db.Query("SELECT id, name, order_num, color, icon, created_at, updated_at FROM categories ORDER BY order_num")
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var categories []Category
	for rows.Next() {
		var category Category
		err := rows.Scan(&category.ID, &category.Name, &category.Order, &category.Color, &category.Icon, &category.CreatedAt, &category.UpdatedAt)
		if err != nil {
			return nil, err
		}
		categories = append(categories, category)
	}
	return categories, nil
}

func getSites() ([]Site, error) {
	rows, err := db.Query(`SELECT id, name, url, category_id, favicon, tags, visit_count, 
		COALESCE(last_visit, '') as last_visit, is_healthy, created_at, updated_at 
		FROM sites ORDER BY visit_count DESC`)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var sites []Site
	for rows.Next() {
		var site Site
		var lastVisitStr string
		err := rows.Scan(&site.ID, &site.Name, &site.URL, &site.CategoryID, &site.Favicon, 
			&site.Tags, &site.VisitCount, &lastVisitStr, &site.IsHealthy, &site.CreatedAt, &site.UpdatedAt)
		if err != nil {
			return nil, err
		}
		if lastVisitStr != "" {
			site.LastVisit, _ = time.Parse(time.RFC3339, lastVisitStr)
		}
		sites = append(sites, site)
	}
	return sites, nil
}

func addSite(name, url string, categoryID int, tags string) error {
	_, err := db.Exec("INSERT INTO sites (name, url, category_id, tags) VALUES (?, ?, ?, ?)", 
		name, url, categoryID, tags)
	return err
}

func addCategory(name, color, icon string) (Category, error) {
	result, err := db.Exec("INSERT INTO categories (name, order_num, color, icon) VALUES (?, (SELECT COALESCE(MAX(order_num), 0) + 1 FROM categories), ?, ?)", 
		name, color, icon)
	if err != nil {
		return Category{}, err
	}

	id, err := result.LastInsertId()
	if err != nil {
		return Category{}, err
	}

	var category Category
	err = db.QueryRow("SELECT id, name, order_num, color, icon, created_at, updated_at FROM categories WHERE id = ?", id).
		Scan(&category.ID, &category.Name, &category.Order, &category.Color, &category.Icon, &category.CreatedAt, &category.UpdatedAt)
	if err != nil {
		return Category{}, err
	}

	return category, nil
}

func updateSite(id int, name, url string, categoryID int, tags string) error {
	_, err := db.Exec("UPDATE sites SET name = ?, url = ?, category_id = ?, tags = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?", 
		name, url, categoryID, tags, id)
	return err
}

func deleteSite(id int) error {
	_, err := db.Exec("DELETE FROM sites WHERE id = ?", id)
	return err
}

func updateCategory(id int, name, color, icon string) error {
	_, err := db.Exec("UPDATE categories SET name = ?, color = ?, icon = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?", 
		name, color, icon, id)
	return err
}

func deleteCategory(id int) error {
	tx, err := db.Begin()
	if err != nil {
		return err
	}
	defer tx.Rollback()

	// First, delete all sites associated with this category
	_, err = tx.Exec("DELETE FROM sites WHERE category_id = ?", id)
	if err != nil {
		return err
	}

	// Then, delete the category itself
	_, err = tx.Exec("DELETE FROM categories WHERE id = ?", id)
	if err != nil {
		return err
	}

	return tx.Commit()
}

func updateCategoriesOrder(categories []Category) error {
	tx, err := db.Begin()
	if err != nil {
		return err
	}
	defer tx.Rollback()

	// Update order for each category
	for _, category := range categories {
		_, err := tx.Exec("UPDATE categories SET order_num = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?", 
			category.Order, category.ID)
		if err != nil {
			return err
		}
	}

	return tx.Commit()
}

// New functions for enhanced features
func getWidgets() ([]Widget, error) {
	rows, err := db.Query("SELECT id, type, title, position, size, config, enabled FROM widgets WHERE enabled = TRUE")
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var widgets []Widget
	for rows.Next() {
		var widget Widget
		err := rows.Scan(&widget.ID, &widget.Type, &widget.Title, &widget.Position, &widget.Size, &widget.Config, &widget.Enabled)
		if err != nil {
			return nil, err
		}
		widgets = append(widgets, widget)
	}
	return widgets, nil
}

func updateWidget(id int, position, size, config string) error {
	_, err := db.Exec("UPDATE widgets SET position = ?, size = ?, config = ? WHERE id = ?", 
		position, size, config, id)
	return err
}

func getNotes() ([]Note, error) {
	rows, err := db.Query("SELECT id, title, content, tags, created_at, updated_at FROM notes ORDER BY updated_at DESC")
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var notes []Note
	for rows.Next() {
		var note Note
		err := rows.Scan(&note.ID, &note.Title, &note.Content, &note.Tags, &note.CreatedAt, &note.UpdatedAt)
		if err != nil {
			return nil, err
		}
		notes = append(notes, note)
	}
	return notes, nil
}

func addNote(title, content, tags string) error {
	_, err := db.Exec("INSERT INTO notes (title, content, tags) VALUES (?, ?, ?)", title, content, tags)
	return err
}

func updateNote(id int, title, content, tags string) error {
	_, err := db.Exec("UPDATE notes SET title = ?, content = ?, tags = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?", 
		title, content, tags, id)
	return err
}

func deleteNote(id int) error {
	_, err := db.Exec("DELETE FROM notes WHERE id = ?", id)
	return err
}

func getTasks() ([]Task, error) {
	rows, err := db.Query(`SELECT id, title, description, completed, priority, 
		COALESCE(due_date, '') as due_date, created_at, updated_at 
		FROM tasks ORDER BY completed ASC, priority DESC, due_date ASC`)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var tasks []Task
	for rows.Next() {
		var task Task
		var dueDateStr string
		err := rows.Scan(&task.ID, &task.Title, &task.Description, &task.Completed, &task.Priority, 
			&dueDateStr, &task.CreatedAt, &task.UpdatedAt)
		if err != nil {
			return nil, err
		}
		if dueDateStr != "" {
			task.DueDate, _ = time.Parse(time.RFC3339, dueDateStr)
		}
		tasks = append(tasks, task)
	}
	return tasks, nil
}

func addTask(title, description string, priority int, dueDate time.Time) error {
	_, err := db.Exec("INSERT INTO tasks (title, description, priority, due_date) VALUES (?, ?, ?, ?)", 
		title, description, priority, dueDate)
	return err
}

func updateTask(id int, title, description string, completed bool, priority int, dueDate time.Time) error {
	_, err := db.Exec(`UPDATE tasks SET title = ?, description = ?, completed = ?, priority = ?, 
		due_date = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?`, 
		title, description, completed, priority, dueDate, id)
	return err
}

func deleteTask(id int) error {
	_, err := db.Exec("DELETE FROM tasks WHERE id = ?", id)
	return err
}

func getSettings() (map[string]string, error) {
	rows, err := db.Query("SELECT key, value FROM settings")
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	settings := make(map[string]string)
	for rows.Next() {
		var key, value string
		err := rows.Scan(&key, &value)
		if err != nil {
			return nil, err
		}
		settings[key] = value
	}
	return settings, nil
}

func setSetting(key, value string) error {
	_, err := db.Exec("INSERT OR REPLACE INTO settings (key, value) VALUES (?, ?)", key, value)
	return err
}

func incrementSiteVisit(siteID int) error {
	_, err := db.Exec("UPDATE sites SET visit_count = visit_count + 1, last_visit = CURRENT_TIMESTAMP WHERE id = ?", siteID)
	return err
}

func updateSiteHealth(siteID int, isHealthy bool) error {
	_, err := db.Exec("UPDATE sites SET is_healthy = ? WHERE id = ?", isHealthy, siteID)
	return err
}

func closeDB() {
	if db != nil {
		db.Close()
	}
}
