# Feedia - Community Food Sharing Platform 🍲

A full-stack MERN (MongoDB, Express.js, React.js, Node.js) web application that connects food donors with pickup services and beneficiaries, facilitating local food sharing and reducing food waste.

## 🌟 Overview

Feedia is a community-driven platform designed to:
- **Reduce food waste** by connecting surplus food with those who need it
- **Combat hunger** by efficiently distributing food donations
- **Build community** through transparent, rated interactions

### User Roles

1. **Donors** - Restaurants, hotels, and individuals with surplus food
2. **Pickup Services** - Drivers and volunteers who collect and deliver food
3. **Admins** - Platform administrators who manage users and monitor activity

## 🚀 Features

### Authentication & Authorization
- ✅ Secure JWT-based authentication
- ✅ Role-based access control (Donor, Pickup, Admin)
- ✅ Protected routes and API endpoints

### Food Donation Management
- ✅ Create food listings with type, category, quantity, and expiration
- ✅ Upload food images
- ✅ Track donation status (Available, Picked Up, Delivered, Expired)
- ✅ Automatic expiration handling

### Pickup & Delivery System
- ✅ View and request available donations
- ✅ Track pickup status
- ✅ Email notifications for pickup requests
- ✅ Complete pickup workflow

### Drop-Off Points
- ✅ View community drop-off locations
- ✅ Google Maps integration for location viewing
- ✅ Distance-based search

### Admin Dashboard
- ✅ Platform-wide statistics
- ✅ User management
- ✅ Donation monitoring
- ✅ Drop-off point management

### Reviews & Ratings
- ✅ Rate donors and pickup services
- ✅ Build trust through transparency
- ✅ Track average ratings

## 🛠️ Technology Stack

### Backend
- **Runtime:** Node.js
- **Framework:** Express.js
- **Database:** MongoDB with Mongoose ODM
- **Authentication:** JWT (JSON Web Tokens)
- **Password Security:** bcrypt
- **File Uploads:** Multer with GridFS
- **Email:** Nodemailer

### Frontend
- **Framework:** React 18
- **Routing:** React Router v6
- **HTTP Client:** Axios
- **Styling:** Bootstrap 5
- **Maps:** Google Maps Embed API

## 📋 Prerequisites

- Node.js v14 or higher
- MongoDB (local or cloud instance like MongoDB Atlas)
- npm or yarn
- Git

## 🔧 Installation

### 1. Clone the Repository
```bash
git clone https://github.com/CodeRafay/Feedia.git
cd Feedia
```

### 2. Install Backend Dependencies
```bash
npm install
```

### 3. Install Frontend Dependencies
```bash
cd client
npm install
cd ..
```

### 4. Environment Configuration

Create a `.env` file in the root directory:

```env
# Required
MONGO_URI=mongodb://localhost:27017/feedia
JWT_SECRET=your-secure-jwt-secret-key

# Optional
PORT=5000
NODE_ENV=development
CORS_ORIGIN=http://localhost:3000
GMAIL_USER=your-email@gmail.com
GMAIL_PASS=your-app-password
```

Create a `.env` file in the `client` directory:

```env
REACT_APP_API_URL=http://localhost:5000
REACT_APP_GOOGLE_MAPS_API_KEY=your-google-maps-api-key
```

## 💻 Running the Application

### Development Mode

**Start the backend server:**
```bash
npm run dev
```

**Start the frontend (in a new terminal):**
```bash
cd client
npm start
```

### Production Mode

**Build the frontend:**
```bash
cd client
npm run build
cd ..
```

**Start the server:**
```bash
npm start
```

### Access Points
- **Frontend:** http://localhost:3000
- **Backend API:** http://localhost:5000
- **Health Check:** http://localhost:5000/api/health

## 📁 Project Structure

