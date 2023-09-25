import { prisma } from '@/config';
import { CreateTicketParams } from '@/services/tickets-service';

export async function findTicketTypes() {
  return prisma.ticketType.findMany();
}

export async function findUserTicket(enrollmentId: number) {
  return prisma.ticket.findFirst({
    where: { enrollmentId },
  });
}

async function create(ticket: CreateTicketParams) {
  return prisma.ticket.create({
    data: ticket,
    include: {
      TicketType: true
    }
  });
}

async function findByEnrollmentId(enrollmentId: number) {
  return prisma.ticket.findFirst({
    where: { enrollmentId },
    include: {
      TicketType: true,
    },
  });
}

export const ticketRepository = { findTicketTypes, create, findByEnrollmentId };
