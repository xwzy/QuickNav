package main

import (
	"database/sql"
	"log"
	"os"

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
	dbFile := "./nav.db"

	// Check if the database file exists
	_, err = os.Stat(dbFile)
	dbExists := !os.IsNotExist(err)

	db, err = sql.Open("sqlite3", dbFile)
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
	categories := []string{"搜索引擎", "社交媒体", "新闻网站", "在线购物", "视频网站", "工具网站"}
	sites := []struct {
		name       string
		url        string
		categoryID int
	}{
		{"百度", "https://www.baidu.com", 1},
		{"搜狗", "https://www.sogou.com", 1},
		{"360搜索", "https://www.so.com", 1},
		{"微博", "https://www.weibo.com", 2},
		{"知乎", "https://www.zhihu.com", 2},
		{"豆瓣", "https://www.douban.com", 2},
		{"新浪新闻", "https://news.sina.com.cn", 3},
		{"腾讯新闻", "https://news.qq.com", 3},
		{"网易新闻", "https://news.163.com", 3},
		{"淘宝", "https://www.taobao.com", 4},
		{"京东", "https://www.jd.com", 4},
		{"拼多多", "https://www.pinduoduo.com", 4},
		{"哔哩哔哩", "https://www.bilibili.com", 5},
		{"优酷", "https://www.youku.com", 5},
		{"爱奇艺", "https://www.iqiyi.com", 5},
		{"百度翻译", "https://fanyi.baidu.com", 6},
		{"有道词典", "https://dict.youdao.com", 6},
		{"12306", "https://www.12306.cn", 6},
	}

	tx, err := db.Begin()
	if err != nil {
		return err
	}
	defer tx.Rollback()

	for i, category := range categories {
		_, err := tx.Exec("INSERT INTO categories (name, order_num) VALUES (?, ?)", category, i+1)
		if err != nil {
			return err
		}
	}

	for _, site := range sites {
		_, err := tx.Exec("INSERT INTO sites (name, url, category_id) VALUES (?, ?, ?)", site.name, site.url, site.categoryID)
		if err != nil {
			return err
		}
	}

	return tx.Commit()
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

// Add these two new functions to the db.go file

func updateCategory(id int, name string) error {
	_, err := db.Exec("UPDATE categories SET name = ? WHERE id = ?", name, id)
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

	// Finally, reorder the remaining categories
	_, err = tx.Exec("UPDATE categories SET order_num = order_num - 1 WHERE order_num > (SELECT order_num FROM categories WHERE id = ?)", id)
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

	// 首���，将所有 order_num 设置为负值，避免唯一性冲突
	_, err = tx.Exec("UPDATE categories SET order_num = -order_num")
	if err != nil {
		return err
	}

	// 然后，更新为新的顺序
	for _, category := range categories {
		_, err := tx.Exec("UPDATE categories SET order_num = ? WHERE id = ?", category.Order, category.ID)
		if err != nil {
			return err
		}
	}

	return tx.Commit()
}
