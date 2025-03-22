# GoFinTech

A full-stack fintech application with a Go backend and HTML/CSS/JS frontend for tracking financial transactions.

# Note
This application is based off a previous fintech app I created [Here](https://github.com/AD-Archer/fintech-app) made with expressjs, node, and mysql(which later transitioned to postgresql) so I decided to remake it in Golang with MongoDB. I left out the need for user registration since this repo will not be hosted and is intended to run locally.

## Features

- Add, edit, and delete financial transactions
- Categorize transactions as income or expenses
- Filter and search transactions
- View financial summary (income, expenses, balance)
- Modern, responsive UI that works on desktop, mobile, and tablets
- MongoDB integration for data persistence

## Tech Stack

- **Backend**: Go with Gin web framework
- **Database**: MongoDB
- **Frontend**: HTML5, CSS3, JavaScript
- **Styling**: Custom CSS with responsive design
- **Icons**: Font Awesome

## Project Structure

```
fintech-app/
├── cmd/
│   └── server/             # Main application entry point
│       └── main.go         
├── internal/
│   ├── api/                # API routes and handlers
│   │   ├── routes.go
│   │   ├── server.go
│   │   └── transaction_handlers.go
│   ├── database/           # Database connection and operations
│   │   └── mongodb.go
│   └── models/             # Data models
│       └── transaction.go
├── static/                 # Static assets
│   ├── css/
│   │   └── styles.css
│   ├── js/
│   │   ├── main.js
│   │   ├── dashboard.js
│   │   └── transactions.js
│   └── img/
├── templates/              # HTML templates
│   ├── index.html
│   └── transactions.html
├── .env                    # Environment variables
├── .gitignore
├── go.mod
├── LICENSE
└── README.md
```

## Setup and Installation

### Prerequisites

- Go 1.21 or higher
- MongoDB

### Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/adarcher21/fintech-app.git
   cd Gofintech
   ```

2. Configure environment variables:
   ```bash
   # Copy the example .env file
   cp .env.example .env
   
   # Edit the .env file with your MongoDB connection string
   ```

3. Install Go dependencies:
   ```bash
   go mod download
   ```

4. Build and run the application:
   ```bash
   go run cmd/server/main.go
   ```

5. Access the application at:
   ```
   http://localhost:8080
   ```

## API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET    | /api/transactions | Get all transactions |
| GET    | /api/transactions/:id | Get a single transaction |
| POST   | /api/transactions | Create a new transaction |
| PUT    | /api/transactions/:id | Update a transaction |
| DELETE | /api/transactions/:id | Delete a transaction |

## License

This project is licensed under the MIT License - see the LICENSE file for details.
