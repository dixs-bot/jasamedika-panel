# PT Jasamedika Saranatama - Admin Panel

Sistem administrasi karyawan yang production-ready untuk PT Jasamedika Saranatama. Dibangun dengan backend Node.js/Express dan frontend React/Vite, menggunakan penyimpanan JSON file yang mudah diupgrade ke database.

## 🏥 Tentang Project

Admin panel ini dirancang khusus untuk kebutuhan manajemen karyawan di rumah sakit/klinik dengan tampilan profesional yang bersih dan user-friendly. Menggunakan warna biru/hijau medical yang nyaman untuk penggunaan jangka panjang.

## 🛠️ Teknologi yang Digunakan

### Backend (Node.js 18+)
- **Framework**: Express.js - REST API yang robust dan scalable
- **Authentication**: JWT (JSON Web Tokens) - Stateless auth dengan expiry
- **Password Hashing**: bcryptjs - Security best practice
- **File Upload**: Multer - Handle upload photo karyawan
- **CORS**: Enabled untuk development
- **Storage**: JSON files - Mudah migrate ke DB nanti

### Frontend (React 18+)
- **Build Tool**: Vite - Fast development dan optimized build
- **Routing**: React Router v6 - Client-side routing
- **Styling**: Tailwind CSS - Utility-first CSS framework
- **HTTP Client**: Axios - Auto token injection dan error handling
- **Icons**: Lucide React - Modern icon library
- **Charts**: Recharts - Dashboard analytics

### Storage
- **Backend**: JSON files di `backend/data/`
- **Frontend**: LocalStorage untuk JWT token
- **Uploads**: File system untuk photo karyawan

## 📋 Prerequisites

- Node.js 18+ (bisa di Termux Android)
- npm atau yarn
- Git (untuk version control)

## 🚀 Quick Start

### 1. Clone Repository
```bash
git clone <your-repo-url>
cd jasamedika-admin-panel
```

### 2. Install Dependencies
```bash
# Install backend dependencies
cd backend
npm install

# Install frontend dependencies  
cd ../frontend
npm install
```

### 3. Environment Setup
```bash
# Copy example environment file
cd backend
cp .env.example .env

# Edit .env file
nano .env
```

Isi `.env` dengan:
```env
JWT_SECRET=your_random_64_character_string_here_minimum_length_for_security
PORT=8080
NODE_ENV=development
```

### 4. Generate JWT Secret
```bash
# Method 1: Using openssl (recommended)
openssl rand -base64 32 | tr -d "=+/" | cut -c1-64

# Method 2: Using node
node -e "console.log(require('crypto').randomBytes(32).toString('base64').replace(/[+=\/]/g, '').substring(0, 64))"

# Method 3: Manual (minimum 64 characters)
# Contoh: MySecretKeyForJWTTokenGeneration2024VeryLongStringForSecurity
```

### 5. Start Services

#### Method A: Using Scripts (Recommended)
```bash
# Make scripts executable (Linux/Mac/Termux)
chmod +x scripts/start-all.sh scripts/stop-all.sh

# Start all services
./scripts/start-all.sh

# Stop all services
./scripts/stop-all.sh
```

#### Method B: Manual Start
```bash
# Terminal 1 - Start Backend
cd backend
export $(cat .env | xargs)
node server.js

# Terminal 2 - Start Frontend  
cd frontend
npm run dev -- --host
```

### 6. Initialize Admin Data
```bash
curl -X POST http://localhost:8080/api/auth/init-data \
  -H "Content-Type: application/json" \
  -d '{
    "namaAdmin": "Administrator",
    "perusahaan": "PT Jasamedika Saranatama"
  }'
```

Response akan berisi email dan password admin:
```json
{
  "message": "Data awal berhasil dibuat",
  "data": {
    "email": "admin@jasamedikasaranatama.local",
    "password": "RandomGeneratedPassword123!",
    "profile": {
      "idUser": "u_1234567890_abc123",
      "profile": "p_1234567890_def456", 
      "namaLengkap": "Administrator",
      "email": "admin@jasamedikasaranatama.local",
      "role": "admin",
      "perusahaan": "PT Jasamedika Saranatama"
    }
  }
}
```

