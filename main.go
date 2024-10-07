package main

import (
	"embed"
	"io"
	"log"
	"net/http"
	"net/http/httputil"
	"net/url"
	"os"
	"strconv"
	"strings"
	"time"

	"github.com/gin-contrib/cors"
	"github.com/gin-gonic/gin"
	"golang.org/x/net/html"
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

// Add this logging middleware
func Logger() gin.HandlerFunc {
	return func(c *gin.Context) {
		start := time.Now()
		path := c.Request.URL.Path
		raw := c.Request.URL.RawQuery

		// Log the request
		log.Printf("API Request - Method: %s, Path: %s, Raw Query: %s\n", c.Request.Method, path, raw)

		c.Next()

		// Log the response
		latency := time.Since(start)
		clientIP := c.ClientIP()
		method := c.Request.Method
		statusCode := c.Writer.Status()
		log.Printf("API Response - Status: %d, Latency: %v, Client IP: %s, Method: %s, Path: %s\n",
			statusCode, latency, clientIP, method, path)
	}
}

// Update existing handler functions to include more detailed logging

func apiSitesHandler(c *gin.Context) {
	switch c.Request.Method {
	case "GET":
		log.Println("Fetching all sites")
		sites, err := getSites()
		if err != nil {
			log.Printf("Error fetching sites: %v\n", err)
			c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
			return
		}
		log.Printf("Successfully fetched %d sites\n", len(sites))
		c.JSON(http.StatusOK, sites)
	case "POST":
		var site Site
		if err := c.ShouldBindJSON(&site); err != nil {
			log.Printf("Error binding JSON for new site: %v\n", err)
			c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
			return
		}
		log.Printf("Adding new site: %+v\n", site)
		err := addSite(site.Name, site.URL, site.CategoryID)
		if err != nil {
			log.Printf("Error adding new site: %v\n", err)
			c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
			return
		}
		log.Println("Successfully added new site")
		c.JSON(http.StatusCreated, site)
	case "PUT":
		var site Site
		if err := c.ShouldBindJSON(&site); err != nil {
			log.Printf("Error binding JSON for site update: %v\n", err)
			c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
			return
		}
		log.Printf("Updating site: %+v\n", site)
		err := updateSite(site.ID, site.Name, site.URL, site.CategoryID)
		if err != nil {
			log.Printf("Error updating site: %v\n", err)
			c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
			return
		}
		log.Println("Successfully updated site")
		c.JSON(http.StatusOK, gin.H{"message": "Site updated successfully"})
	case "DELETE":
		id := c.Query("id")
		if id == "" {
			log.Println("Missing site ID")
			c.JSON(http.StatusBadRequest, gin.H{"error": "Missing site ID"})
			return
		}
		siteID, err := strconv.Atoi(id)
		if err != nil {
			log.Printf("Invalid site ID: %s\n", id)
			c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid site ID"})
			return
		}
		log.Printf("Deleting site with ID: %d\n", siteID)
		err = deleteSite(siteID)
		if err != nil {
			log.Printf("Error deleting site: %v\n", err)
			c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
			return
		}
		log.Println("Successfully deleted site")
		c.JSON(http.StatusOK, gin.H{"message": "Site deleted successfully"})
	default:
		log.Printf("Method not allowed: %s\n", c.Request.Method)
		c.JSON(http.StatusMethodNotAllowed, gin.H{"error": "method not allowed"})
	}
}

func apiCategoriesHandler(c *gin.Context) {
	switch c.Request.Method {
	case "GET":
		log.Println("Fetching all categories")
		categories, err := getCategories()
		if err != nil {
			log.Printf("Error fetching categories: %v\n", err)
			c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
			return
		}
		log.Printf("Successfully fetched %d categories\n", len(categories))
		c.JSON(http.StatusOK, categories)
	case "POST":
		var category Category
		if err := c.ShouldBindJSON(&category); err != nil {
			log.Printf("Error binding JSON for new category: %v\n", err)
			c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
			return
		}
		log.Printf("Adding new category: %+v\n", category)
		newCategory, err := addCategory(category.Name)
		if err != nil {
			log.Printf("Error adding new category: %v\n", err)
			c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
			return
		}
		log.Println("Successfully added new category")
		c.JSON(http.StatusCreated, newCategory)
	case "PUT":
		var category Category
		if err := c.ShouldBindJSON(&category); err != nil {
			log.Printf("Error binding JSON for category update: %v\n", err)
			c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
			return
		}
		if category.Order != 0 {
			log.Printf("Updating category order: %+v\n", category)
			err := updateCategoryOrder(category.ID, category.Order)
			if err != nil {
				log.Printf("Error updating category order: %v\n", err)
				c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
				return
			}
		} else {
			log.Printf("Updating category: %+v\n", category)
			err := updateCategory(category.ID, category.Name)
			if err != nil {
				log.Printf("Error updating category: %v\n", err)
				c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
				return
			}
		}
		log.Println("Successfully updated category")
		c.JSON(http.StatusOK, gin.H{"message": "Category updated successfully"})
	case "DELETE":
		id := c.Query("id")
		if id == "" {
			log.Println("Missing category ID")
			c.JSON(http.StatusBadRequest, gin.H{"error": "Missing category ID"})
			return
		}
		categoryID, err := strconv.Atoi(id)
		if err != nil {
			log.Printf("Invalid category ID: %s\n", id)
			c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid category ID"})
			return
		}
		log.Printf("Deleting category with ID: %d\n", categoryID)
		err = deleteCategory(categoryID)
		if err != nil {
			log.Printf("Error deleting category: %v\n", err)
			c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
			return
		}
		log.Println("Successfully deleted category")
		c.JSON(http.StatusOK, gin.H{"message": "Category deleted successfully"})
	default:
		log.Printf("Method not allowed: %s\n", c.Request.Method)
		c.JSON(http.StatusMethodNotAllowed, gin.H{"error": "method not allowed"})
	}
}

func apiUpdateCategoriesOrderHandler(c *gin.Context) {
	log.Println("Updating categories order")
	var categories []Category
	if err := c.ShouldBindJSON(&categories); err != nil {
		log.Printf("Error binding JSON for categories order update: %v\n", err)
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	log.Printf("Attempting to update order for %d categories\n", len(categories))
	err := updateCategoriesOrder(categories)
	if err != nil {
		log.Printf("Error updating categories order: %v\n", err)
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	log.Println("Successfully updated categories order")
	c.JSON(http.StatusOK, gin.H{"message": "Categories order updated successfully"})
}

func getSiteTitle(url string) (string, error) {
	resp, err := http.Get(url)
	if err != nil {
		return "", err
	}
	defer resp.Body.Close()

	tokenizer := html.NewTokenizer(resp.Body)
	for {
		tokenType := tokenizer.Next()
		switch tokenType {
		case html.ErrorToken:
			return "", io.EOF
		case html.StartTagToken, html.SelfClosingTagToken:
			token := tokenizer.Token()
			if token.Data == "title" {
				tokenType = tokenizer.Next()
				if tokenType == html.TextToken {
					return strings.TrimSpace(tokenizer.Token().Data), nil
				}
			}
		}
	}
}

func apiSiteTitleHandler(c *gin.Context) {
	id := c.Query("id")
	if id == "" {
		log.Println("Missing site ID")
		c.JSON(http.StatusBadRequest, gin.H{"error": "Missing site ID"})
		return
	}

	siteID, err := strconv.Atoi(id)
	if err != nil {
		log.Printf("Invalid site ID: %s\n", id)
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid site ID"})
		return
	}

	var site Site
	err = db.QueryRow("SELECT url FROM sites WHERE id = ?", siteID).Scan(&site.URL)
	if err != nil {
		log.Printf("Error fetching site URL: %v\n", err)
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to fetch site URL"})
		return
	}

	title, err := getSiteTitle(site.URL)
	if err != nil {
		log.Printf("Error fetching site title: %v\n", err)
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to fetch site title"})
		return
	}

	log.Printf("Successfully fetched site title: %s\n", title)
	c.JSON(http.StatusOK, gin.H{"title": title})
}

func main() {
	initDB()
	defer closeDB()

	r := gin.Default()

	// Add the logging middleware
	r.Use(Logger())

	config := cors.DefaultConfig()
	config.AllowAllOrigins = true
	config.AllowMethods = []string{"GET", "POST", "PUT", "DELETE", "OPTIONS"}
	config.AllowHeaders = []string{"Origin", "Content-Type", "Authorization"}
	r.Use(cors.New(config))

	// API routes
	r.Any("/api/sites", apiSitesHandler)
	r.Any("/api/categories", apiCategoriesHandler)
	r.GET("/api/sites/title", apiSiteTitleHandler)
	r.PUT("/api/categories/order", apiUpdateCategoriesOrderHandler)

	// Static file server
	r.StaticFS("/static", http.FS(webFS))

	// Check the environment mode
	mode := os.Getenv("APP_MODE")
	if mode == "dev" {
		// Dev mode: Reverse proxy for root requests to localhost:3000
		r.NoRoute(func(c *gin.Context) {
			remote, err := url.Parse("http://localhost:3000")
			if err != nil {
				c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to parse upstream URL"})
				return
			}

			proxy := httputil.NewSingleHostReverseProxy(remote)
			proxy.Director = func(req *http.Request) {
				req.Header = c.Request.Header
				req.Host = remote.Host
				req.URL.Scheme = remote.Scheme
				req.URL.Host = remote.Host
				req.URL.Path = c.Request.URL.Path
			}

			proxy.ServeHTTP(c.Writer, c.Request)
		})
	} else {
		// Prod mode: Serve embedded web files
		r.NoRoute(func(c *gin.Context) {
			c.FileFromFS(c.Request.URL.Path, http.FS(webFS))
		})
	}

	port := os.Getenv("PORT")
	if port == "" {
		port = "8080"
	}

	log.Printf("Server starting on port %s in %s mode\n", port, mode)
	r.Run("0.0.0.0:" + port)
}
