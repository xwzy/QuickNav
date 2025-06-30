package main

import (
	"crypto/rand"
	"embed"
	"encoding/base64"
	"encoding/json"
	"fmt"
	"io"
	"io/fs"
	"log"
	"net/http"
	"net/http/httputil"
	"net/url"
	"strconv"
	"strings"
	"time"

	"github.com/gin-contrib/cors"
	"github.com/gin-gonic/gin"
	"github.com/shirou/gopsutil/v3/cpu"
	"github.com/shirou/gopsutil/v3/disk"
	"github.com/shirou/gopsutil/v3/mem"
	"golang.org/x/net/html"
)

// System info structures
type SystemInfo struct {
	CPU    float64 `json:"cpu"`
	Memory struct {
		Used    uint64  `json:"used"`
		Total   uint64  `json:"total"`
		Percent float64 `json:"percent"`
	} `json:"memory"`
	Disk struct {
		Used    uint64  `json:"used"`
		Total   uint64  `json:"total"`
		Percent float64 `json:"percent"`
	} `json:"disk"`
}

type WeatherData struct {
	Location    string  `json:"location"`
	Temperature float64 `json:"temperature"`
	Description string  `json:"description"`
	Humidity    int     `json:"humidity"`
	Icon        string  `json:"icon"`
}

// Enhanced request/response structures
type AddSiteRequest struct {
	Name       string `json:"name" binding:"required"`
	URL        string `json:"url" binding:"required"`
	CategoryID int    `json:"category_id" binding:"required"`
	Tags       string `json:"tags"`
}

type AddCategoryRequest struct {
	Name  string `json:"name" binding:"required"`
	Color string `json:"color"`
	Icon  string `json:"icon"`
}

type AddNoteRequest struct {
	Title   string `json:"title" binding:"required"`
	Content string `json:"content"`
	Tags    string `json:"tags"`
}

type AddTaskRequest struct {
	Title       string    `json:"title" binding:"required"`
	Description string    `json:"description"`
	Priority    int       `json:"priority"`
	DueDate     time.Time `json:"due_date"`
}

// Middleware
func Logger() gin.HandlerFunc {
	return func(c *gin.Context) {
		start := time.Now()
		path := c.Request.URL.Path
		raw := c.Request.URL.RawQuery

		log.Printf("API Request - Method: %s, Path: %s, Query: %s\n", c.Request.Method, path, raw)
		c.Next()

		latency := time.Since(start)
		statusCode := c.Writer.Status()
		log.Printf("API Response - Status: %d, Latency: %v, Method: %s, Path: %s\n",
			statusCode, latency, c.Request.Method, path)
	}
}

// API Handlers
func apiSitesHandler(c *gin.Context) {
	switch c.Request.Method {
	case "GET":
		sites, err := getSites()
		if err != nil {
			log.Printf("Error fetching sites: %v\n", err)
			c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
			return
		}
		log.Printf("Successfully fetched %d sites\n", len(sites))
		c.JSON(http.StatusOK, sites)
	case "POST":
		var req AddSiteRequest
		if err := c.ShouldBindJSON(&req); err != nil {
			log.Printf("Error binding JSON for new site: %v\n", err)
			c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
			return
		}
		log.Printf("Adding new site: %+v\n", req)
		err := addSite(req.Name, req.URL, req.CategoryID, req.Tags)
		if err != nil {
			log.Printf("Error adding new site: %v\n", err)
			c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
			return
		}
		log.Println("Successfully added new site")
		c.JSON(http.StatusCreated, gin.H{"message": "Site added successfully"})
	case "PUT":
		var site Site
		if err := c.ShouldBindJSON(&site); err != nil {
			log.Printf("Error binding JSON for site update: %v\n", err)
			c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
			return
		}
		log.Printf("Updating site: %+v\n", site)
		err := updateSite(site.ID, site.Name, site.URL, site.CategoryID, site.Tags)
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
			log.Printf("Error deleting site: %v\n", err)
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
			log.Printf("Error fetching categories: %v\n", err)
			c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
			return
		}
		log.Printf("Successfully fetched %d categories\n", len(categories))
		c.JSON(http.StatusOK, categories)
	case "POST":
		var req AddCategoryRequest
		if err := c.ShouldBindJSON(&req); err != nil {
			log.Printf("Error binding JSON for new category: %v\n", err)
			c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
			return
		}
		if req.Color == "" {
			req.Color = "#1976d2"
		}
		if req.Icon == "" {
			req.Icon = "folder"
		}
		log.Printf("Adding new category: %+v\n", req)
		newCategory, err := addCategory(req.Name, req.Color, req.Icon)
		if err != nil {
			log.Printf("Error adding new category: %v\n", err)
			c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
			return
		}
		c.JSON(http.StatusCreated, newCategory)
	case "PUT":
		var category Category
		if err := c.ShouldBindJSON(&category); err != nil {
			log.Printf("Error binding JSON for category update: %v\n", err)
			c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
			return
		}
		err := updateCategory(category.ID, category.Name, category.Color, category.Icon)
		if err != nil {
			log.Printf("Error updating category: %v\n", err)
			c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
			return
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
			log.Printf("Error deleting category: %v\n", err)
			c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
			return
		}
		c.JSON(http.StatusOK, gin.H{"message": "Category deleted successfully"})
	}
}