### 7. Access Application
- **Frontend**: http://localhost:5173
- **Backend API**: http://localhost:8080
- **Health Check**: http://localhost:8080/health

Login dengan credentials dari step 6.

## 📁 Struktur Project

```
/
├── README.md                    # Dokumentasi lengkap
├── .gitignore                   # File yang diignore Git
├── scripts/                     # Utility scripts
│   ├── start-all.sh            # Start semua services
│   └── stop-all.sh             # Stop semua services
├── backend/                     # Node.js backend
│   ├── package.json            # Backend dependencies
│   ├── server.js               # Express server utama
│   ├── .env.example            # Environment template
│   ├── routes/                 # API routes
│   │   ├── auth.js            # Authentication endpoints
│   │   ├── employees.js       # Employee CRUD
│   │   └── users.js           # User management
│   ├── utils/                  # Utility functions
│   │   ├── storage.js         # JSON file operations
│   │   └── auth.js            # JWT middleware
│   ├── data/                   # JSON data storage
│   │   ├── users.json         # User data
│   │   ├── employees.json     # Employee data
│   │   └── companies.json     # Company data
│   └── uploads/               # File uploads (photos)
└── frontend/                   # React frontend
    ├── package.json           # Frontend dependencies
    ├── vite.config.js         # Vite configuration
    ├── index.html             # HTML template
    ├── tailwind.config.js     # Tailwind config
    ├── public/                # Static assets
    │   └── brand.json         # Brand configuration
    └── src/                   # React source code
        ├── main.jsx           # App entry point
        ├── App.jsx            # Main app component
        ├── contexts/          # React contexts
        │   └── AuthContext.jsx
        ├── components/        # Reusable components
        │   ├── Layout.jsx
        │   ├── Header.jsx
        │   ├── Sidebar.jsx
        │   ├── Card.jsx
        │   ├── Button.jsx
        │   └── ProtectedRoute.jsx
        ├── pages/             # Page components
        │   ├── Login.jsx
        │   ├── Dashboard.jsx
        │   ├── Employees.jsx
        │   ├── EmployeeForm.jsx
        │   └── Users.jsx
        ├── services/          # API services
        │   └── api.js
        └── styles/            # CSS styles
            └── globals.css
```

## 🔌 API Documentation

### Authentication Endpoints

#### Initialize Data
```bash
POST /api/auth/init-data
Content-Type: application/json

{
  "namaAdmin": "Administrator",
  "perusahaan": "PT Jasamedika Saranatama"
}
```

#### Login
```bash
POST /api/auth/login
Content-Type: application/json

{
  "email": "admin@jasamedikasaranatama.local",
  "password": "password123"
}
```

Response:
```json
{
  "message": "Login berhasil",
  "hasil": {
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "info": {
      "idUser": "u_1234567890_abc123",
      "namaLengkap": "Administrator",
      "email": "admin@jasamedikasaranatama.local",
      "role": "admin"
    }
  }
}
```

#### Change Password
```bash
POST /api/auth/ubah-password-sendiri
Authorization: Bearer <token>
Content-Type: application/json

{
  "passwordAsli": "oldpassword",
  "passwordBaru1": "newpassword",
  "passwordBaru2": "newpassword"
}
```

### Employee Endpoints

#### Get Employees
```bash
GET /api/employees?page=1&limit=10&q=search_term
Authorization: Bearer <token>
```

#### Create Employee
```bash
POST /api/employees
Authorization: Bearer <token>
Content-Type: multipart/form-data

namaLengkap=John Doe&email=john@example.com&photo=@file.jpg
```

#### Update Employee
```bash
PUT /api/employees/:id
Authorization: Bearer <token>
Content-Type: multipart/form-data

namaLengkap=John Updated&email=john.updated@example.com
```

