# keys2balance-training-platform - Project Structure

```
keys2balance-training-platform/
├── 📄 README.md
├── 📄 FOLDER_STRUCTURE.md                # Temporary only, deleted at the end
│
│── 📁 frontend/                          # Only initialization
│
├── 📁 backend/
│   ├── 📄 .env                           # Environment variables
│   ├── 📄 .gitignore
│   ├── 📄 package.json
│   ├── 📄 index.js                       # Server entry point
│   ├── 📄 app.js                         # App configuration
│   │
│   ├── 📁 controllers/                   # Export routers - handles API endpoints and directs requests
│   │   ├── 📁 admin/
│   │   ├── 📁 assessments/
│   │   ├── 📁 auth/
│   │   │   ├── 📄 login.js
│   │   │   └── 📄 register.js
│   │   │
│   │   ├── 📁 courses/
│   │   ├── 📁 participants/
│   │   ├── 📁 progress/
│   │   └── 📁 trainers/
│   │
│   ├── 📁 models/                        # Data models
│   │   ├── 📄 user.js
│   │   └── 📄 cohort.js
│   │
│   └── 📁 utils/                         # Helper utilities
│       ├── 📄 config.js                  # App configuration
│       ├── 📄 middleware.js              # Middleware (auth, validation)
│       └── 📄 sendEmail.js               # Email service


```

## Backend Flow & Onboarding

1. **Entry Point**
   - Start with `index.js` → it initializes the server and loads `app.js`.
   - `app.js` sets up all middleware and routes.

2. **Routing & Controllers**
   - Routes are organized in `controllers/`.
   - Each folder handles a domain:
     - `auth/` → login, registration
     - `courses/`, `participants/`, `progress/`, `trainers/` → respective operations
     - `admin/` → admin-specific endpoints
   - Controllers should contain **business logic only**, while routing handles HTTP requests.

3. **Models**
   - Located in `models/`
   - Define database schemas (e.i, `user.js`, `cohort.js`), interact via ORM or query builder.

4. **Utilities**
   - `utils/` holds helper functions:
     - `config.js` → app settings, DB connections
     - `middleware.js` → authentication, validation
     - `sendEmail.js` → email notifications

5. **Starting a New Task**
   - **Pick the feature you need to work on**  
     _Example:_ “We want an endpoint that shows all participants in a course.”

   - **Find the right controller and model**  
     _Example:_ If your task is about participants in a course:
     - Go to `controllers/participants/` → this is where you handle the request logic.
     - Go to `models/user.js` or `models/cohort.js` → this is where you read or update the data in PostgreSQL.

     In short:
     - Controller = handles the request and response.
     - Model = talks to the database.

   - **Add your logic in the controller**  
     _Example:_ In `participantsController.js`, write a function `getParticipantsByCourse(courseId)` that gets the participants from the database.

   - **Add a route so the API can use it**  
     _Example:_ In `app.js`, add:

     ```js
     const participantsController = require('./controllers/participants/participantsController')
     app.get(
     	'/api/courses/:id/participants',
     	participantsController.getParticipantsByCourse,
     )
     ```

   - **Test with Postman or your preferred tool**  
     _Example:_ Open Postman and send a GET request to `http://localhost:5000/api/courses/1/participants`. You should see the list of participants for course 1.

6. **Environment**
   - Make sure `.env` is set up with DB URL, secrets, and any keys.

   _Example:_ Create `.env` file inside the `backend/` folder:

   ```
   DATABASE_URL=postgresql://postgres:your_password@localhost:5432/keys2balance
   TEST_DATABASE_URL=postgresql://postgres:your_password@localhost:5432/keys2balance_test

   JWT_SECRET=your_jwt_secret

   SMTP_HOST=smtp.gmail.com
   SMTP_PORT=587
   SMTP_SECURE=false

   SMTP_USER=your_email@gmail.com
   SMTP_PASS=your_email_app_password

   FRONTEND_URL=http://localhost:3000

   EMAIL_SECRET=your_email_jwt_secret
   ```

## Team Agreement & Next Steps

### Workflow Agreement

Let’s agree on a clear workflow so the codebase stays clean and understandable for everyone.

- Before starting a new feature, clearly define:
  - What endpoint we are adding
  - Which controller and model it affects
- Keep responsibilities clear:
  - Controller → handles request/response
  - Model → handles database queries
- Avoid adding logic in random places.
- If something changes structure-wise, discuss it first.

If anyone has suggestions to improve the workflow, feel free to share them so we can align early.

---

### Upcoming Improvements

Once the database structure is more stable:

- Add **tests** (unit + integration)
- Introduce **CI/CD** (GitHub Actions or similar)
  - Run tests automatically on pull requests
  - Prevent merging broken code
  - Reduce manual review effort

Goal: make pull requests safer and more automated.

---

### `.env` Configuration

The final content of the `.env` file will be agreed on together, including:

- Database URLs
- Email credentials for sending notifications
- Secrets (JWT, email tokens, etc.)
- Any external service configuration

No real credentials should ever be committed to the repository.

---

### Coding Style

We should also agree on:

- Variable naming conventions
- Function naming conventions
- Folder/file naming
- Error handling style
- Response format structure (standard JSON format)

We will use **Prettier** to keep formatting consistent across the team.

Please install the VS Code extension:

- **Prettier – Code formatter**
- Extension ID: `esbenp.prettier-vscode`

After installing, add this to your VS Code `settings.json`:

```json
"[javascript]": {
	"editor.defaultFormatter": "esbenp.prettier-vscode"
},
"editor.defaultFormatter": "esbenp.prettier-vscode",
"editor.formatOnPaste": true,
"editor.formatOnSave": true,
"files.eol": "\n",
"javascript.format.semicolons": "remove",
"prettier.endOfLine": "crlf",
"prettier.jsxSingleQuote": true,
"prettier.semi": false,
"prettier.singleQuote": true,
"prettier.useTabs": true

```

If you have ideas or preferences about coding style or workflow, let’s define them early and document them here.
This keeps it professional, clear, and team-focused.
