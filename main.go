package main

import (
	"embed"
	"log"
	"net/http"
	"net/http/httputil"
	"net/url"
	"os"
	"strconv"

	"github.com/gin-contrib/cors"
	"github.com/gin-gonic/gin"
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

func apiSitesHandler(c *gin.Context) {
	switch c.Request.Method {
	case "GET":
		sites, err := getSites()
		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
			return
		}
		c.JSON(http.StatusOK, sites)
	case "POST":
		var site Site
		if err := c.ShouldBindJSON(&site); err != nil {
			c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
			return
		}
		err := addSite(site.Name, site.URL, site.CategoryID)
		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
			return
		}
		c.JSON(http.StatusCreated, site)
	case "PUT":
		var site Site
		if err := c.ShouldBindJSON(&site); err != nil {
			c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
			return
		}
		err := updateSite(site.ID, site.Name, site.URL, site.CategoryID)
		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
			return
		}
		c.JSON(http.StatusOK, gin.H{"message": "Site updated successfully"})
	case "DELETE":
		id := c.Query("id")
		if id == "" {
			c.JSON(http.StatusBadRequest, gin.H{"error": "Missing site ID"})
			return
		}
		siteID, err := strconv.Atoi(id)
		if err != nil {
			c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid site ID"})
			return
		}
		err = deleteSite(siteID)
		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
			return
		}
		c.JSON(http.StatusOK, gin.H{"message": "Site deleted successfully"})
	default:
		c.JSON(http.StatusMethodNotAllowed, gin.H{"error": "method not allowed"})
	}
}

func apiCategoriesHandler(c *gin.Context) {
	switch c.Request.Method {
	case "GET":
		categories, err := getCategories()
		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
			return
		}
		c.JSON(http.StatusOK, categories)
	case "POST":
		var category Category
		if err := c.ShouldBindJSON(&category); err != nil {
			c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
			return
		}
		newCategory, err := addCategory(category.Name)
		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
			return
		}
		c.JSON(http.StatusCreated, newCategory)
	case "PUT":
		var category Category
		if err := c.ShouldBindJSON(&category); err != nil {
			c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
			return
		}
		if category.Order != 0 {
			err := updateCategoryOrder(category.ID, category.Order)
			if err != nil {
				c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
				return
			}
		} else {
			err := updateCategory(category.ID, category.Name)
			if err != nil {
				c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
				return
			}
		}
		c.JSON(http.StatusOK, gin.H{"message": "Category updated successfully"})
	case "DELETE":
		id := c.Query("id")
		if id == "" {
			c.JSON(http.StatusBadRequest, gin.H{"error": "Missing category ID"})
			return
		}
		categoryID, err := strconv.Atoi(id)
		if err != nil {
			c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid category ID"})
			return
		}
		err = deleteCategory(categoryID)
		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
			return
		}
		c.JSON(http.StatusOK, gin.H{"message": "Category deleted successfully"})
	default:
		c.JSON(http.StatusMethodNotAllowed, gin.H{"error": "method not allowed"})
	}
}

func main() {
	initDB()
	defer closeDB()

	r := gin.Default()

	config := cors.DefaultConfig()
	config.AllowAllOrigins = true
	config.AllowMethods = []string{"GET", "POST", "PUT", "DELETE", "OPTIONS"}
	config.AllowHeaders = []string{"Origin", "Content-Type", "Authorization"}
	r.Use(cors.New(config))

	// API routes
	r.Any("/api/sites", apiSitesHandler)
	r.Any("/api/categories", apiCategoriesHandler)

	// Static file server
	r.StaticFS("/static", http.FS(webFS))

	// Reverse proxy for root requests to localhost:3000
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

	port := os.Getenv("PORT")
	if port == "" {
		port = "8080"
	}

	log.Printf("Server starting on port %s\n", port)
	r.Run("0.0.0.0:" + port)
}
