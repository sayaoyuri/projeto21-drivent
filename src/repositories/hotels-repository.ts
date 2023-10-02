import { prisma } from '@/config';

async function getHotels() {
  return prisma.hotel.findMany();
}

async function getHotelWithRooms(id: number) {
  return prisma.hotel.findUnique({
    where: { id },
    include: {
      Rooms: true,
    },
  });
}

export const hotelsRepository = { getHotels, getHotelWithRooms };
