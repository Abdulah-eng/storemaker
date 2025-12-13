# 🛍️ E-Commerce Platform

A full-stack e-commerce platform built with **Next.js** (frontend) and **Go/Gin** (backend), featuring AI-powered store creation, drag-and-drop website builder, and comprehensive admin panel.

## 🚀 Quick Start

### Prerequisites

- **Node.js** (v18 or higher)
- **Go** (v1.21 or higher)
- **PostgreSQL** (v13 or higher)
- **Git**

### 1. Clone the Repository

```bash
git clone <repository-url>
cd abdo
```

### 2. Backend Setup

#### Install Go Dependencies
```bash
cd backend
go mod download
```

#### Database Setup
1. **Create PostgreSQL Database:**
```sql
CREATE DATABASE storemaker;
CREATE USER storemaker_user WITH PASSWORD 'your_password';
GRANT ALL PRIVILEGES ON DATABASE storemaker TO storemaker_user;
```

2. **Configure Environment Variables:**
```bash
# Create .env file in backend directory
cp .env.example .env
```

Edit `backend/.env`:
```env
DB_HOST=localhost
DB_PORT=5432
DB_USER=storemaker_user
DB_PASSWORD=your_password
DB_NAME=storemaker
DB_SSL_MODE=disable

JWT_SECRET=your_jwt_secret_key_here
GEMINI_API_KEY=AIzaSyDJ_qhYqnP3C5T0bVpqG1O3vFFz3jydiOs

PORT=8080
CORS_ORIGIN=http://localhost:3000
```

#### Run Database Migrations
```bash
go run cmd/main.go
```

#### Seed Sample Data (Optional)
```bash
# Seed templates
go run cmd/seed/seed-templates.go

# Seed products
go run cmd/seed/seed-products.go
```

#### Start Backend Server
```bash
go run cmd/main.go
```

Backend will be running at: **http://localhost:8080**

### 3. Frontend Setup

#### Install Node.js Dependencies
```bash
cd frontend
npm install
```

#### Configure Environment Variables
```bash
# Create .env.local file in frontend directory
cp .env.example .env.local
```

Edit `frontend/.env.local`:
```env
NEXT_PUBLIC_API_URL=http://localhost:8080/api/v1
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

#### Start Frontend Development Server
```bash
npm run dev
```

Frontend will be running at: **http://localhost:3000**

## 📁 Project Structure

```
abdo/
├── backend/                 # Go/Gin Backend
│   ├── cmd/
│   │   ├── main.go         # Main application entry
│   │   └── seed/           # Database seeding scripts
│   ├── controllers/        # API controllers
│   ├── models/            # Database models
│   ├── routes/            # API routes
│   ├── database/          # Database configuration
│   ├── middleware/        # Custom middleware
│   └── utils/             # Utility functions
├── frontend/              # Next.js Frontend
│   ├── src/
│   │   ├── app/           # App router pages
│   │   ├── components/    # React components
│   │   ├── contexts/      # React contexts
│   │   ├── lib/           # Utility libraries
│   │   └── styles/        # CSS styles
│   └── public/            # Static assets
└── README.md
```

## 🔧 Available Scripts

### Backend Scripts
```bash
cd backend

# Run development server
go run cmd/main.go

# Run with hot reload (requires air)
air

# Run tests
go test ./...

# Build for production
go build -o bin/server cmd/main.go
```

### Frontend Scripts
```bash
cd frontend

# Development server
npm run dev

# Build for production
npm run build

# Start production server
npm start

# Run tests
npm test

# Lint code
npm run lint