#### Delete Employee
```bash
DELETE /api/employees/:id
Authorization: Bearer <token>
```

### User Management Endpoints

#### Get Users (Admin Only)
```bash
GET /api/auth/users
Authorization: Bearer <token>
```

#### Create User (Admin Only)
```bash
POST /api/auth/users
Authorization: Bearer <token>
Content-Type: application/json

{
  "email": "user@example.com",
  "namaLengkap": "New User",
  "role": "user"
}
```

#### Reset Password (Admin Only)
```bash
POST /api/auth/users/:id/reset-password
Authorization: Bearer <token>
```

## 🌐 Frontend Features

### 1. **Authentication System**
- Login form dengan validation
- JWT token management
- Auto-logout on token expiry
- Protected routes

### 2. **Dashboard**
- Statistics cards (total employees, departments, positions)
- Recent employees list
- Quick action buttons
- Responsive design

### 3. **Employee Management**
- List dengan search dan pagination
- Create/Edit/Delete operations
- Photo upload dengan preview
- Form validation
- Date picker untuk tanggal lahir

### 4. **User Management**
- User creation dengan role assignment
- Password reset functionality
- Admin-only access control

### 5. **UI/UX Features**
- Medical theme (biru/hijau)
- Responsive design untuk mobile & desktop
- Loading states
- Error handling
- Toast notifications
- Smooth transitions

## 📱 Termux Android Setup

### Install Node.js di Termux
```bash
# Update packages
pkg update && pkg upgrade

# Install Node.js
pkg install nodejs

# Install Git
pkg install git

# Verify installation
node --version
npm --version
```

### Setup Project di Termux
```bash
# Clone repository
git clone <your-repo-url>
cd jasamedika-admin-panel

# Install dependencies
cd backend && npm install
cd ../frontend && npm install
cd ..

# Start services
./scripts/start-all.sh
```

### Access dari Android Browser
- Buka browser Chrome/Firefox
- Akses http://localhost:5173
- Login dengan admin credentials

## 🔧 Development

### Backend Development
```bash
cd backend
npm run dev  # Dengan nodemon auto-restart
```

### Frontend Development
```bash
cd frontend
npm run dev  # Vite dev server dengan HMR
```

### Build for Production
```bash
# Build frontend
cd frontend
npm run build

# Output ada di frontend/dist/
```

### Environment Variables
```bash
# Development
NODE_ENV=development
JWT_SECRET=your_dev_secret
PORT=8080

# Production
NODE_ENV=production
JWT_SECRET=your_production_secret_min_64_chars
PORT=8080
```

## 🚀 Deployment

### Build & Compress
```bash
# Build frontend
cd frontend
npm run build

# Compress untuk distribution
cd ..
7z a jasamedika-admin-panel-v1.0.0.7z \
  backend/ \
  frontend/dist/ \
  scripts/ \
  README.md \
  .gitignore \
  backend/.env.example

# Atau menggunakan RAR
rar a -r jasamedika-admin-panel-v1.0.0.rar \
  backend/ \
  frontend/dist/ \
  scripts/ \
  README.md \
  .gitignore \
  backend/.env.example
```

### Upload ke Google Drive
1. Buka Google Drive di browser
2. Upload compressed file
3. Share link dengan recipient

### Server Deployment
```bash
# Extract di server
7z x jasamedika-admin-panel-v1.0.0.7z

# Setup production environment
cd backend
cp .env.example .env
# Edit .env dengan production JWT_SECRET

# Install dependencies
npm install --production

# Start dengan PM2 (recommended)
npm install -g pm2
pm2 start server.js --name "jasamedika-admin"

# Atau dengan nohup
nohup node server.js > /var/log/jasamedika-backend.log 2>&1 &

# Setup reverse proxy (nginx/apache) untuk frontend
# Serve frontend/dist/ sebagai static files
```

## 🧪 Testing API dengan cURL

### 1. Initialize Admin Data
```bash
curl -X POST http://localhost:8080/api/auth/init-data \
  -H "Content-Type: application/json" \
  -d '{"namaAdmin":"Admin User","perusahaan":"PT Jasamedika Saranatama"}'
```

