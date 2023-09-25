import { Router } from 'express';
import { createTicket, getTicketByUserId, getTicketTypes } from '@/controllers/tickets-controller';
import { authenticateToken, validateBody } from '@/middlewares';
import { CreateTicketSchema } from '@/schemas';

const ticketsRouter = Router();

ticketsRouter
  .all('/*', authenticateToken)
  .get('/types', getTicketTypes)
  .get('/', getTicketByUserId)
  .post('/', validateBody(CreateTicketSchema), createTicket);

export { ticketsRouter };
