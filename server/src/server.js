console.log('Starting A.F.D Ads Pro API...');
console.log('NODE_ENV:', process.env.NODE_ENV);
console.log('PORT:', process.env.PORT);

const { app, mountApplication } = await import('./app.js');

const PORT = process.env.PORT || 3000;

const server = app.listen(PORT, '0.0.0.0', () => {
  console.log(`Server running on 0.0.0.0:${PORT}`);
});

mountApplication()
  .then(() => {
    console.log('Application routes mounted.');
  })
  .catch((error) => {
    console.error('Application routes failed to mount. Healthcheck remains online.', error);
  });

async function shutdown(signal) {
  console.log(`Received ${signal}. Shutting down server.`);

  try {
    const { prisma } = await import('./config/prisma.js');
    await prisma.$disconnect();
  } catch (error) {
    console.error('Database disconnect skipped:', error.message);
  }

  server.close(() => {
    process.exit(0);
  });
}

process.on('SIGINT', () => shutdown('SIGINT'));
process.on('SIGTERM', () => shutdown('SIGTERM'));

process.on('unhandledRejection', (error) => {
  console.error('Unhandled rejection:', error);
});

process.on('uncaughtException', (error) => {
  console.error('Uncaught exception:', error);
});
