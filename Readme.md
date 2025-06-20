# Mega Project Backend

---

## Data Model Diagram

You can view the full data model here:  
[https://app.eraser.io/workspace/YtPqZ1VogxGy1jzIDkzj](https://app.eraser.io/workspace/YtPqZ1VogxGy1jzIDkzj)

---

## Summary of this project

This project is a complex backend project that is built with nodejs, expressjs, mongodb, mongoose, jwt, bcrypt, and many more. This project is a complete backend project that has all the features that a backend project should have.A complete video hosting website similar to youtube with all the features like login, signup, upload video, like, dislike, comment, reply, subscribe, unsubscribe, and many more.

Project uses all standard practices like JWT, bcrypt, access tokens, refresh Tokens and many more. We have spent a lot of time in building this project and we are sure that you will learn a lot from this project.

---

## Features

- **User Authentication:** Register, login, JWT-based authentication, profile management.
- **Video Management:** Upload, update, delete, and fetch videos. Supports Cloudinary for video and thumbnail storage.
- **Playlists:** Create, update, delete playlists; add/remove videos from playlists.
- **Comments:** Add, update, delete, and fetch comments on videos.
- **Likes:** Like/unlike videos, tweets, and comments.
- **Subscriptions:** Subscribe/unsubscribe to channels, view subscribers and subscriptions.
- **Tweets:** Post, update, delete, and fetch tweets.
- **Dashboard & Stats:** Aggregated stats for channels and users.
- **Healthcheck:** Simple endpoint to verify server status.
- **Robust Error Handling:** Consistent API error and response structure.
- **Secure:** Protected routes, input validation, and user authorization.

---

## Postman Collection

You can find the Postman collection for this API in the [`postman`](postman/) folder:

[Download play_project.postman_collection.json](postman/play_project.postman_collection.json)

Import this file into Postman to test all endpoints easily.

---

## Tech Stack

- **Node.js** & **Express.js**
- **MongoDB** with **Mongoose**
- **Cloudinary** (for media storage)
- **JWT** (JSON Web Tokens) for authentication
- **Multer** (for file uploads)

---

## Getting Started

### Prerequisites

- Node.js (v18+ recommended)
- MongoDB instance (local or cloud)
- Cloudinary account

### Installation

1. **Clone the repository:**

   ```sh
   git clone https://github.com/yourusername/mega_project_backend.git
   cd mega_project_backend
   ```

2. **Install dependencies:**

   ```sh
   npm install
   ```

3. **Configure environment variables:**

   Create a `.env` file in the root directory and add:

   ```
   PORT=5000
   MONGODB_URI=your_mongodb_connection_string
   ACCESS_TOKEN_SECRET=your_jwt_secret
   CLOUDINARY_CLOUD_NAME=your_cloud_name
   CLOUDINARY_API_KEY=your_api_key
   CLOUDINARY_API_SECRET=your_api_secret
   ```

4. **Start the server:**
   ```sh
   npm start
   ```
   Or, for development with auto-reload:
   ```sh
   npx nodemon src/index.js
   ```

---

## API Endpoints

- **Auth:** `/api/auth/register`, `/api/auth/login`, `/api/auth/profile`
- **Videos:** `/api/videos`, `/api/videos/:videoId`
- **Playlists:** `/api/playlists`, `/api/playlists/:playlistId`
- **Comments:** `/api/comments/:videoId`
- **Likes:** `/api/likes/video/:videoId`, `/api/likes/tweet/:tweetId`, `/api/likes/comment/:commentId`
- **Subscriptions:** `/api/subscriptions/:channelId`
- **Tweets:** `/api/tweets`, `/api/tweets/:tweetId`
- **Dashboard:** `/api/dashboard/:channelId`
- **Healthcheck:** `/api/healthcheck`

> For detailed request/response formats, see the [API Documentation](#).

---

## Folder Structure

```
src/
  controllers/
  middleware/
  models/
  routes/
  utils/
.env
postman/
  play_project.postman_collection.json
```

---

## Contributing

Pull requests are welcome! For major changes, please open an issue first to discuss what you would like to change.

---

## Acknowledgements

- [Express.js](https://expressjs.com/)
- [MongoDB](https://www.mongodb.com/)
- [Cloudinary](https://cloudinary.com/)
