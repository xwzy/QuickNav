# Personal Productivity Dashboard

A comprehensive, modern personal productivity dashboard built with Go and React. This enhanced version transforms the original QuickNav bookmark manager into a full-featured productivity hub with widgets, task management, note-taking, and system monitoring capabilities.

[中文版 README](README_zh.md)

## 🌟 Features

### 📊 **Dashboard Overview**
- **Drag & Drop Widgets**: Customizable widget layout with resize and repositioning
- **Real-time System Monitoring**: CPU, memory, and disk usage tracking
- **Weather Information**: Current weather conditions and forecasts
- **Digital Clock**: Customizable time display with multiple formats
- **Quick Access Panel**: Fast access to frequently used bookmarks

### 🔖 **Enhanced Bookmark Management**
- **Smart Organization**: Category-based organization with custom colors and icons
- **Advanced Search**: Search across names, URLs, and tags
- **Usage Analytics**: Visit count tracking and usage statistics
- **Health Monitoring**: Automatic website availability checking
- **Tag System**: Flexible tagging for better organization
- **Import/Export**: Backup and restore your bookmarks

### 📝 **Note-Taking System**
- **Rich Text Notes**: Full-featured note creation and editing
- **Tag-based Organization**: Categorize notes with custom tags
- **Quick Search**: Instant search across all note content
- **Recent Activity**: Track recently modified notes
- **Export Options**: Export notes in various formats

### ✅ **Task Management**
- **Priority System**: High, medium, and low priority tasks
- **Due Date Tracking**: Set and monitor task deadlines
- **Progress Analytics**: Visual task completion statistics
- **Overdue Alerts**: Highlight overdue tasks
- **Filtering Options**: View all, pending, or completed tasks
- **Quick Actions**: Fast task creation and status updates

### ⚙️ **Advanced Settings**
- **Theme Customization**: Light and dark mode support
- **Layout Options**: Grid and list view layouts
- **Data Management**: Export/import functionality
- **Security Tools**: Built-in password generator
- **System Information**: Real-time system status monitoring

### 🛠️ **Developer Features**
- **REST API**: Comprehensive API for all operations
- **Real-time Updates**: Live data synchronization
- **Performance Monitoring**: Built-in system resource tracking
- **Responsive Design**: Mobile-first responsive interface
- **Modern Architecture**: Clean separation of concerns

## 🚀 Installation

### Quick Start

