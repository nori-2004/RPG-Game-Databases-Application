const express = require('express');
const path = require('path');
const fs = require('fs');
const cors = require('cors');
const appController = require('./appController');
const { seedInitialData } = require('./backend/seedData');

// Load environment variables from .env file
// Ensure your .env file has the required database credentials.
const loadEnvFile = require('./utils/envUtil');
const envVariables = {
    ...(loadEnvFile('./.env') || {}),
    ...process.env
};

const app = express();
const PORT = Number(envVariables.PORT) || 3001; // Align with API contract
app.use(cors());
// Middleware setup
app.use(express.static('public')); // Serve static files from the 'public' directory
app.use(express.json()); // Parse incoming JSON payloads

// If you prefer some other file as default page other than 'index.html',
//      you can adjust and use the bellow line of code to
//      route to send 'DEFAULT_FILE_NAME.html' as default for root URL
// app.get('/', (req, res) => {
//     res.sendFile(__dirname + '/public/DEFAULT_FILE_NAME.html');
// });

// mount the router
app.use('/', appController);

// Serve the built React frontend if available
const frontendBuildPath = path.join(__dirname, 'frontend', 'dist');
if (fs.existsSync(frontendBuildPath)) {
    app.use(express.static(frontendBuildPath));
    app.get('*', (req, res, next) => {
        if (req.path.startsWith('/api')) {
            return next();
        }
        return res.sendFile(path.join(frontendBuildPath, 'index.html'));
    });
}

// ----------------------------------------------------------
// Starting the server after seeding
async function startServer() {
    try {
        await seedInitialData();
        app.listen(PORT, () => {
            console.log(`Server running at http://localhost:${PORT}/`);
        });
    } catch (err) {
        console.error('Failed to start server', err);
        process.exit(1);
    }
}

startServer();
