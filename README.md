
# Food Sharing Application 🍲

A full-stack web application that connects food donors with recipients, facilitating local food sharing and reducing food waste. Built with the MERN stack (MongoDB, Express.js, React.js, Node.js).

## 🌟 Features

- **User Authentication**
  - Secure registration and login
  - Role-based access (Donor, Pickup, Admin)
  - JWT-based authentication
  - Password encryption

- **Food Donation Management**
  - Create and manage food donations
  - Categorize donations (hot meals, packaged food, raw ingredients)
  - Set expiration times
  - Upload food images
  - Track donation status

- **Location Services**
  - Real-time location tracking
  - Geospatial queries
  - Distance-based matching
  - Location validation

- **Pickup & Delivery System**
  - Schedule pickups
  - Track delivery status
  - Manage drop-off locations
  - Real-time status updates

## 🛠️ Technology Stack

### Backend
- Node.js & Express.js
- MongoDB with Mongoose
- JWT Authentication
- bcrypt for password hashing
- Multer for file uploads
- Nodemailer for email services

### Frontend
- React.js
- Modern JavaScript (ES6+)
- CSS Modules
- Responsive Design

## 📋 Prerequisites

Before you begin, ensure you have the following installed:
- Node.js (v14 or higher)
- MongoDB
- npm or yarn
- Git

## 🚀 Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/yourusername/food-sharing-app.git
   cd food-sharing-app
   ```

2. **Install server dependencies**
   ```bash
   npm install
   ```

3. **Install client dependencies**
   ```bash
   cd client
   npm install
   ```

4. **Environment Setup**
   Create a `.env` file in the root directory with the following variables:
   ```env
   PORT=5000
   MONGO_URI=your_mongodb_connection_string
   JWT_SECRET=your_jwt_secret
   EMAIL_SERVICE=your_email_service
   EMAIL_USER=your_email
   EMAIL_PASS=your_email_password
   ```

## 💻 Usage

1. **Start the server**
   ```bash
   # Development mode
   npm run dev

   # Production mode
   npm start
   ```

2. **Start the client**
   ```bash
   cd client
   npm start
   ```

3. **Access the application**
   - Frontend: `http://localhost:3000`
   - Backend API: `http://localhost:5000`

## 📁 Project Structure

```
food-sharing-app/
├── client/                 # React frontend
│   ├── public/
│   └── src/
│       ├── components/
│       ├── pages/
│       └── App.js
├── models/                 # Mongoose models
│   ├── User.js
│   ├── Donation.js
│   ├── Pickup.js
│   └── DropOff.js
├── routes/                 # API routes
│   ├── auth.js
│   ├── donations.js
│   ├── pickups.js
│   └── dropoffs.js
├── middleware/            # Custom middleware
├── server.js             # Express server
└── package.json
```

## 🔒 API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - User login

### Donations
- `GET /api/donations` - Get all donations
- `POST /api/donations` - Create new donation
- `GET /api/donations/:id` - Get specific donation
- `PUT /api/donations/:id` - Update donation
- `DELETE /api/donations/:id` - Delete donation

### Pickups
- `GET /api/pickups` - Get all pickups
- `POST /api/pickups` - Schedule pickup
- `PUT /api/pickups/:id` - Update pickup status

### Drop-offs
- `GET /api/dropoffs` - Get all drop-offs
- `POST /api/dropoffs` - Create drop-off
- `PUT /api/dropoffs/:id` - Update drop-off status

## 🧪 Testing

```bash
# Run backend tests
npm test

# Run frontend tests
cd client
npm test
```

## 📝 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 🤝 Contributing Guidelines

- Write clear, descriptive commit messages
- Follow the existing code style
- Add tests for new features
- Update documentation as needed
- Ensure all tests pass before submitting PR

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 👥 Authors

- Rafay Adeel

##  Acknowledgments

- Inspired by the need to reduce food waste
- Built with ❤️ for the community

## 📞 Support

For support, email rafayadeel1999@gmail.com / f223327@cfd.nu.edu.pk or open an issue in the repository.

## 🔄 Updates

### Latest Updates
- Added real-time location tracking
- Implemented image upload for donations
- Enhanced security features
- Added email notifications

### Planned Features
- Real-time chat system
- Mobile application
- Advanced analytics dashboard
- Social media integration

## 📊 Performance

- Optimized database queries
- Implemented caching
- Responsive design
- Fast load times

## 🔐 Security Features

- JWT authentication
- Password encryption
- Input validation
- XSS protection
- CORS configuration
- Rate limiting

## 🌐 Browser Support

- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)

## 📱 Mobile Responsiveness

The application is fully responsive and works on:
- Desktop
- Tablet
- Mobile devices

## 🚨 Known Issues

- List any known issues here
- Include workarounds if available

## 🔧 Troubleshooting

Common issues and their solutions:

1. **MongoDB Connection Error**
   - Check your connection string
   - Ensure MongoDB is running
   - Verify network connectivity

2. **Authentication Issues**
   - Clear browser cache
   - Check JWT secret
   - Verify user credentials

3. **File Upload Problems**
   - Check file size limits
   - Verify file types
   - Ensure proper permissions

## 📈 Future Roadmap

- [ ] Real-time notifications
- [ ] Advanced search filters
- [ ] User ratings system
- [ ] Automated matching system
- [ ] Mobile app development
- [ ] Analytics dashboard
- [ ] Social sharing features
- [ ] Multi-language support

## 🎯 Project Goals

- Reduce food waste
- Connect communities
- Provide efficient food distribution
- Ensure food safety
- Promote sustainability

## 💡 Best Practices

- Follow coding standards
- Write clean, maintainable code
- Document your code
- Test thoroughly
- Keep dependencies updated
- Regular security audits

## 🔍 Code Quality

- ESLint configuration
- Prettier formatting
- Code review process
- Continuous Integration
- Automated testing

## 📚 Documentation

- API documentation
- Component documentation
- Setup guides
- Deployment guides
- Contributing guidelines

## 🌟 Show your support

Give a ⭐️ if this project helped you!

## �� Contact
Rafay Adeel on insta @iamrafayadeel
Project Link: https://github.com/CodeRafay/Feedia
```


