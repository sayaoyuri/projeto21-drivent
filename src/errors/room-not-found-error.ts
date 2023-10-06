import { ApplicationError } from '@/protocols';

export function roomNotFoundError(): ApplicationError {
  return {
    name: 'RoomNotFoundError',
    message: 'Room not found!',
  };
}
