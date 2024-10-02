# QuickNav

QuickNav is a lightweight, efficient web navigation tool built with Go and SQLite. It provides a personalized hub for quick access to your favorite websites.

## Description

QuickNav serves as your personal internet compass, offering a clean and intuitive interface to manage and access your frequently visited websites. Built with simplicity and efficiency in mind, it's perfect for developers, students, or anyone looking to streamline their web browsing experience.

## Features

-   **Simple Interface**: Clean design for easy navigation
-   **Quick Add**: Effortlessly add new website links
-   **Local Storage**: Secure storage using SQLite database
-   **Single Binary Deployment**: Easy to deploy with just one executable file
-   **Cross-Platform**: Runs on Windows, Mac, and Linux
-   **Offline Capable**: Fully functional without an internet connection

## Installation

1. Go to the [Releases](https://github.com/xwzy/QuickNav/releases) page of the QuickNav repository.
2. Download the latest release for your operating system (Windows, macOS, or Linux).
3. Extract the downloaded file to a location of your choice.

## Usage

1. Open a terminal or command prompt.
2. Navigate to the directory where you extracted QuickNav.
3. Run the QuickNav executable:
    - On Windows: Double-click the `QuickNav.exe` file or run it from the command line.
    - On macOS/Linux: Open a terminal and run `./QuickNav`
4. Open your web browser and go to `http://localhost:8080`
5. Start adding your favorite websites!

Note: The first time you run QuickNav, it will create a `nav.db` file in the same directory. This file stores your website links.

## Building from Source

If you want to build QuickNav from source:

1. Ensure you have Go installed on your system.
2. Clone this repository:
    ```
    git clone https://github.com/xwzy/QuickNav.git
    ```
3. Navigate to the project directory:
    ```
    cd QuickNav
    ```
4. Build the project:
    ```
    go build
    ```

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Acknowledgments

-   Thanks to the Go community for the excellent `database/sql` package
-   Shoutout to the `github.com/mattn/go-sqlite3` project for SQLite support in Go
