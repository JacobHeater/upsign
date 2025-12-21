import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding database...');

  // Create sample users
  const user1 = await prisma.user.create({
    data: {
      firstName: 'John',
      lastName: 'Doe',
      email: 'john.doe@example.com',
      dateOfBirth: new Date('1990-01-01'),
      phoneNumber: '5555551212',
      verified: true,
      locked: false,
      lastLogin: new Date(),
      allergies: {
        create: [{ allergy: 'Peanuts' }, { allergy: 'Shellfish' }],
      },
    },
  });

  const user2 = await prisma.user.create({
    data: {
      firstName: 'Jane',
      lastName: 'Smith',
      email: 'jane.smith@example.com',
      dateOfBirth: new Date('1985-05-15'),
      phoneNumber: '5555551213',
      verified: true,
      locked: false,
      lastLogin: new Date(),
      allergies: {
        create: [{ allergy: 'Dairy' }],
      },
    },
  });

  const user3 = await prisma.user.create({
    data: {
      firstName: 'Bob',
      lastName: 'Johnson',
      email: 'bob.johnson@example.com',
      dateOfBirth: new Date('1992-08-20'),
      phoneNumber: '5555551214',
      verified: false,
      locked: false,
    },
  });

  console.log('Created users:', user1.id, user2.id, user3.id);

  // Create sample events
  const event1 = await prisma.event.create({
    data: {
      name: 'Summer BBQ Party',
      description: 'A fun summer BBQ with friends and family',
      date: new Date('2025-07-15T18:00:00Z'),
      location: 'Central Park',
      icon: '🍔',
      hostId: user1.id,
      segments: {
        create: [
          {
            name: 'Main Course',
            attendees: {
              create: [
                {
                  userId: user2.id,
                  contributions: {
                    create: [
                      { item: 'Burgers', description: 'Homemade beef burgers', quantity: 10 },
                      { item: 'Salad', description: 'Fresh garden salad', quantity: 1 },
                    ],
                  },
                },
                {
                  userId: user3.id,
                  contributions: {
                    create: [{ item: 'Drinks', description: 'Soda and beer', quantity: 20 }],
                  },
                },
              ],
            },
          },
          {
            name: 'Dessert',
            attendees: {
              create: [
                {
                  userId: user1.id,
                  contributions: {
                    create: [{ item: 'Cake', description: 'Chocolate cake', quantity: 1 }],
                  },
                },
              ],
            },
          },
        ],
      },
    },
  });

  const event2 = await prisma.event.create({
    data: {
      name: 'Holiday Potluck',
      description: 'Christmas potluck dinner with traditional holiday dishes',
      date: new Date('2025-12-25T12:00:00Z'),
      location: 'Community Center',
      icon: '🎄',
      hostId: user2.id,
      segments: {
        create: [
          {
            name: 'Appetizers',
            attendees: {
              create: [
                {
                  userId: user1.id,
                  contributions: {
                    create: [
                      { item: 'Cheese Platter', description: 'Assorted cheeses', quantity: 1 },
                    ],
                  },
                },
              ],
            },
          },
          {
            name: 'Main Dishes',
            attendees: {
              create: [
                {
                  userId: user3.id,
                  contributions: {
                    create: [
                      { item: 'Turkey', description: 'Roast turkey', quantity: 1 },
                      { item: 'Stuffing', description: 'Traditional stuffing', quantity: 2 },
                    ],
                  },
                },
              ],
            },
          },
        ],
      },
    },
  });

  console.log('Created events:', event1.id, event2.id);

  // Create sample chat messages
  const message1 = await prisma.eventChatMessage.create({
    data: {
      userId: user2.id,
      eventId: event1.id,
      message: 'Looking forward to the BBQ!',
    },
  });

  const message2 = await prisma.eventChatMessage.create({
    data: {
      userId: user1.id,
      eventId: event2.id,
      message: 'What should I bring for the potluck?',
    },
  });

  console.log('Created chat messages:', message1.id, message2.id);

  // Create sample reactions
  await prisma.eventChatMessageReaction.create({
    data: {
      messageId: message1.id,
      userId: user1.id,
      reaction: '👍',
    },
  });

  await prisma.eventChatMessageReaction.create({
    data: {
      messageId: message2.id,
      userId: user3.id,
      reaction: '🍗',
    },
  });

  console.log('Created chat message reactions');

  // Create sample invitations
  await prisma.eventInvitation.create({
    data: {
      senderId: user1.id,
      recipientId: user3.id,
      eventId: event2.id,
      message: 'You should join the holiday potluck!',
      viewed: false,
      rsvpStatus: 'Pending',
    },
  });

  await prisma.eventInvitation.create({
    data: {
      senderId: user2.id,
      recipientId: user1.id,
      eventId: event1.id,
      message: 'Come to my BBQ party!',
      viewed: true,
      rsvpStatus: 'Accepted',
    },
  });

  console.log('Created event invitations');

  // Create sample OTP for user1
  await prisma.userOtp.create({
    data: {
      userId: user1.id,
      otp: '123456',
      expiry: new Date(Date.now() + 10 * 60 * 1000), // 10 minutes from now
      consumed: false,
    },
  });

  // Create sample OTP for user2
  await prisma.userOtp.create({
    data: {
      userId: user2.id,
      otp: '654321',
      expiry: new Date(Date.now() + 15 * 60 * 1000), // 15 minutes from now
      consumed: false,
    },
  });

  console.log('Seeding completed successfully!');
}

main()
  .catch((e) => {
    console.error('Error seeding database:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