### 2. Login
```bash
curl -X POST http://localhost:8080/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@jasamedikasaranatama.local","password":"generated_password"}'
```

### 3. Get Employees (dengan token)
```bash
curl -X GET http://localhost:8080/api/employees \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

### 4. Create Employee
```bash
curl -X POST http://localhost:8080/api/employees \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -F "namaLengkap=John Doe" \
  -F "email=john@example.com" \
  -F "namaJabatan=Software Engineer" \
  -F "namaDepartemen=IT" \
  -F "photo=@/path/to/photo.jpg"
```

## 🔒 Security Considerations

### JWT Secret
- Minimum 64 characters
- Gunakan random string yang kuat
- Jangan hardcode di source code
- Rotate secret secara berkala

### Password Security
- Minimum 6 characters untuk user password
- Admin password minimum 12 characters
- Hash dengan bcrypt (cost 10)
- Reset password functionality

### File Upload
- Max file size: 5MB
- Allowed types: jpeg, jpg, png, gif
- File validation di backend
- Serve uploads via static route

### API Security
- CORS enabled untuk development
- JWT token verification
- Role-based access control
- Input validation dan sanitization

## 🐛 Troubleshooting

### Common Issues

#### 1. JWT_SECRET Error
```
ERROR: JWT_SECRET environment variable is required!
```
**Solution**: Set JWT_SECRET di .env file atau export environment variable.

#### 2. Port Already in Use
```
Error: listen EADDRINUSE :::8080
```
**Solution**: Kill existing process atau ganti port di .env.

#### 3. Permission Denied (Termux)
```
chmod: changing permissions: Operation not permitted
```
**Solution**: Skip chmod, scripts tetap bisa dijalankan dengan `bash scripts/start-all.sh`.

#### 4. Frontend Cannot Connect to Backend
**Solution**: Pastikan backend running dan proxy configuration di vite.config.js benar.

#### 5. File Upload Failed
**Solution**: Check folder permissions dan pastikan uploads folder ada.

### Debug Mode
```bash
# Backend debug
cd backend
DEBUG=* node server.js

# Frontend debug
cd frontend
npm run dev -- --debug
```

### Check Logs
```bash
# Backend logs
tail -f logs/backend.log

# Frontend logs  
tail -f logs/frontend.log

# Real-time logs
tail -f logs/*.log
```

## 📈 Performance Optimization

### Backend
- JSON file operations dengan async/await
- Memory caching untuk frequently accessed data
- Efficient pagination
- Image compression untuk uploads

### Frontend
- Code splitting dengan React.lazy
- Image optimization
- Bundle size analysis
- Service worker untuk offline support

## 🔄 Database Migration Path

Saat ini menggunakan JSON files, mudah migrate ke database:

### 1. PostgreSQL Migration
```javascript
// Install dependencies
npm install pg

// Update storage.js untuk PostgreSQL
// Ganti JSON operations dengan SQL queries
```

### 2. MongoDB Migration  
```javascript
// Install dependencies
npm install mongodb

// Update storage.js untuk MongoDB
// Ganti JSON operations dengan MongoDB queries
```

### 3. Migration Script
```javascript
// Create migration script
// Export existing JSON data
// Import ke database
// Update storage layer
```

## 📞 Support & Contributing

### Getting Help
1. Check README dan documentation
2. Search existing issues
3. Create new issue dengan detail error
4. Include logs dan environment details

### Contributing
1. Fork repository
2. Create feature branch
3. Make changes dengan proper testing
4. Submit pull request
5. Follow coding standards

### Coding Standards
- Use ESLint untuk code quality
- Follow React best practices
- Comment complex logic
- Use meaningful variable names
- Proper error handling

## 📄 License

MIT License - feel free to use untuk commercial projects.

---

**PT Jasamedika Saranatama**  
Admin Panel v1.0.0  
Production-ready employee management system

*Last updated: $(date)*