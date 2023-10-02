import { Hotel, Room, TicketStatus } from '@prisma/client';
import { hotelsRepository } from '@/repositories/hotels-repository';
import { ticketsService } from '@/services';
import { enrollmentNotFound404Error, hotelNotFoundError, paymentRequiredError, ticketNotFoundError } from '@/errors';
import { enrollmentRepository } from '@/repositories';

async function getHotels(userId: number): Promise<Hotel[]> {
  const enrollment = await enrollmentRepository.findWithAddressByUserId(userId);
  if (!enrollment) throw enrollmentNotFound404Error();

  const ticket = await ticketsService.getTicketByUserId(userId);
  if (!ticket) throw ticketNotFoundError();
  if (ticket.status !== TicketStatus.PAID) throw paymentRequiredError();
  if (!ticket.TicketType.includesHotel) throw paymentRequiredError('Ticket doesnt include a hotel!');
  if (ticket.TicketType.isRemote) throw paymentRequiredError('Ticket is remote!');

  const hotels = await hotelsRepository.getHotels();
  if (hotels.length === 0) throw hotelNotFoundError();

  return hotels;
}

async function getHotelWithRooms(userId: number, hotelId: number): Promise<Hotel & { Rooms: Room[] }> {
  const enrollment = await enrollmentRepository.findWithAddressByUserId(userId);
  if (!enrollment) throw enrollmentNotFound404Error();

  const ticket = await ticketsService.getTicketByUserId(userId);
  if (!ticket) throw ticketNotFoundError();
  if (ticket.status !== TicketStatus.PAID) throw paymentRequiredError();
  if (!ticket.TicketType.includesHotel) throw paymentRequiredError('Ticket doesnt include a hotel!');
  if (ticket.TicketType.isRemote) throw paymentRequiredError('Ticket is remote!');

  const hotel = await hotelsRepository.getHotelWithRooms(hotelId);
  if (!hotel) throw hotelNotFoundError();

  return hotel;
}

export const hotelsService = { getHotels, getHotelWithRooms };
