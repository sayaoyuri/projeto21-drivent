import Joi from 'joi';
import { CreateTicketBody } from '@/protocols';

export const CreateTicketSchema = Joi.object<CreateTicketBody>({
  ticketTypeId: Joi.number().min(1).required(),
});
