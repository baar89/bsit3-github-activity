const connectDB = require('./config/db');
const app = require('./app');
const { startAuctionScheduler } = require('./utils/auctionScheduler');

const PORT = process.env.PORT || 3000;

(async () => {
  try {
    await connectDB();
    app.listen(PORT, () => {
      console.log(`Server running on http://localhost:${PORT}`);
    });
    startAuctionScheduler();
  } catch (error) {
    console.error('Failed to start server:', error.message);
    process.exit(1);
  }
})();
