import { httpRouter } from 'convex/server';
import { authComponent, createAuth } from './auth';
import { webhook } from './telegram';

const http = httpRouter();

authComponent.registerRoutes(http, createAuth, { cors: true });

http.route({ path: '/telegram/webhook', method: 'POST', handler: webhook });

export default http;
