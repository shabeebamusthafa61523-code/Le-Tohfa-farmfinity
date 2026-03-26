const app = require('./app'); // Import the configured app logic

const PORT = process.env.PORT || 5000;

const server = app.listen(PORT, () => {
    console.log(`
    🌲 Le'Tohfa Server Started
    📍 Port: ${PORT}
    🚀 Environment: ${process.env.NODE_ENV || 'development'}
    `);
});

// Handle unhandled promise rejections (Optional but recommended)
process.on('unhandledRejection', (err) => {
    console.log(`Error: ${err.message}`);
    server.close(() => process.exit(1));
});