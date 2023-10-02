import { Router } from 'express';
import { getHotelWithRooms, getHotels } from '@/controllers/hotels-controller';
import { authenticateToken } from '@/middlewares';

const hotelsRouter = Router();

hotelsRouter.all('/*', authenticateToken).get('/', getHotels).get('/:hotelId', getHotelWithRooms);

export { hotelsRouter };
