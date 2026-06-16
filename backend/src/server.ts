import fs from 'fs';
import path from 'path';
import app from './app';
import { connectDatabase } from './config/database';
import { env } from './config/env';
import { authService } from './modules/auth/auth.service';
import { logger } from './utils/logger';

const logsDir = path.join(process.cwd(), 'logs');
if (!fs.existsSync(logsDir)) {
  fs.mkdirSync(logsDir, { recursive: true });
}

const startServer = async (): Promise<void> => {
  await connectDatabase();
  await authService.seedAdmin();

  app.listen(env.port, () => {
    logger.info(`Server running on port ${env.port} in ${env.NODE_ENV} mode`);
    logger.info(`API base URL: ${env.BACKEND_URL}/api/v1`);
  });
};

startServer().catch((error) => {
  logger.error('Failed to start server', { error });
  process.exit(1);
});
