import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function resetDatabase() {
  try {
    // Delete all records in reverse dependency order to avoid foreign key issues
    await prisma.eventSegmentAttendeeContribution.deleteMany();
    await prisma.eventSegmentAttendee.deleteMany();
    await prisma.eventSegment.deleteMany();
    await prisma.eventChatMessageReaction.deleteMany();
    await prisma.eventChatMessage.deleteMany();
    await prisma.eventAttendee.deleteMany();
    await prisma.eventInvitation.deleteMany();
    await prisma.event.deleteMany();
    await prisma.userOtp.deleteMany();
    await prisma.userAllergy.deleteMany();
    await prisma.user.deleteMany();

    console.log('Database reset successfully. All records deleted.');
  } catch (error) {
    console.error('Error resetting database:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

resetDatabase();
