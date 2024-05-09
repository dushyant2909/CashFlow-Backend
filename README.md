
# CashFlow Backend

## Project Overview

The CashFlow Backend project provides backend functionality for managing user accounts and feature of transferring amount to other users. It includes user authentication, account management, balance operations, and transaction capabilities.

## Technologies Used

- **Express.js**: Node.js web application framework used for routing and middleware handling.
- **Node.js**: JavaScript runtime environment for executing server-side code.
- **MongoDB**: NoSQL database for storing user and account data.
- **bcrypt**: Library for password hashing and encryption.
- **jsonwebtoken**: Token-based authentication for managing user sessions.
- **cors**: Middleware for handling Cross-Origin Resource Sharing (CORS) policies.
- **cookie-parser**: Middleware for parsing cookies in incoming HTTP requests.
- **zod**: Library for schema validation to ensure data integrity.
- **Postman**: API development tool used for testing API endpoints.

## Installation and Setup

1. Clone the repository:
   ```
   git clone https://github.com/dushyant2909/CashFlow-Backend.git
   cd CashFlow-Backend
   ```

2. Install dependencies:
   ```
   npm install
   ```

3. Set up environment variables:
   Create a `.env` file in the root directory and add necessary environment variables like database connection URI, JWT secret, etc.

4. Start the server:
   ```
   npm run dev
   ```

## API Routes

All routes start with `/api/v1`. User-related routes are under `/api/v1/users`, and account-related routes are under `/api/v1/account`.

- **POST `/api/v1/users/signup`**: Create a new user account.
- **POST `/api/v1/users/signin`**: User login to obtain authentication token.
- **GET `/api/v1/users/get-current-user`**: Get details of the currently authenticated user.
- **PATCH `/api/v1/users/update`**: Update user details.
- **PATCH `/api/v1/users/update-password`**: Change user password.
- **POST `/api/v1/users/logout`**: Log out and invalidate the authentication token.
- **GET `/api/v1/account/get-balance`**: Get the balance of the authenticated user's account.
- **POST `/api/v1/account/transfer`**: Transfer an amount from the authenticated user's account to another user's account.

## Middleware

- **Authentication Middleware**: Protects routes from unauthorized access by verifying JWT tokens.

## Utility

- **Async Handler**: Wrapper function for handling asynchronous route handlers and catching errors.

## Error Handling

- **ApiError Class**: Custom error class for generating API-specific error responses with status codes and error messages.
- **ApiResponse Class**: Standardized API response format for success and error responses.

## Contact

For any queries or support, please contact [dushyantb2003@gmail.com](mailto:your-email@example.com).

---
