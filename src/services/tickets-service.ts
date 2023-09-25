import { Ticket, TicketStatus, TicketType } from '@prisma/client';
import { conflictError, enrollmentNotFound404Error, ticketNotFoundError } from '@/errors';
import { enrollmentRepository } from '@/repositories';
import { ticketRepository } from '@/repositories/tickets-repository';

async function getTicketTypes(): Promise<TicketType[]> {
  const tickets = await ticketRepository.findTicketTypes();

  return tickets;
}

async function getEnrollmentByUserIdOrThrow(userId: number): Promise<number> {
  const enrollment = await enrollmentRepository.findWithAddressByUserId(userId);
  if (!enrollment) throw enrollmentNotFound404Error();

  return enrollment.id;
}

async function getTicketByUserId(userId: number): Promise<Ticket> {
  const enrollmentId = await getEnrollmentByUserIdOrThrow(userId);

  const ticket = await ticketRepository.findByEnrollmentId(enrollmentId);
  if (!ticket) throw ticketNotFoundError();

  return ticket;
}

async function createTicket(userId: number, ticketTypeId: number): Promise<Ticket> {
  const enrollmentId = await getEnrollmentByUserIdOrThrow(userId);

  const alreadyHasTicket = await ticketRepository.findByEnrollmentId(enrollmentId);
  if (alreadyHasTicket) throw conflictError('User already has a ticket for given event!');

  const ticket: CreateTicketParams = { ticketTypeId, enrollmentId, status: TicketStatus.RESERVED};

  const createdTicket: Ticket = await ticketRepository.create(ticket);

  return createdTicket;
}

export type CreateTicketParams = Omit<Ticket, 'id' | 'createdAt' | 'updatedAt'>;

export const ticketService = {
  getTicketTypes,
  getTicketByUserId,
  createTicket,
};
