import { prisma } from '@/config';

async function findBookingByUserId(userId: number) {
  return prisma.booking.findUnique({
    where: { userId },
    include: {
      Room: true,
    },
  });
}

async function findRoomById(id: number) {
  return prisma.room.findUnique({
    where: { id },
  });
}

async function findBookingsByRoomId(id: number) {
  return prisma.booking.findMany({
    where: {
      roomId: id,
    },
  });
}

async function createBooking(userId: number, roomId: number) {
  return prisma.booking.create({
    data: {
      userId: userId,
      roomId: roomId,
    },
  });
}

export const bookingRepository = { findRoomById, findBookingsByRoomId, createBooking, findBookingByUserId };
