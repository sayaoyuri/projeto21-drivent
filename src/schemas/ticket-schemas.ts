import Joi from 'joi';
import { InputTicketBody } from '@/protocols';

export const CreateTicketSchema = Joi.object<InputTicketBody>({
  ticketTypeId: Joi.number().min(1).required(),
});