func apiNotesHandler(c *gin.Context) {
	switch c.Request.Method {
	case "GET":
		notes, err := getNotes()
		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
			return
		}
		c.JSON(http.StatusOK, notes)
	case "POST":
		var req AddNoteRequest
		if err := c.ShouldBindJSON(&req); err != nil {
			c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
			return
		}
		err := addNote(req.Title, req.Content, req.Tags)
		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
			return
		}
		c.JSON(http.StatusCreated, gin.H{"message": "Note added successfully"})
	case "PUT":
		var note Note
		if err := c.ShouldBindJSON(&note); err != nil {
			c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
			return
		}
		err := updateNote(note.ID, note.Title, note.Content, note.Tags)
		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
			return
		}
		c.JSON(http.StatusOK, gin.H{"message": "Note updated successfully"})
	case "DELETE":
		id := c.Query("id")
		if id == "" {
			c.JSON(http.StatusBadRequest, gin.H{"error": "Missing note ID"})
			return
		}
		noteID, err := strconv.Atoi(id)
		if err != nil {
			c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid note ID"})
			return
		}
		err = deleteNote(noteID)
		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
			return
		}
		c.JSON(http.StatusOK, gin.H{"message": "Note deleted successfully"})
	}
}

func apiTasksHandler(c *gin.Context) {
	switch c.Request.Method {
	case "GET":
		tasks, err := getTasks()
		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
			return
		}
		c.JSON(http.StatusOK, tasks)
	case "POST":
		var req AddTaskRequest
		if err := c.ShouldBindJSON(&req); err != nil {
			c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
			return
		}
		if req.Priority == 0 {
			req.Priority = 1
		}
		err := addTask(req.Title, req.Description, req.Priority, req.DueDate)
		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
			return
		}
		c.JSON(http.StatusCreated, gin.H{"message": "Task added successfully"})
	case "PUT":
		var task Task
		if err := c.ShouldBindJSON(&task); err != nil {
			c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
			return
		}
		err := updateTask(task.ID, task.Title, task.Description, task.Completed, task.Priority, task.DueDate)
		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
			return
		}
		c.JSON(http.StatusOK, gin.H{"message": "Task updated successfully"})
	case "DELETE":
		id := c.Query("id")
		if id == "" {
			c.JSON(http.StatusBadRequest, gin.H{"error": "Missing task ID"})
			return
		}
		taskID, err := strconv.Atoi(id)
		if err != nil {
			c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid task ID"})
			return
		}
		err = deleteTask(taskID)
		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
			return
		}
		c.JSON(http.StatusOK, gin.H{"message": "Task deleted successfully"})
	}
}

func apiWidgetsHandler(c *gin.Context) {
	switch c.Request.Method {
	case "GET":
		widgets, err := getWidgets()
		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
			return
		}
		c.JSON(http.StatusOK, widgets)
	case "PUT":
		var widget Widget
		if err := c.ShouldBindJSON(&widget); err != nil {
			c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
			return
		}
		err := updateWidget(widget.ID, widget.Position, widget.Size, widget.Config)
		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
			return
		}
		c.JSON(http.StatusOK, gin.H{"message": "Widget updated successfully"})
	}
}

func apiSettingsHandler(c *gin.Context) {
	switch c.Request.Method {
	case "GET":
		settings, err := getSettings()
		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
			return
		}
		c.JSON(http.StatusOK, settings)
	case "PUT":
		var setting Setting
		if err := c.ShouldBindJSON(&setting); err != nil {
			c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
			return
		}
		err := setSetting(setting.Key, setting.Value)
		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
			return
		}
		c.JSON(http.StatusOK, gin.H{"message": "Setting updated successfully"})
	}
}

func apiSystemInfoHandler(c *gin.Context) {
	var sysInfo SystemInfo
	
	// Get CPU usage
	cpuPercent, err := cpu.Percent(time.Second, false)
	if err == nil && len(cpuPercent) > 0 {
		sysInfo.CPU = cpuPercent[0]
	}
	
	// Get memory usage
	memStat, err := mem.VirtualMemory()
	if err == nil {
		sysInfo.Memory.Used = memStat.Used
		sysInfo.Memory.Total = memStat.Total
		sysInfo.Memory.Percent = memStat.UsedPercent
	}
	
	// Get disk usage
	diskStat, err := disk.Usage("/")
	if err == nil {
		sysInfo.Disk.Used = diskStat.Used
		sysInfo.Disk.Total = diskStat.Total
		sysInfo.Disk.Percent = diskStat.UsedPercent
	}
	
	c.JSON(http.StatusOK, sysInfo)
}

