import { Response } from 'express';
import httpStatus from 'http-status';
import { AuthenticatedRequest } from '@/middlewares';
import { InputBookingBody } from '@/protocols';
import { bookingService } from '@/services/booking-service';

export async function getBooking(req: AuthenticatedRequest, res: Response) {
  const { userId } = req;

  const booking = await bookingService.getBookingByUserId(userId);

  res.status(httpStatus.OK).send(booking);
}

export async function createBooking(req: AuthenticatedRequest, res: Response) {
  const { userId } = req;
  const { roomId } = req.body as InputBookingBody;

  const createdBooking = await bookingService.createBooking(userId, roomId);

  res.status(httpStatus.OK).send(createdBooking);
}

export async function updateBooking(req: AuthenticatedRequest, res: Response) {
  const { userId } = req;

  const updatedBooking = {};

  res.status(httpStatus.OK).send(updatedBooking);
}
