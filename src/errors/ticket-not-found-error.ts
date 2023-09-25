import { ApplicationError } from '@/protocols';

export function ticketNotFoundError(): ApplicationError {
  return {
    name: 'TicketNotFoundError',
    message: 'User does not have a ticket for given event!',
  };
}
