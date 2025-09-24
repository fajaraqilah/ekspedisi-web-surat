# Ekspedisi Surat (Letter Expedition) - Supabase Version
# Ekspedisi Surat - Mail Management System

A comprehensive mail tracking and management system for PTPN I with Supabase integration, analytics dashboards, and digital signature capabilities.

## 🏗️ **Project Overview**

This is a refactored version of the "Ekspedisi Surat" application that integrates with Supabase for authentication, database, and storage. The system includes mail tracking, user confirmation workflows, analytics dashboards, and Google Looker Studio integration.

## 📁 **Project Structure**

```
ekepcedisi-web/
├── assets/
│   ├── css/
│   │   ├── input.css        # Tailwind CSS source file
│   │   └── output.css       # Compiled and optimized CSS
│   └── js/
│       ├── admin.js         # Admin dashboard functionality
│       ├── auth.js          # Authentication system
│       ├── dashboard.js     # Analytics dashboard
│       ├── sidebar.js       # Navigation sidebar
│       ├── storage.js       # File storage utilities
│       ├── supabase.js      # Supabase client configuration
│       ├── user.js          # User dashboard functionality
│       └── utils.js         # Shared utility functions
├── config/
│   ├── config.template.js   # Configuration template
│   └── environment.js       # Environment configuration
├── admin.html               # Admin management dashboard
├── dashboard.html           # Mail analytics dashboard  
├── dspi-dashboard.html      # Google Looker Studio dashboard
├── index.html               # User dashboard (main entry point)
├── login.html               # Authentication page
├── reset-password.html      # Password reset page
├── tailwind.config.js       # Tailwind CSS configuration
├── postcss.config.js        # PostCSS configuration
└── package.json             # Dependencies and scripts
```

## 🎨 **UI Framework**

**Tailwind CSS Production Setup**: This project uses a **local Tailwind CSS build** instead of CDN for better performance and optimization.

### Quick Start - CSS Build
```bash
# Development (watch mode)
npm run dev

# Production build
npm run build
```

## ✨ **Features**

### 🔐 **Authentication System**
- Supabase Auth integration for admin login
- Forgot password functionality with email reset links
- Secure password update workflow
- Registration for new admin accounts
- Protected admin routes

### 🗄️ **Database Management (Supabase)**
- Complete migration from LocalStorage to Supabase Database
- **Mail Records Table** with fields:
  - `nomor` (string) - Mail number
  - `tanggal_pengiriman` (date) - Sending date
  - `perihal` (string) - Subject
  - `jenis_surat` (string) - Mail type
  - `kategori_surat` (string) - Mail category
  - `tujuan_surat` (string) - Destination
  - `penerima` (string) - Recipient
  - `bukti_ttd_url` (string) - Signature URL from Supabase Storage
  - `tanggal_diterima` (date) - Receipt date
  - `status` (enum: Diterima / Dikembalikan) - Mail status

### 📁 **File Storage (Supabase)**
- Secure signature storage in private Supabase Storage bucket
- Canvas-based digital signatures saved as PNG
- Signed URLs with 1-hour expiry for secure access
- Database stores only filenames, generates signed URLs dynamically

### 👨‍💼 **Admin Dashboard (`admin.html`)**
- Complete CRUD operations for mail records
- Excel export functionality with embedded signature images
- Advanced search and filtering
- Responsive data tables
- Modal dialogs for forms and confirmations
- Real-time data sync with Supabase

### 📊 **Analytics Dashboard (`dashboard.html`)**
- Mail analytics and reporting
- Chart.js integration for data visualization
- Statistics cards (total, received, returned, success rate)
- Data visualization from Supabase tables
- Interactive charts and graphs

### 📈 **DSPI Dashboard (`dspi-dashboard.html`)**
- Google Looker Studio integration
- Embedded interactive dashboard with iframe
- Real-time data visualization
- Professional dashboard layout
- Mobile-responsive design

### 👤 **User Dashboard (`index.html`)**
- Mail confirmation interface for recipients
- Digital signature capture with canvas
- Real-time status updates
- Search functionality
- Mobile-friendly design
- No authentication required for basic access

## 🛠️ **Setup Instructions**

### 1. **Install Dependencies**
```bash
npm install
```

### 2. **Build Tailwind CSS**
```bash
# For development (with watch mode)
npm run dev

# For production (minified)
npm run build
```

### 3. **Supabase Setup**

