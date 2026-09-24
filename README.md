# ReConnect — Real-Time MVP

This version turns the current ReConnect frontend into a real multi-user MVP using:

- Node.js
- Express
- MongoDB / Mongoose
- Socket.IO
- Your existing HTML/CSS UI

## Important

This first real-time version intentionally keeps the no-login flow from the current prototype.
When a profile is created, MongoDB gives it a real profile ID and the browser stores that ID in localStorage.

That is enough for development/testing of:
- real profiles
- real search
- connection requests
- real-time notifications
- accept/decline
- connections

For production, add Phone OTP or Google authentication before launch.

## 1. Backend setup

Open PowerShell:

```powershell
cd backend
npm install
```

Copy `.env.example` to `.env` and put your MongoDB Atlas URI in it.

Example:

```env
PORT=5000
MONGODB_URI=YOUR_MONGODB_ATLAS_CONNECTION_STRING
CLIENT_URL=http://127.0.0.1:5500
```

Start:

```powershell
npm start
```

You should see:

```text
MongoDB connected
ReConnect backend running on http://localhost:5000
```

## 2. Frontend

Do NOT double-click `index.html`.

Use VS Code Live Server or another local static server.

For example, Live Server usually opens:

```text
http://127.0.0.1:5500
```

## 3. Test with two browser windows

1. Open ReConnect in Chrome.
2. Create Profile A.
3. Open an Incognito window.
4. Create Profile B.
5. Search for Profile A/B.
6. Send a connection request.
7. Keep the receiver window open.
8. The receiver should get the Socket.IO notification without refreshing.

## Current API

POST `/api/profile`

GET `/api/profile/:id`

GET `/api/friends/search?village=&school=&batch=`

POST `/api/friends/request`

GET `/api/friends/:profileId/requests`

PATCH `/api/friends/request/:connectionId`

GET `/api/friends/:profileId/connections`

## Next production steps

- Phone OTP / Google authentication
- Edit profile
- Profile photos
- Full notification page
- Connection request UI
- Mutual friends
- Real-time chat
- Message storage
- Rate limiting and validation
- Authentication/authorization
- HTTPS and production deployment
