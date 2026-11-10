# Smart Wall Paint Visualizer

A web-based application that lets users upload a photo of their room, select wall areas, and preview how different paint colours will look before actually painting. Built with the **MEAN stack** (MongoDB, Express, Angular, Node.js).

> Final results may vary from real paint due to lighting, screen calibration and wall texture.

## Features

**User**
- Register / login (JWT authentication)
- Upload room photo (JPG/PNG, max 5 MB)
- Select walls manually with a polygon tool
- Apply colours with adjustable opacity, dual-tone (multiple walls)
- Before / After comparison slider
- Save, edit, delete and download designs

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
| Auth | JWT, bcrypt |
| Security | helmet, cors, express-rate-limit, express-validator |
| Uploads | multer |

## Project Structure

```
paint-visualizer/
├── client/                 Angular app
│   └── src/app/
│       ├── core/           auth service, guards, interceptor
│       ├── shared/         navbar
│       ├── pages/          login, studio, dashboard, admin, help
│       └── services/       project and colour services
└── server/                 Express API
    ├── uploads/            uploaded images
    └── src/
        ├── config/         database connection
        ├── models/         User, Project, Color
        ├── controllers/
        ├── routes/
        ├── middleware/     auth, upload, rate limit
        ├── app.js
        ├── server.js
        └── seed.js         starting colours
```

## Setup (Local)

### Prerequisites
- Node.js 18+
- A MongoDB Atlas cluster (free tier works)
- Angular CLI: `npm install -g @angular/cli`

### 1. Backend

```bash
cd server
npm install
```

Create `server/.env`:

```
PORT=5000
MONGO_URI=mongodb+srv://<user>:<password>@<cluster>.mongodb.net/paintvisualizer?retryWrites=true&w=majority
JWT_SECRET=use_a_long_random_secret
CLIENT_URL=http://localhost:4200
```

Create the uploads folder, seed colours and start:

```bash
mkdir uploads
node src/seed.js
npm run dev
```

The API runs at `http://localhost:5000`.

### 2. Frontend

```bash
cd client
npm install
ng serve
```

The app runs at `http://localhost:4200`.

### 3. Create an admin

For security, new accounts are always regular users. To make an admin, register an account, then in MongoDB Atlas open `paintvisualizer > users` and change that user's `role` to `admin`. Log out and log in again.

## API Documentation

Base URL: `http://localhost:5000/api`

Protected routes need the header `Authorization: Bearer <token>`.

### Auth

| Method | Endpoint | Access | Description |
|---|---|---|---|
| POST | `/auth/register` | Public | Create account. Body: `name`, `email`, `password` (min 6) |
| POST | `/auth/login` | Public | Login. Body: `email`, `password`. Returns `token` and `user` |
| GET | `/auth/me` | User | Get current user |

### Projects

| Method | Endpoint | Access | Description |
|---|---|---|---|
| POST | `/projects` | User | Save design. `multipart/form-data`: `original` (file), `result` (file), `walls` (JSON), `title`, `canvasWidth`, `canvasHeight` |
| GET | `/projects` | User | List my projects |
| GET | `/projects/:id` | User | Get one project |
| PUT | `/projects/:id` | User | Update walls / result image / title |
| DELETE | `/projects/:id` | User | Delete project and its images |

### Colours

| Method | Endpoint | Access | Description |
|---|---|---|---|
| GET | `/colors` | Public | List all colours |
| POST | `/colors` | Admin | Add colour. Body: `name`, `hex` (#RRGGBB), `category`, `brand` |
| PUT | `/colors/:id` | Admin | Update colour |
| DELETE | `/colors/:id` | Admin | Delete colour |

### Admin

| Method | Endpoint | Access | Description |
|---|---|---|---|
| GET | `/admin/users` | Admin | List all users |
| GET | `/admin/stats` | Admin | KPIs: totals, designs per day (7 days), top colours, average walls per design |

### Other

| Method | Endpoint | Description |
|---|---|---|
| GET | `/health` | Health check |

### Error format

```json
{ "message": "Description of the error" }
```

Status codes: `400` validation error, `401` not logged in / invalid token, `403` not admin, `404` not found, `429` too many requests.

## Data Models

**User:** name, email, passwordHash, role (`user` | `admin`), createdAt

**Color:** name, hex, category, brand, finishOptions

**Project:** userId, title, originalImageUrl, resultImageUrl, walls[], canvasWidth, canvasHeight, timestamps

**Wall:** polygon[{x, y}], color, opacity

## How Painting Works

Each selected wall is a polygon. The canvas clips to the polygon and fills it with the chosen colour using the `multiply` blend mode and the opacity value. This keeps the natural shadows and lighting of the photo. Walls are stored as JSON, so a saved design can be reopened and edited.

## Security

- Passwords hashed with bcrypt, never returned in API responses
- JWT authentication with route guards (frontend) and middleware (backend)
- Admin-only routes protected by role check on the server
- Rate limiting on login/register and on the whole API
- Upload validation: JPG/PNG only, max 5 MB
- helmet and CORS configured, secrets kept in `.env`

## Deployment

- **Database:** MongoDB Atlas
- **Backend:** Render (set the `.env` values as environment variables)
- **Frontend:** Vercel or Netlify (`ng build`, publish `dist/client/browser`)

Update `CLIENT_URL` on the backend to the deployed frontend URL, and update the API URL in the Angular services to the deployed backend URL.

## Future Enhancements

- AI-based automatic wall detection
- Wallpaper / pattern support
- Lighting simulation (day / night)
- Integration with paint brands and retailers

## Author

YOUR_NAME