import { TicketStatus } from '@prisma/client';
import { forbiddenError, notFoundError, roomNotFoundError } from '@/errors';
import { enrollmentRepository, ticketsRepository } from '@/repositories';
import { bookingRepository } from '@/repositories/booking-repository';
import { exclude } from '@/utils/prisma-utils';

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

async function getBookingByUserId(userId: number) {
  await validateUserBooking(userId);

  const booking = await bookingRepository.findBookingByUserId(userId);
  if (!booking) throw notFoundError();

  return exclude(booking, 'userId', 'createdAt', 'roomId', 'updatedAt');
}

async function createBooking(userId: number, roomId: number) {
  await validateUserBooking(userId);

  const room = await bookingRepository.findRoomById(roomId);
  if (!room) throw roomNotFoundError();

  const roomsBooking = await bookingRepository.findBookingsByRoomId(roomId);
  if (roomsBooking.length >= room.capacity) throw forbiddenError('Room is full!');

  const createdBooking = await bookingRepository.createBooking(userId, roomId);

  return { bookingId: createdBooking.id };
}

async function updateBooking(userId: number, roomId: number) {
  await validateUserBooking(userId);

  const booking = await bookingRepository.findBookingByUserId(userId);
  if (!booking) throw forbiddenError('Must have a reservation to change it!');

  const room = await bookingRepository.findRoomById(roomId);
  if (!room) throw roomNotFoundError();

  const roomReservations = await bookingRepository.findBookingsByRoomId(roomId);
  if (roomReservations.length >= room.capacity) throw forbiddenError('Desired room is full!');

  const updatedBooking = await bookingRepository.updateBooking(userId, roomId);

  return { bookingId: updatedBooking.id };
}

export const bookingService = { getBookingByUserId, createBooking, updateBooking };
