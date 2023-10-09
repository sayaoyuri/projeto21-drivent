import supertest from 'supertest';
import httpStatus from 'http-status';
import faker from '@faker-js/faker';
import * as jwt from 'jsonwebtoken';
import { TicketStatus } from '@prisma/client';
import {
  createBooking,
  createEnrollmentWithAddress,
  createPayment,
  createTicket,
  createTicketType,
  createUser,
} from '../factories';
import { cleanDb, generateValidToken } from '../helpers';
import { createHotel, createRoomWithHotelId } from '../factories/hotels-factory';
import app, { init } from '@/app';

beforeAll(async () => {
  await init();
});

beforeEach(async () => {
  await cleanDb();
});

const server = supertest(app);

describe('GET /booking', () => {
  it('should respond with status 401 if no token is given', async () => {
    const response = await server.get('/booking');

    expect(response.status).toBe(httpStatus.UNAUTHORIZED);
  });

  it('should respond with status 401 if given token is not valid', async () => {
    const token = faker.lorem.word();

    const response = await server.get('/booking').set('Authorization', `Bearer ${token}`);

    expect(response.status).toBe(httpStatus.UNAUTHORIZED);
  });

  it('should respond with status 401 if there is no session for given token', async () => {
    const userWithoutSession = await createUser();
    const token = jwt.sign({ userId: userWithoutSession.id }, process.env.JWT_SECRET);

    const response = await server.get('/booking').set('Authorization', `Bearer ${token}`);

    expect(response.status).toBe(httpStatus.UNAUTHORIZED);
  });

  describe('when token is valid', () => {
    it('should respond with status 404 when user doesnt have a booking yet', async () => {
      const user = await createUser();
      const token = await generateValidToken(user);
      const enrollment = await createEnrollmentWithAddress(user);
      const ticketType = await createTicketType(false, true);
      const ticket = await createTicket(enrollment.id, ticketType.id, TicketStatus.PAID);
      await createPayment(ticket.id, ticketType.price);

      const response = await server.get(`/booking`).set('Authorization', `Bearer ${token}`);

      expect(response.status).toBe(httpStatus.NOT_FOUND);
    });

    it('should respond with status 200 and bookingId', async () => {
      const user = await createUser();
      const token = await generateValidToken(user);
      const enrollment = await createEnrollmentWithAddress(user);
      const ticketType = await createTicketType(false, true);
      const ticket = await createTicket(enrollment.id, ticketType.id, TicketStatus.PAID);
      await createPayment(ticket.id, ticketType.price);

      const createdHotel = await createHotel();
      const createdRoom = await createRoomWithHotelId(createdHotel.id);
      const booking = await createBooking(user.id, createdRoom.id);

      const response = await server.get('/booking').set('Authorization', `Bearer ${token}`);

      expect(response.status).toBe(httpStatus.OK);
      expect(response.body).toEqual({
        id: booking.id,
        Room: {
          id: booking.Room.id,
          name: booking.Room.name,
          capacity: booking.Room.capacity,
          hotelId: booking.Room.hotelId,
          createdAt: booking.Room.createdAt.toISOString(),
          updatedAt: booking.Room.updatedAt.toISOString(),
        },
      });
    });
  });
});

describe('POST /booking', () => {
  it('should respond with status 401 if no token is given', async () => {
    const response = await server.post('/booking');

    expect(response.status).toBe(httpStatus.UNAUTHORIZED);
  });

  it('should respond with status 401 if given token is not valid', async () => {
    const token = faker.lorem.word();

    const response = await server.post('/booking').set('Authorization', `Bearer ${token}`);

    expect(response.status).toBe(httpStatus.UNAUTHORIZED);
  });

  it('should respond with status 401 if there is no session for given token', async () => {
    const userWithoutSession = await createUser();
    const token = jwt.sign({ userId: userWithoutSession.id }, process.env.JWT_SECRET);

    const response = await server.post('/booking').set('Authorization', `Bearer ${token}`);

    expect(response.status).toBe(httpStatus.UNAUTHORIZED);
  });

  describe('when token is valid', () => {
    it('should respond with status 404 when roomId doesnt exist', async () => {
      const user = await createUser();
      const token = await generateValidToken(user);
      const enrollment = await createEnrollmentWithAddress(user);
      const ticketType = await createTicketType(false, true);
      const ticket = await createTicket(enrollment.id, ticketType.id, TicketStatus.PAID);
      await createPayment(ticket.id, ticketType.price);

      const body = { roomId: 1234 };

      const response = await server.post(`/booking/`).set('Authorization', `Bearer ${token}`).send(body);

      expect(response.status).toBe(httpStatus.NOT_FOUND);
    });

    it('should respond with status 403 when ticket is remote & doesnt include hotel', async () => {
      const user = await createUser();
      const token = await generateValidToken(user);
      const enrollment = await createEnrollmentWithAddress(user);
      const ticketType = await createTicketType(true, false);
      const ticket = await createTicket(enrollment.id, ticketType.id, TicketStatus.PAID);
      await createPayment(ticket.id, ticketType.price);

      const createdHotel = await createHotel();
      const createdRoom = await createRoomWithHotelId(createdHotel.id);

      const body = { roomId: createdRoom.id };

      const response = await server.post(`/booking/`).set('Authorization', `Bearer ${token}`).send(body);

      expect(response.status).toBe(httpStatus.FORBIDDEN);
    });

    it('should respond with status 403 when room is full', async () => {
      const user1 = await createUser();

      const createdHotel = await createHotel();
      const createdRoom = await createRoomWithHotelId(createdHotel.id, 1);

      await createBooking(user1.id, createdRoom.id);

      const user = await createUser();
      const token = await generateValidToken(user);
      const enrollment = await createEnrollmentWithAddress(user);
      const ticketType = await createTicketType(false, true);
      const ticket = await createTicket(enrollment.id, ticketType.id, TicketStatus.PAID);
      await createPayment(ticket.id, ticketType.price);

      const body = { roomId: createdRoom.id };

      const response = await server.post(`/booking/`).set('Authorization', `Bearer ${token}`).send(body);

      expect(response.status).toBe(httpStatus.FORBIDDEN);
    });

    it('should respond with status 200 and bookingId', async () => {
      const user = await createUser();
      const token = await generateValidToken(user);
      const enrollment = await createEnrollmentWithAddress(user);
      const ticketType = await createTicketType(false, true);
      const ticket = await createTicket(enrollment.id, ticketType.id, TicketStatus.PAID);
      await createPayment(ticket.id, ticketType.price);

      const createdHotel = await createHotel();
      const createdRoom = await createRoomWithHotelId(createdHotel.id);

      const body = { roomId: createdRoom.id };

      const response = await server.post('/booking').set('Authorization', `Bearer ${token}`).send(body);

      expect(response.status).toBe(httpStatus.OK);
      expect(response.body).toEqual(
        expect.objectContaining({
          bookingId: expect.any(Number),
        }),
      );
    });
  });
});