# Type check
npm run type-check
```

## 🌐 API Endpoints

### Authentication
- `POST /api/v1/auth/register` - User registration
- `POST /api/v1/auth/login` - User login
- `POST /api/v1/auth/logout` - User logout

### Stores
- `GET /api/v1/manage/stores` - Get user stores
- `POST /api/v1/manage/stores` - Create store
- `POST /api/v1/manage/stores/ai` - Create AI-powered store
- `GET /api/v1/stores/:slug` - Get public store
- `PUT /api/v1/manage/stores/:id` - Update store

### Store Builder
- `GET /api/v1/manage/stores/:id/layout` - Get store layout
- `PUT /api/v1/manage/stores/:id/layout` - Update store layout

### Products
- `GET /api/v1/manage/stores/:id/products` - Get store products
- `POST /api/v1/manage/stores/:id/products` - Create product
- `PUT /api/v1/manage/stores/:id/products/:productId` - Update product
- `DELETE /api/v1/manage/stores/:id/products/:productId` - Delete product

### Templates
- `GET /api/v1/manage/templates` - Get templates
- `POST /api/v1/manage/templates` - Create template
- `PUT /api/v1/manage/templates/:id` - Update template
- `DELETE /api/v1/manage/templates/:id` - Delete template

### Newsletter
- `POST /api/v1/stores/:slug/newsletter/subscribe` - Subscribe to newsletter
- `POST /api/v1/stores/:slug/newsletter/unsubscribe` - Unsubscribe from newsletter

## 👤 Default Admin Credentials

```
Email: admin@storemaker.com
Password: admin123
```

## 🛠️ Development

### Backend Development

1. **Database Migrations:**
   - GORM AutoMigrate handles schema changes automatically
   - Check `database/database.go` for migration configuration

2. **API Development:**
   - Controllers in `controllers/` directory
   - Models in `models/` directory
   - Routes in `routes/routes.go`

3. **Testing:**
   ```bash
   go test ./controllers
   go test ./models
   ```

### Frontend Development

1. **Component Development:**
   - Store builder components in `components/store-builder/`
   - UI components in `components/ui/`
   - Page components in `app/` directory

2. **State Management:**
   - Cart context in `contexts/CartContext.tsx`
   - API client in `lib/api.ts`

3. **Styling:**
   - Tailwind CSS for styling
   - Custom components in `components/ui/`

## 🚀 Deployment

### Backend Deployment

1. **Build the application:**
   ```bash
   cd backend
   go build -o bin/server cmd/main.go
   ```

2. **Set production environment variables:**
   ```env
   DB_HOST=your_db_host
   DB_PORT=5432
   DB_USER=your_db_user
   DB_PASSWORD=your_db_password
   DB_NAME=your_db_name
   JWT_SECRET=your_production_jwt_secret
   PORT=8080
   ```

3. **Run the server:**
   ```bash
   ./bin/server
   ```

### Frontend Deployment

1. **Build for production:**
   ```bash
   cd frontend
   npm run build
   ```

2. **Set production environment variables:**
   ```env
   NEXT_PUBLIC_API_URL=https://your-api-domain.com/api/v1
   NEXT_PUBLIC_APP_URL=https://your-frontend-domain.com
   ```

3. **Deploy to your hosting platform (Vercel, Netlify, etc.)**

## 🔍 Troubleshooting

### Common Issues

1. **Database Connection Error:**
   - Verify PostgreSQL is running
   - Check database credentials in `.env`
   - Ensure database exists

2. **Port Already in Use:**
   - Change port in `.env` file
   - Kill existing processes using the port

3. **CORS Errors:**
   - Verify `CORS_ORIGIN` in backend `.env`
   - Check frontend API URL configuration

4. **JWT Token Issues:**
   - Ensure `JWT_SECRET` is set in backend `.env`
   - Clear browser localStorage if needed

5. **AI Store Creation Fails:**
   - Verify `GEMINI_API_KEY` is set
   - Check internet connection
   - Review API response in browser console

### Debug Mode

**Backend Debug:**
```bash
cd backend
go run cmd/main.go -debug
```

**Frontend Debug:**
```bash
cd frontend
DEBUG=* npm run dev
```

## 📝 Environment Variables Reference

### Backend (.env)
| Variable | Description | Default |
|----------|-------------|---------|
| `DB_HOST` | Database host | localhost |
| `DB_PORT` | Database port | 5432 |
| `DB_USER` | Database user | - |
| `DB_PASSWORD` | Database password | - |
| `DB_NAME` | Database name | - |
| `JWT_SECRET` | JWT signing secret | - |
| `GEMINI_API_KEY` | Google AI API key | - |
| `PORT` | Server port | 8080 |
| `CORS_ORIGIN` | Allowed CORS origin | http://localhost:3000 |

### Frontend (.env.local)
| Variable | Description | Default |
|----------|-------------|---------|
| `NEXT_PUBLIC_API_URL` | Backend API URL | http://localhost:8080/api/v1 |
| `NEXT_PUBLIC_APP_URL` | Frontend app URL | http://localhost:3000 |

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License.

## 🆘 Support

For support and questions:
- Create an issue in the repository
- Check the troubleshooting section above
- Review the API documentation

---

**Happy coding! 🎉**"# website-builder" 
"# website-builder" 
