import { ApplicationError } from '@/protocols';

export function hotelNotFoundError(): ApplicationError {
  return {
    name: 'HotelNotFoundError',
    message: 'No hotel found for given event!',
  };
}
