# Smart Wall Paint Visualizer

A web app that lets users preview wall paint colours on their own room photo before painting. Built with the MEAN stack (MongoDB, Express, Angular, Node.js).

> Final results may vary due to lighting, screen calibration and wall texture.

## Live Demo

- Frontend: https://paint-visualizer-sepia.vercel.app
- Backend health check: https://paint-visualizer-1.onrender.com/api/health

The backend runs on a free plan, so the first request may take about 50 seconds to wake up.

## Features

**User**
- Register and login (JWT authentication)
- Upload a room photo (JPG/PNG, max 5 MB)
- Select walls manually with a polygon tool
- Apply colours with adjustable opacity
- Dual-tone walls (different colour per wall)
- Before / After comparison slider
- Save, edit, delete and download designs
- How to Use guide page

**Admin**
- Manage colours (add, edit, delete)
- View users and recent designs
- Analytics dashboard (designs per day, most used colours, KPIs)

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | Angular, SCSS, HTML5 Canvas |
| Backend | Node.js, Express.js, REST API |
| Database | MongoDB Atlas, Mongoose |
| Auth and security | JWT, bcrypt, helmet, CORS, rate limiting |
| Image storage | multer, Cloudinary |
| Hosting | Vercel (frontend), Render (backend) |

## Project Structure

```
paint-visualizer/
├── client/            Angular app
│   └── src/app/
│       ├── core/      auth service, guards, interceptor
│       ├── shared/    navbar
│       ├── pages/     login, studio, dashboard, admin, help
│       └── services/  project and colour services
└── server/            Express API
    └── src/
        ├── config/       database connection
        ├── models/       User, Project, Color
        ├── controllers/
        ├── routes/
        ├── middleware/   auth, upload, rate limit
        ├── app.js
        ├── server.js
        └── seed.js       starting colours
```

## Run Locally

```bash
git clone https://github.com/falakuzma1234-alt/paint-visualizer.git
cd paint-visualizer
```

**Backend**

```bash
cd server
npm install
```

Create `server/.env`:

```
PORT=5000
MONGO_URI=your_mongodb_atlas_uri
JWT_SECRET=your_secret
CLIENT_URL=http://localhost:4200
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_key
CLOUDINARY_API_SECRET=your_secret
```

```bash
node src/seed.js
npm run dev
```

**Frontend**

```bash
cd client
npm install
ng serve
```

Open http://localhost:4200. To use a local backend, change the API URLs in `services/project.service.ts` and `core/auth.service.ts` to `http://localhost:5000`.

**Create an admin:** register an account, change that user's `role` to `admin` in MongoDB Atlas, then log in again.

## API Overview

| Method | Endpoint | Access |
|---|---|---|
| POST | /api/auth/register, /api/auth/login | Public |
| GET | /api/auth/me | User |
| GET, POST | /api/projects | User |
| GET, PUT, DELETE | /api/projects/:id | User |
| GET | /api/colors | Public |
| POST, PUT, DELETE | /api/colors, /api/colors/:id | Admin |
| GET | /api/admin/users, /api/admin/stats | Admin |

Protected routes need the header `Authorization: Bearer <token>`. Errors return `{ "message": "..." }`.

## How Painting Works

Each selected wall is stored as a polygon. The canvas clips to the polygon and fills it with the chosen colour using the `multiply` blend mode and the opacity value, so the natural shadows and lighting of the photo are kept. Walls are saved as JSON, so a saved design can be reopened and edited.

## Security

- Passwords hashed with bcrypt, never returned in API responses
- JWT authentication with route guards and server-side middleware
- Admin routes protected by a role check on the server
- Rate limiting on login/register and the whole API
- Upload validation (JPG/PNG only, max 5 MB)
- helmet and CORS configured, secrets kept in environment variables

## Future Enhancements

- AI-based automatic wall detection
- Wallpaper / pattern support
- Day / night lighting simulation
- Paint brand and retailer integration

## Author

Falak Uzma