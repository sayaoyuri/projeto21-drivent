import { TicketStatus } from '@prisma/client';
import { enrollmentRepository, hotelRepository, ticketsRepository } from '@/repositories';
import { bookingService } from '@/services/booking-service';
import { forbiddenError, notFoundError, roomNotFoundError } from '@/errors';
import { bookingRepository } from '@/repositories/booking-repository';

describe('createBooking service', () => {
  it('should throw forbidden error when user is not enrolled', async () => {
    jest.spyOn(enrollmentRepository, 'findWithAddressByUserId').mockImplementationOnce(() => {
      return undefined;
    });

    const result = bookingService.createBooking(1, 2);
    expect(result).rejects.toEqual(forbiddenError('User is not enrolled!'));
  });

  it('should throw forbidden error when user doesnt have a ticket yet', async () => {
    jest.spyOn(enrollmentRepository, 'findWithAddressByUserId').mockImplementationOnce((): any => {
      return { enrollmentId: 1 };
    });

    jest.spyOn(ticketsRepository, 'findTicketByEnrollmentId').mockImplementationOnce(() => {
      return undefined;
    });

    const result = bookingService.createBooking(1, 2);
    expect(result).rejects.toEqual(forbiddenError('User doesnt have a ticket!'));
  });

  it('should throw forbidden error when ticket is not paid', async () => {
    jest.spyOn(enrollmentRepository, 'findWithAddressByUserId').mockImplementationOnce((): any => {
      return { enrollmentId: 1 };
    });

    jest.spyOn(ticketsRepository, 'findTicketByEnrollmentId').mockImplementationOnce((): any => {
      return { status: TicketStatus.RESERVED };
    });

    const result = bookingService.createBooking(1, 2);
    expect(result).rejects.toEqual(forbiddenError('Ticket is not paid!'));
  });

  it('should throw forbidden error when ticket does not include hotel', async () => {
    jest.spyOn(enrollmentRepository, 'findWithAddressByUserId').mockImplementationOnce((): any => {
      return { enrollmentId: 1 };
    });

    jest.spyOn(ticketsRepository, 'findTicketByEnrollmentId').mockImplementationOnce((): any => {
      return {
        status: TicketStatus.PAID,
        TicketType: {
          isRemote: true,
          includesHotel: false,
        },
      };
    });

    const result = bookingService.createBooking(1, 2);
    expect(result).rejects.toEqual(forbiddenError('Ticket doesnt include a hotel!'));
  });

  it('should throw not found error when room is not found', async () => {
    jest.spyOn(enrollmentRepository, 'findWithAddressByUserId').mockImplementationOnce((): any => {
      return { enrollmentId: 1 };
    });

    jest.spyOn(ticketsRepository, 'findTicketByEnrollmentId').mockImplementationOnce((): any => {
      return {
        status: TicketStatus.PAID,
        TicketType: {
          isRemote: false,
          includesHotel: true,
        },
      };
    });

    jest.spyOn(bookingRepository, 'findRoomById').mockImplementationOnce(() => {
      return undefined;
    });

    const result = bookingService.createBooking(1, 2);
    expect(result).rejects.toEqual(roomNotFoundError());
  });

  it('should throw forbidden error when room is full', async () => {
    jest.spyOn(enrollmentRepository, 'findWithAddressByUserId').mockImplementationOnce((): any => {
      return { enrollmentId: 1 };
    });

    jest.spyOn(ticketsRepository, 'findTicketByEnrollmentId').mockImplementationOnce((): any => {
      return {
        status: TicketStatus.PAID,
        TicketType: {
          isRemote: false,
          includesHotel: true,
        },
      };
    });

    jest.spyOn(bookingRepository, 'findRoomById').mockImplementationOnce((): any => {
      return { capacity: 1 };
    });

    jest.spyOn(bookingRepository, 'findBookingsByRoomId').mockImplementationOnce((): any => {
      return [
        { id: 1, userId: 3, roomId: 2 },
        { id: 2, userId: 5, roomId: 2 },
      ];
    });

    const result = bookingService.createBooking(1, 2);
    expect(result).rejects.toEqual(forbiddenError('Room is full!'));
  });

  it('should throw forbidden error when room is full', async () => {
    jest.spyOn(enrollmentRepository, 'findWithAddressByUserId').mockImplementationOnce((): any => {
      return { enrollmentId: 1 };
    });

    jest.spyOn(ticketsRepository, 'findTicketByEnrollmentId').mockImplementationOnce((): any => {
      return {
        status: TicketStatus.PAID,
        TicketType: {
          isRemote: false,
          includesHotel: true,
        },
      };
    });

    jest.spyOn(bookingRepository, 'findRoomById').mockImplementationOnce((): any => {
      return { capacity: 1 };
    });

    jest.spyOn(bookingRepository, 'findBookingsByRoomId').mockImplementationOnce((): any => {
      return [];
    });

    const bookingMock = { id: 1234 };
    jest.spyOn(bookingRepository, 'createBooking').mockImplementationOnce((): any => {
      return bookingMock;
    });

    const result = await bookingService.createBooking(1, 2);
    expect(result).toEqual({
      bookingId: bookingMock.id,
    });
  });
});
