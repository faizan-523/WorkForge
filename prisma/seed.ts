import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  // Clear existing data
  await prisma.savedProject.deleteMany({});
  await prisma.savedFreelancer.deleteMany({});
  await prisma.message.deleteMany({});
  await prisma.notification.deleteMany({});
  await prisma.review.deleteMany({});
  await prisma.proposal.deleteMany({});
  await prisma.project.deleteMany({});
  await prisma.profile.deleteMany({});
  await prisma.session.deleteMany({});
  await prisma.user.deleteMany({});

  const passwordHash = await bcrypt.hash('password123', 10);

  // 1. Create Users
  const admin = await prisma.user.create({
    data: {
      email: 'admin@workforge.com',
      passwordHash,
      name: 'Site Administrator',
      role: 'ADMIN',
    },
  });

  const client = await prisma.user.create({
    data: {
      email: 'client@workforge.com',
      passwordHash,
      name: 'Acme Corp Client',
      role: 'CLIENT',
    },
  });

  const freelancer = await prisma.user.create({
    data: {
      email: 'freelancer@workforge.com',
      passwordHash,
      name: 'John Dev',
      role: 'FREELANCER',
    },
  });

  // 2. Create Profiles
  await prisma.profile.create({
    data: {
      userId: client.id,
      companyName: 'Acme Corporation',
      companyLogo: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=150',
    },
  });

  await prisma.profile.create({
    data: {
      userId: freelancer.id,
      title: 'Full-Stack Developer',
      bio: 'Experienced developer specializing in React, Next.js, Node.js, and TypeScript. Over 5 years of building production-grade web applications.',
      skills: 'React,Next.js,Node.js,TypeScript,PostgreSQL,Tailwind CSS',
      experience: JSON.stringify([
        { role: 'Senior Engineer', company: 'Tech Inc', duration: '2022 - Present' },
        { role: 'Frontend Developer', company: 'Web Solutions', duration: '2020 - 2022' }
      ]),
      portfolioLinks: JSON.stringify([
        { label: 'GitHub', url: 'https://github.com' },
        { label: 'Portfolio', url: 'https://workforge.com' }
      ]),
      imageUrl: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150',
    },
  });

  // 3. Create Projects
  const project1 = await prisma.project.create({
    data: {
      clientId: client.id,
      title: 'E-commerce Next.js Frontend Redesign',
      description: 'We are looking for an expert Next.js and Tailwind CSS developer to completely redesign our e-commerce checkout flow. The new pages must be extremely responsive, modern, and accessible. You will integrate with our existing REST API.',
      budget: 2500,
      deadline: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000), // 15 days from now
      experienceLevel: 'EXPERT',
      category: 'Development',
      skills: 'Next.js,TypeScript,Tailwind CSS,React',
      status: 'OPEN',
    },
  });

  const project2 = await prisma.project.create({
    data: {
      clientId: client.id,
      title: 'Corporate Landing Page Design',
      description: 'Need a UI/UX designer to design a sleek 5-page corporate website landing page in Figma and optionally implement it using CSS/HTML. The landing page needs to be high-converting and modern.',
      budget: 800,
      deadline: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days from now
      experienceLevel: 'INTERMEDIATE',
      category: 'Design',
      skills: 'Figma,UI/UX,Tailwind CSS',
      status: 'OPEN',
    },
  });

  // 4. Create Proposals
  await prisma.proposal.create({
    data: {
      projectId: project1.id,
      freelancerId: freelancer.id,
      bidAmount: 2300,
      coverLetter: 'Hi, I would love to assist you with the React/Next.js frontend redesign. I have completed several high-performance e-commerce pages using similar stacks. Check out my profile for portfolio links.',
      durationDays: 10,
      status: 'PENDING',
    },
  });

  console.log('Database seeded successfully!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