#### Prerequisites
1. Create a Supabase account at [https://supabase.com](https://supabase.com)
2. Create a new Supabase project

#### Database Setup
1. Go to **Table Editor** in your Supabase project
2. Create a new table named `letters` with the following schema:

| Column Name          | Type      | Required | Description                     |
|----------------------|-----------|----------|---------------------------------|
| id                   | UUID      | Yes      | Primary key                     |
| nomor                | TEXT      | Yes      | Letter number                   |
| tanggal_pengiriman   | DATE      | Yes      | Sending date                    |
| perihal              | TEXT      | Yes      | Subject                         |
| jenis_surat          | TEXT      | Yes      | Letter type                     |
| kategori_surat       | TEXT      | Yes      | Letter category                 |
| tujuan_surat         | TEXT      | Yes      | Destination                     |
| penerima             | TEXT      | No       | Recipient                       |
| bukti_ttd_url        | TEXT      | No       | Signature URL                   |
| tanggal_diterima     | DATE      | No       | Received date                   |
| status               | TEXT      | Yes      | Status (Diterima/Dikembalikan)  |
| created_at           | TIMESTAMP | Yes      | Auto-created                    |
| updated_at           | TIMESTAMP | Yes      | Auto-created                    |

#### Storage Setup
1. Go to **Storage** in your Supabase project
2. Create a new bucket named `bukti-ttd`
3. Set the bucket to **private** for security

#### Authentication Setup
1. Go to **Authentication > Settings**
2. Configure email settings for password reset
3. Create admin users in **Table Editor > auth > users**

#### Configuration
1. Get your Supabase credentials from **Project Settings > API**
2. Update `config/environment.js` with your credentials:
```javascript
const SUPABASE_URL = 'YOUR_SUPABASE_URL';
const SUPABASE_ANON_KEY = 'YOUR_SUPABASE_ANON_KEY';
```

### 4. **Run the Application**
1. Serve the application using a local server (e.g., Live Server)
2. Navigate to `index.html` (main entry point)
3. Access admin features via `login.html`

## 🔧 **Development Workflow**

### CSS Development
```bash
# Start development mode (watch)
npm run dev
```

### Production Build
```bash
# Build optimized CSS
npm run build
```

### File Structure Guidelines
- **HTML files**: Main application pages
- **assets/js/**: Modular JavaScript functionality
- **assets/css/**: Compiled Tailwind CSS
- **config/**: Environment and configuration files

## 🚀 **Deployment**

1. **Build for production**:
   ```bash
   npm run build
   ```

2. **Environment setup**:
   - Configure `config/environment.js` with production Supabase credentials
   - Ensure all sensitive data is properly secured

3. **Security considerations**:
   - Use HTTPS in production
   - Configure proper CORS settings
   - Set up proper authentication policies
   - Enable RLS (Row Level Security) in Supabase

## 📋 **Navigation Structure**

- **Admin**: Complete mail management interface
- **Mail Analytics Dashboard**: Charts and statistics
- **User**: Mail confirmation and digital signatures  
- **DSPI Dashboard**: Google Looker Studio integration

## 🔒 **Security Features**

- Private Supabase Storage with signed URLs
- Email-based password reset with secure tokens
- Row Level Security (RLS) policies
- HTTPS-only configuration
- Input validation and sanitization
- Secure authentication flow

## 🛠️ **Technical Stack**

- **Frontend**: HTML5, Tailwind CSS v3.4.17, JavaScript ES6+
- **Backend**: Supabase (Database, Auth, Storage)
- **Build Tools**: PostCSS, Autoprefixer
- **Charts**: Chart.js integration
- **Analytics**: Google Looker Studio embedding
- **Signatures**: HTML5 Canvas with Signature Pad
- **File Processing**: ExcelJS for export functionality

## 📊 **Performance Optimizations**

- Compiled and minified CSS (~28KB)
- Unused CSS classes purged
- Optimized image handling with signed URLs
- Lazy loading for dashboard components
- Efficient database queries
- Responsive design for all devices

## 🧪 **Testing**

1. **Authentication flow**: Test login, logout, password reset
2. **CRUD operations**: Verify all database operations
3. **File uploads**: Test signature storage and retrieval
4. **Responsive design**: Test on mobile, tablet, desktop
5. **Cross-browser compatibility**: Test on modern browsers

## 📚 **Additional Resources**

- [Supabase Documentation](https://supabase.com/docs)
- [Tailwind CSS Documentation](https://tailwindcss.com/docs)
- [Chart.js Documentation](https://www.chartjs.org/docs/)
- [Google Looker Studio](https://datastudio.google.com/)

---

**Note**: This system is production-ready with proper security measures, performance optimizations, and scalable architecture.