```
feedia/
├── client/                    # React frontend
│   ├── public/               # Static files and HTML templates
│   ├── src/
│   │   ├── components/       # React components
│   │   │   ├── AdminDashboard.js
│   │   │   ├── DonationList.js
│   │   │   ├── DonorDashboard.js
│   │   │   ├── DropOffList.js
│   │   │   ├── LocationPicker.js
│   │   │   ├── Login.js
│   │   │   ├── PickupDashboard.js
│   │   │   └── Register.js
│   │   ├── App.js            # Main app component
│   │   └── index.js          # Entry point
│   └── package.json
├── models/                    # Mongoose schemas
│   ├── Donation.js
│   ├── DropOff.js
│   ├── Pickup.js
│   ├── Review.js
│   └── User.js
├── routes/                    # API routes
│   ├── admin.js
│   ├── auth.js
│   ├── donations.js
│   ├── dropoffs.js
│   ├── pickups.js
│   ├── reviews.js
│   └── uploads.js
├── middleware/               # Custom middleware
│   └── auth.js
├── server.js                 # Express server
├── vercel.json              # Vercel deployment config
├── .env.example             # Environment variables template
└── package.json
```

## 🔒 API Endpoints

### Authentication
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/auth/register` | Register new user |
| POST | `/api/auth/login` | User login |
| GET | `/api/auth/me` | Get current user profile |

### Donations
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/donations` | Get available donations |
| GET | `/api/donations/my` | Get donor's own donations |
| GET | `/api/donations/:id` | Get single donation |
| POST | `/api/donations` | Create donation (donor) |
| PUT | `/api/donations/:id` | Update donation |
| DELETE | `/api/donations/:id` | Delete donation |
| GET | `/api/donations/nearby/:lat/:lng` | Get nearby donations |

### Pickups
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/pickups` | Get all pickups (admin) |
| GET | `/api/pickups/my` | Get user's pickups |
| POST | `/api/pickups` | Create pickup request |
| PUT | `/api/pickups/:id` | Update pickup status |
| DELETE | `/api/pickups/:id` | Cancel pickup |

### Drop-Off Points
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/dropoffs` | Get all drop-off points |
| GET | `/api/dropoffs/nearby` | Get nearby drop-off points |

### Reviews
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/reviews/user/:userId` | Get reviews for user |
| POST | `/api/reviews` | Create review |
| PUT | `/api/reviews/:id` | Update review |
| DELETE | `/api/reviews/:id` | Delete review |

### Admin
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/admin/stats` | Get platform statistics |
| GET | `/api/admin/users` | Get all users |
| PUT | `/api/admin/users/:id/role` | Update user role |
| POST | `/api/admin/dropoffs` | Create drop-off point |

## 🚀 Deployment

### Vercel Deployment

1. Install Vercel CLI:
```bash
npm i -g vercel
```

2. Deploy:
```bash
vercel
```

3. Set environment variables in Vercel dashboard:
   - `MONGO_URI`
   - `JWT_SECRET`
   - `GMAIL_USER` (optional)
   - `GMAIL_PASS` (optional)

### Manual Deployment

1. Build the frontend:
```bash
cd client && npm run build && cd ..
```

2. Set `NODE_ENV=production`

3. Start with:
```bash
npm start
```

## 🔐 Environment Variables

| Variable | Required | Description |
|----------|----------|-------------|
| `MONGO_URI` | Yes | MongoDB connection string |
| `JWT_SECRET` | Yes | Secret key for JWT tokens |
| `PORT` | No | Server port (default: 5000) |
| `NODE_ENV` | No | Environment (development/production) |
| `CORS_ORIGIN` | No | Allowed CORS origin |
| `GMAIL_USER` | No | Gmail for notifications |
| `GMAIL_PASS` | No | Gmail app password |
| `REACT_APP_API_URL` | No | API URL for frontend |
| `REACT_APP_GOOGLE_MAPS_API_KEY` | No | Google Maps API key |

## 🧪 Testing

```bash
# Run backend tests
npm test

# Run frontend tests
cd client
npm test
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/AmazingFeature`
3. Commit changes: `git commit -m 'Add AmazingFeature'`
4. Push to branch: `git push origin feature/AmazingFeature`
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 👨‍💻 Author

**Rafay Adeel**
- GitHub: [@CodeRafay](https://github.com/CodeRafay)
- Email: rafayadeel1999@gmail.com

## 🙏 Acknowledgments

- Built with ❤️ for communities fighting food waste
- Inspired by the need to reduce hunger and promote sustainability

---

⭐ **Star this repo if you find it helpful!**
