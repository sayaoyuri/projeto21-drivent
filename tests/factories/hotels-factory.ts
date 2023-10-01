import { faker } from '@faker-js/faker';
import { prisma } from '@/config';

export async function createHotel() {
  return prisma.hotel.create({
    data: {
      name: faker.company.companyName(),
      image: faker.image.imageUrl(),
    },
  });
}

export async function createHotelRoom(hotelId: number) {
  return prisma.room.create({
    data: {
      hotelId,
      name: faker.lorem.word(),
      capacity: faker.datatype.number({ min: 1, max: 3 }),
    },
  });
}
