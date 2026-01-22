# Express Server with MongoDB and Google OAuth Authentication

This project is an Express server application that connects to a MongoDB database and implements Google OAuth authentication using Passport.js. 

## Project Structure

```
express-server
├── src
│   ├── app.ts                # Entry point of the application
│   ├── config
│   │   ├── database.ts       # MongoDB connection configuration
│   │   └── passport.ts       # Google OAuth configuration
│   ├── controllers
│   │   ├── auth.ts           # Authentication-related actions
│   │   └── user.ts           # User-related actions
│   ├── middleware
│   │   ├── auth.ts           # Authentication middleware
│   │   └── errorHandler.ts    # Error handling middleware
│   ├── models
│   │   └── User.ts           # User model definition
│   ├── routes
│   │   ├── auth.ts           # Authentication routes
│   │   └── user.ts           # User routes
│   └── types
│       └── index.ts          # TypeScript interfaces
├── package.json               # NPM configuration file
├── tsconfig.json             # TypeScript configuration file
├── .env.example               # Example environment variables
└── README.md                  # Project documentation
```

## Getting Started

### Prerequisites

- Node.js (version 14 or higher)
- MongoDB (local or cloud instance)
- Google Developer account for OAuth credentials

### Installation

1. Clone the repository:

   ```
   git clone <repository-url>
   cd express-server
   ```

2. Install the dependencies:

   ```
   npm install
   ```

3. Create a `.env` file based on the `.env.example` file and fill in your MongoDB connection string and Google OAuth credentials.

### Running the Application

1. Start the server:

   ```
   npm start
   ```

2. The server will be running on `http://localhost:3000`.

### Usage

- Navigate to `/auth/google` to initiate the Google OAuth authentication process.
- After successful authentication, you will be redirected to the home page or the specified callback URL.

### Contributing

Feel free to submit issues or pull requests for improvements or bug fixes.

### License

This project is licensed under the MIT License.