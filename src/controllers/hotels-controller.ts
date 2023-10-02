import { Response } from 'express';
import httpStatus from 'http-status';
import { invalidDataError } from '@/errors';
import { AuthenticatedRequest } from '@/middlewares';
import { hotelsService } from '@/services/hotels-service';

export async function getHotels(req: AuthenticatedRequest, res: Response) {
  const { userId } = req;
  const hotels = await hotelsService.getHotels(userId);

  res.status(httpStatus.OK).send(hotels);
}

export async function getHotelWithRooms(req: AuthenticatedRequest, res: Response) {
  const { userId } = req;
  const hotelId = parseInt(req.params.hotelId);

  if (isNaN(hotelId)) throw invalidDataError('Hotel ID must be an integer number!');

  const hotel = await hotelsService.getHotelWithRooms(userId, hotelId);

  res.status(httpStatus.OK).send(hotel);
}