func apiWeatherHandler(c *gin.Context) {
	// Mock weather data - in real implementation, you'd call a weather API
	weather := WeatherData{
		Location:    "Auto-detected",
		Temperature: 22.5,
		Description: "Partly Cloudy",
		Humidity:    65,
		Icon:        "partly-cloudy",
	}
	c.JSON(http.StatusOK, weather)
}

func apiSiteTitleHandler(c *gin.Context) {
	url := c.Query("url")
	if url == "" {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Missing URL parameter"})
		return
	}

	title, err := getSiteTitle(url)
	if err != nil {
		log.Printf("Error fetching site title: %v\n", err)
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to fetch site title"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"title": title})
}

func apiVisitSiteHandler(c *gin.Context) {
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

	err = incrementSiteVisit(siteID)
	if err != nil {
		log.Printf("Error incrementing site visit: %v\n", err)
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to record visit"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "Visit recorded"})
}

func apiUpdateCategoriesOrderHandler(c *gin.Context) {
	var categories []Category
	if err := c.ShouldBindJSON(&categories); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	err := updateCategoriesOrder(categories)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "Categories order updated successfully"})
}

func apiGeneratePasswordHandler(c *gin.Context) {
	length := 12
	if l := c.Query("length"); l != "" {
		if parsed, err := strconv.Atoi(l); err == nil && parsed > 0 && parsed <= 128 {
			length = parsed
		}
	}

	password := generatePassword(length)
	c.JSON(http.StatusOK, gin.H{"password": password})
}

// Utility functions
func getSiteTitle(urlStr string) (string, error) {
	resp, err := http.Get(urlStr)
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

func generatePassword(length int) string {
	const charset = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*"
	b := make([]byte, length)
	for i := range b {
		randomBytes := make([]byte, 1)
		rand.Read(randomBytes)
		b[i] = charset[randomBytes[0]%byte(len(charset))]
	}
	return string(b)
}

func main() {
	initDB()
	defer closeDB()

	// Set up the API server on port 8080
	go setupAPIServer()

	// Set up the main server on port 80
	setupMainServer()
}

func setupAPIServer() {
	r := gin.Default()

	// Add middleware
	r.Use(Logger())

	// CORS configuration
	config := cors.DefaultConfig()
	config.AllowAllOrigins = true
	config.AllowMethods = []string{"GET", "POST", "PUT", "DELETE", "OPTIONS"}
	config.AllowHeaders = []string{"Origin", "Content-Type", "Authorization"}
	r.Use(cors.New(config))

	// API routes
	api := r.Group("/api")
	{
		// Core data endpoints
		api.Any("/sites", apiSitesHandler)
		api.Any("/categories", apiCategoriesHandler)
		api.Any("/notes", apiNotesHandler)
		api.Any("/tasks", apiTasksHandler)
		api.Any("/widgets", apiWidgetsHandler)
		api.Any("/settings", apiSettingsHandler)
		
		// Utility endpoints
		api.GET("/sites/title", apiSiteTitleHandler)
		api.POST("/sites/visit", apiVisitSiteHandler)
		api.PUT("/categories/order", apiUpdateCategoriesOrderHandler)
		
		// System and external data
		api.GET("/system", apiSystemInfoHandler)
		api.GET("/weather", apiWeatherHandler)
		api.GET("/password", apiGeneratePasswordHandler)
	}

	log.Println("API server starting on port 8080")
	r.Run("0.0.0.0:8080")
}

func setupMainServer() {
	// Create a reverse proxy for /api requests
	apiURL, _ := url.Parse("http://localhost:8080")
	apiProxy := httputil.NewSingleHostReverseProxy(apiURL)

	// Create a file server for serving static files from the embedded filesystem
	fsys, err := fs.Sub(webFS, "web")
	if err != nil {
		log.Fatalf("Failed to create sub-filesystem: %v", err)
	}
	fileServer := http.FileServer(http.FS(fsys))

	// Set up the main server
	http.HandleFunc("/", func(w http.ResponseWriter, r *http.Request) {
		if strings.HasPrefix(r.URL.Path, "/api") {
			// Forward API requests to the API server
			apiProxy.ServeHTTP(w, r)
		} else {
			// Serve static files for other requests
			fileServer.ServeHTTP(w, r)
		}
	})

	log.Println("Main server starting on port 80")
	err = http.ListenAndServe(":80", nil)
	if err != nil {
		log.Fatalf("Failed to start main server: %v", err)
	}
}

//go:embed web
var webFS embed.FS