describe('PUT /booking/:bookingId', () => {
  it('should respond with status 401 if no token is given', async () => {
    const response = await server.put('/booking/1');

    expect(response.status).toBe(httpStatus.UNAUTHORIZED);
  });

  it('should respond with status 401 if given token is not valid', async () => {
    const token = faker.lorem.word();

    const response = await server.put('/booking/1').set('Authorization', `Bearer ${token}`);

    expect(response.status).toBe(httpStatus.UNAUTHORIZED);
  });

  it('should respond with status 401 if there is no session for given token', async () => {
    const userWithoutSession = await createUser();
    const token = jwt.sign({ userId: userWithoutSession.id }, process.env.JWT_SECRET);

    const response = await server.put('/booking/1').set('Authorization', `Bearer ${token}`);

    expect(response.status).toBe(httpStatus.UNAUTHORIZED);
  });

  describe('when token is valid', () => {
    it('should respond with status 404 when room doesnt exist', async () => {
      const user = await createUser();
      const token = await generateValidToken(user);
      const enrollment = await createEnrollmentWithAddress(user);
      const ticketType = await createTicketType(false, true);
      const ticket = await createTicket(enrollment.id, ticketType.id, TicketStatus.PAID);
      await createPayment(ticket.id, ticketType.price);

      const createdHotel = await createHotel();
      const createdRoom = await createRoomWithHotelId(createdHotel.id);
      const booking = await createBooking(user.id, createdRoom.id);

      const body = { roomId: 1234 };

      const response = await server.put(`/booking/${booking.id}`).set('Authorization', `Bearer ${token}`).send(body);

      expect(response.status).toBe(httpStatus.NOT_FOUND);
    });

    it('should respond with status 403 when user doesnt have a booking yet', async () => {
      const user = await createUser();
      const token = await generateValidToken(user);
      const enrollment = await createEnrollmentWithAddress(user);
      const ticketType = await createTicketType(false, true);
      const ticket = await createTicket(enrollment.id, ticketType.id, TicketStatus.PAID);
      await createPayment(ticket.id, ticketType.price);

      const createdHotel = await createHotel();
      const createdRoom = await createRoomWithHotelId(createdHotel.id);

      const body = { roomId: createdRoom.id };

      const response = await server.put(`/booking/${1234}`).set('Authorization', `Bearer ${token}`).send(body);

      expect(response.status).toBe(httpStatus.FORBIDDEN);
    });

    it('should respond with status 403 when new room is full', async () => {
      const user = await createUser();
      const token = await generateValidToken(user);
      const enrollment = await createEnrollmentWithAddress(user);
      const ticketType = await createTicketType(false, true);
      const ticket = await createTicket(enrollment.id, ticketType.id, TicketStatus.PAID);
      await createPayment(ticket.id, ticketType.price);

      const createdHotel = await createHotel();
      const createdRoom = await createRoomWithHotelId(createdHotel.id, 1);
      await createBooking(user.id, createdRoom.id);

      const user1 = await createUser();
      const newRoom = await createRoomWithHotelId(createdHotel.id, 1);
      await createBooking(user1.id, newRoom.id); // other user ocupies the newRoom

      const body = { roomId: newRoom.id };

      const response = await server.post(`/booking/`).set('Authorization', `Bearer ${token}`).send(body);

      expect(response.status).toBe(httpStatus.FORBIDDEN);
    });

    it('should respond with status 200 and bookingId', async () => {
      const user = await createUser();
      const token = await generateValidToken(user);
      const enrollment = await createEnrollmentWithAddress(user);
      const ticketType = await createTicketType(false, true);
      const ticket = await createTicket(enrollment.id, ticketType.id, TicketStatus.PAID);
      await createPayment(ticket.id, ticketType.price);

      const createdHotel = await createHotel();
      const createdRoom = await createRoomWithHotelId(createdHotel.id);
      const createdRoom2 = await createRoomWithHotelId(createdHotel.id);
      const booking = await createBooking(user.id, createdRoom.id);

      const body = { roomId: createdRoom2.id };

      const response = await server.put(`/booking/${booking.id}`).set('Authorization', `Bearer ${token}`).send(body);

      expect(response.status).toBe(httpStatus.OK);
      expect(response.body).toEqual(
        expect.objectContaining({
          bookingId: expect.any(Number),
        }),
      );
    });
  });
});
