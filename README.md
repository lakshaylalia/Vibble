# Vibble API Documentation

## Overview
Vibble is a backend API for managing users, videos, tweets, playlists, subscriptions, likes, comments, and dashboard statistics. This documentation provides details about the available endpoints, how to use them, and the expected request/response formats.

---

## Features
- **User Management**: Register, login, logout, update profile, and manage user avatars and cover images.
- **Video Management**: Publish, update, delete, and retrieve videos.
- **Tweet Management**: Create, update, delete, and retrieve tweets.
- **Playlist Management**: Create, update, delete playlists and manage videos within playlists.
- **Subscription Management**: Subscribe/unsubscribe to channels and retrieve subscription details.
- **Likes**: Like/unlike videos, comments, and tweets.
- **Comments**: Add, update, delete, and retrieve comments for videos.
- **Dashboard Statistics**: Retrieve channel statistics and videos.
- **Healthcheck**: Check the health of the API.

---

## Base URL
```
http://localhost:3000/api/v1
```

## Authentication
Most endpoints require authentication using a JWT token. Include the token in the `Authorization` header as follows:
```
Authorization: Bearer <your-token>
```

---

## Endpoints

### 1. **Users**
#### Register a User
- **POST** `/users/register`
- **Request Body**:
```json
{
  "fullName": "John Doe",
  "email": "john@example.com",
  "userName": "johndoe",
  "password": "password123"
}
```
- **Response**:
```json
{
  "statusCode": 201,
  "data": { ... },
  "message": "User registered successfully"
}
```

#### Login a User
- **POST** `/users/login`
- **Request Body**:
```json
{
  "email": "john@example.com",
  "password": "password123"
}
```
- **Response**:
```json
{
  "statusCode": 200,
  "data": { ... },
  "message": "User logged in successfully"
}
```

#### Logout a User
- **POST** `/users/logout`
- **Response**:
```json
{
  "statusCode": 200,
  "message": "User logged out successfully"
}
```

---

### 2. **Videos**
#### Get All Videos
- **GET** `/videos`
- **Query Parameters**:
  - `page`: Page number (default: 1)
  - `limit`: Number of videos per page (default: 10)
- **Response**:
```json
{
  "statusCode": 200,
  "data": [ ... ],
  "message": "Videos found"
}
```

#### Publish a Video
- **POST** `/videos`
- **Request Body**:
```json
{
  "title": "My Video",
  "description": "This is a video description"
}
```
- **Response**:
```json
{
  "statusCode": 201,
  "data": { ... },
  "message": "Video published successfully"
}
```

---

### 3. **Tweets**
#### Create a Tweet
- **POST** `/tweets`
- **Request Body**:
```json
{
  "content": "This is my first tweet!"
}
```
- **Response**:
```json
{
  "statusCode": 201,
  "data": { ... },
  "message": "Tweet created"
}
```

---

### 4. **Playlists**
#### Create a Playlist
- **POST** `/playlist`
- **Request Body**:
```json
{
  "name": "My Playlist",
  "description": "This is a playlist description"
}
```
- **Response**:
```json
{
  "statusCode": 200,
  "data": { ... },
  "message": "Playlist created successfully"
}
```

---

### 5. **Subscriptions**
#### Subscribe to a Channel
- **POST** `/subscriptions/channel/:id`
- **Response**:
```json
{
  "statusCode": 200,
  "data": { ... },
  "message": "Subscribed"
}
```

---

### 6. **Likes**
#### Like a Video
- **POST** `/likes/toggle/v/:videoId`
- **Response**:
```json
{
  "statusCode": 200,
  "data": { ... },
  "message": "Liked successfully"
}
```

---

### 7. **Comments**
#### Add a Comment
- **POST** `/comments/:videoId`
- **Request Body**:
```json
{
  "content": "This is a comment"
}
```
- **Response**:
```json
{
  "statusCode": 200,
  "data": { ... },
  "message": "Comment added successfully"
}
```

---

### 8. **Dashboard**
#### Get Channel Stats
- **GET** `/dashboard/stats`
- **Response**:
```json
{
  "statusCode": 200,
  "data": { ... },
  "message": "Channel Stats"
}
```

---

### 9. **Healthcheck**
#### Check API Health
- **GET** `/healthcheck`
- **Response**:
```json
{
  "statusCode": 200,
  "data": "OK",
  "message": "Healthcheck successful"
}
```

---

## How to Use
1. Set up the environment variables in `.env` file.
2. Start the server using:
   ```
   npm run dev
   ```
3. Use tools like Postman or cURL to interact with the API.
4. Include the JWT token in the `Authorization` header for secured endpoints.

---

## Notes
- Ensure all required fields are provided in the request body.
- Handle errors gracefully by checking the response status code and message.