1. **Download the latest release** from the [Releases](https://github.com/xwzy/QuickNav/releases) page
2. **Extract** the downloaded file to your preferred location
3. **Run the executable**:
   - **Windows**: Double-click `ProductivityDashboard.exe`
   - **macOS/Linux**: Run `./ProductivityDashboard` in terminal
4. **Open your browser** and navigate to `http://localhost:80`

### From Source

```bash
# Clone the repository
git clone https://github.com/xwzy/QuickNav.git
cd QuickNav

# Install Go dependencies
go mod download

# Build the React frontend
cd quick-nav-react
npm install
npm run build

# Build the Go backend
cd ..
go build -o ProductivityDashboard

# Run the application
./ProductivityDashboard
```

## 🖥️ Usage

### First Launch
1. The application creates a `dashboard.db` file automatically
2. Sample data is populated for demonstration
3. Access the dashboard at `http://localhost:80`

### Dashboard Navigation
- **Dashboard**: Main widget-based overview
- **Bookmarks**: Manage and organize your bookmarks
- **Notes**: Create and manage personal notes
- **Tasks**: Track your todo items and projects
- **Settings**: Customize appearance and behavior

### Widget Management
- **Drag and Drop**: Rearrange widgets by dragging them
- **Resize**: Drag widget corners to resize
- **Auto-save**: All layout changes are saved automatically

### Keyboard Shortcuts
- `Ctrl + N`: Create new note
- `Ctrl + T`: Create new task
- `Ctrl + B`: Create new bookmark
- `Ctrl + /`: Focus search

## 🏗️ Architecture

### Backend (Go)
- **Web Server**: Gin framework for HTTP routing
- **Database**: SQLite for data persistence
- **API Design**: RESTful API with JSON responses
- **System Monitoring**: Real-time resource monitoring
- **Security**: Built-in password generation and validation

### Frontend (React)
- **UI Framework**: Material-UI with custom themes
- **State Management**: React hooks and context
- **Layout Engine**: React Grid Layout for widgets
- **Responsive Design**: Mobile-first approach
- **Real-time Updates**: Automatic data synchronization

### Database Schema
```sql
-- Enhanced tables with timestamps and metadata
CREATE TABLE categories (
    id INTEGER PRIMARY KEY,
    name TEXT NOT NULL,
    order_num INTEGER UNIQUE,
    color TEXT DEFAULT '#1976d2',
    icon TEXT DEFAULT 'folder',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE sites (
    id INTEGER PRIMARY KEY,
    name TEXT NOT NULL,
    url TEXT NOT NULL,
    category_id INTEGER,
    favicon TEXT DEFAULT '',
    tags TEXT DEFAULT '',
    visit_count INTEGER DEFAULT 0,
    last_visit DATETIME,
    is_healthy BOOLEAN DEFAULT TRUE,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE notes (
    id INTEGER PRIMARY KEY,
    title TEXT NOT NULL,
    content TEXT DEFAULT '',
    tags TEXT DEFAULT '',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE tasks (
    id INTEGER PRIMARY KEY,
    title TEXT NOT NULL,
    description TEXT DEFAULT '',
    completed BOOLEAN DEFAULT FALSE,
    priority INTEGER DEFAULT 1,
    due_date DATETIME,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);
```

## 🔌 API Endpoints

### Bookmarks
- `GET /api/sites` - Retrieve all bookmarks
- `POST /api/sites` - Create new bookmark
- `PUT /api/sites` - Update existing bookmark
- `DELETE /api/sites?id={id}` - Delete bookmark

### Categories
- `GET /api/categories` - Retrieve all categories
- `POST /api/categories` - Create new category
- `PUT /api/categories` - Update category
- `DELETE /api/categories?id={id}` - Delete category
- `PUT /api/categories/order` - Update category order

### Notes
- `GET /api/notes` - Retrieve all notes
- `POST /api/notes` - Create new note
- `PUT /api/notes` - Update existing note
- `DELETE /api/notes?id={id}` - Delete note

### Tasks
- `GET /api/tasks` - Retrieve all tasks
- `POST /api/tasks` - Create new task
- `PUT /api/tasks` - Update existing task
- `DELETE /api/tasks?id={id}` - Delete task

### System & Utilities
- `GET /api/system` - System resource information
- `GET /api/weather` - Weather data
- `GET /api/settings` - Application settings
- `PUT /api/settings` - Update settings
- `GET /api/password?length={n}` - Generate secure password

## 🎨 Customization

### Themes
The application supports both light and dark themes with customizable color schemes:

```javascript
// Custom theme colors
const customTheme = {
  primary: '#1976d2',
  secondary: '#dc004e',
  success: '#2e7d32',
  warning: '#ed6c02',
  error: '#d32f2f',
  info: '#0288d1'
};
```

### Widget Configuration
Each widget can be configured through the settings panel:

```json
{
  "bookmarks": {
    "showRecent": true,
    "maxItems": 12
  },
  "weather": {
    "location": "auto",
    "units": "metric"
  },
  "tasks": {
    "showCompleted": false,
    "maxItems": 5
  }
}
```

## 🔒 Security

- **Local Storage**: All data stored locally in SQLite
- **No External Dependencies**: Fully self-contained application
- **Password Generation**: Cryptographically secure password generation
- **Health Monitoring**: Website availability checking
- **Data Export**: Secure backup and restore functionality

## 🌐 Browser Support

- Chrome 90+
- Firefox 88+
- Safari 14+
- Edge 90+

## 🤝 Contributing

We welcome contributions! Please see our [Contributing Guidelines](CONTRIBUTING.md) for details.

### Development Setup
```bash
# Backend development
go run .

# Frontend development
cd quick-nav-react
npm start
```

### Building for Production
```bash
# Build frontend
cd quick-nav-react
npm run build

# Build backend with embedded frontend
cd ..
go build -o ProductivityDashboard
```

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🚀 Roadmap

### Version 2.1.0 (Planned)
- [ ] Real weather API integration
- [ ] Calendar integration
- [ ] Mobile app companion
- [ ] Cloud synchronization
- [ ] Browser extension
- [ ] Advanced analytics

### Version 2.2.0 (Future)
- [ ] Collaboration features
- [ ] Plugin system
- [ ] Advanced theming
- [ ] Backup encryption
- [ ] Performance optimizations

## 🙏 Acknowledgments

- **Go Community**: For the excellent ecosystem and libraries
- **React Community**: For the powerful frontend framework
- **Material-UI**: For the beautiful component library
- **SQLite**: For the reliable embedded database
- **Contributors**: Everyone who has contributed to this project

## 📞 Support

- **Issues**: [GitHub Issues](https://github.com/xwzy/QuickNav/issues)
- **Discussions**: [GitHub Discussions](https://github.com/xwzy/QuickNav/discussions)
- **Documentation**: [Wiki](https://github.com/xwzy/QuickNav/wiki)

---

**Made with ❤️ for productivity enthusiasts**
