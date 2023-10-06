import { TicketStatus } from '@prisma/client';
import { forbiddenError, notFoundError, roomNotFoundError } from '@/errors';
import { enrollmentRepository, ticketsRepository } from '@/repositories';
import { bookingRepository } from '@/repositories/booking-repository';

async function validateUserBooking(userId: number) {
  const enrollment = await enrollmentRepository.findWithAddressByUserId(userId);
  if (!enrollment) throw forbiddenError('User is not enrolled!');

  const ticket = await ticketsRepository.findTicketByEnrollmentId(enrollment.id);
  if (!ticket) throw forbiddenError('User doesnt have a ticket!');

  if (ticket.status === TicketStatus.RESERVED) {
    throw forbiddenError('Ticket is not paid!');
  }

  const type = ticket.TicketType;

  if (type.isRemote || !type.includesHotel) {
    throw forbiddenError('Ticket doesnt include a hotel!');
  }
}

async function getBooking() {}

async function createBooking(userId: number, roomId: number) {
  await validateUserBooking(userId);

  const room = await bookingRepository.findRoomById(roomId);
  if (!room) throw roomNotFoundError();

  const roomsBooking = await bookingRepository.findBookingsByRoomId(roomId);
  if (roomsBooking.length >= room.capacity) throw forbiddenError('Room is full!');

  const createdBooking = await bookingRepository.createBooking(userId, roomId);

  return { bookingId: createdBooking.id };
}

async function updateBooking() {}

export const bookingService = { getBooking, createBooking, updateBooking };
