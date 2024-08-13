/* eslint-disable no-console */
import mongoose from 'mongoose';
import app from './app';
import config from './app/config';
import { Server } from 'http';
import seedSuperAdmin from './app/DB';

let server: Server;

async function main() {
  try {
    await mongoose.connect(config.database_url as string);
    seedSuperAdmin();
    server = app.listen(config.port, () => {
      console.log(`app is listening on port ${config.port}`);
    });
  } catch (err) {
    console.log(err);
  }
}

main();

process.on('unhandledRejection', () => {
  console.log(`😈 unahandledRejection is detected , Shutting down ...`);
  if (server) {
    server.close(() => {
      process.exit(1);
    });
  }
  process.exit(1);
});

process.on('uncaughtException', () => {
  console.log('😢 uncaughtException is Detected. Shutting Down');
  process.exit(1);
});

/*

PORT=5000
DATABASE_URL=mongodb+srv://AMMAJANUNIVERSITY:MqVTjxLrbsa8pXUC@cluster0.tgxbxlz.mongodb.net/Ammajan-University?retryWrites=true&w=majority&appName=Cluster0
BCRYPT_SALT_ROUNDS=12
DEFAULT_PASS=ILOVEYOU
NODE_ENV=development
JWT_ACCESS_SECRET="coding_rider"
JWT_REFRESH_SECRET="programming-hero"
JWT_ACCESS_EXPIRES_IN=1d
JWT_REFRESH_EXPIRES_IN=365d
RESET_PASS_UI_LINK=http://localhost:3000

*/
