import { ApplicationError } from '@/protocols';

export function enrollmentNotFoundError(): ApplicationError {
  return {
    name: 'EnrollmentNotFoundError',
    message: 'User is not enrolled in the event.',
  };
}

export function enrollmentNotFound404Error(): ApplicationError {
  return {
    name: 'EnrollmentNotFound404Error',
    message: 'User is not enrolled in the event.',
  };
}
