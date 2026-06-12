import { ApolloServer } from '@apollo/server';
import { startServerAndCreateNextHandler } from '@as-integrations/next';
import { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { auth } from '@/auth';

const typeDefs = `#graphql
  type Category { id: ID! name: String! }
  type Company { id: ID! name: String! }

  type Question {
    id: ID!
    title: String!
    description: String!
    difficulty: String!
    categories: [Category!]!
    companies: [Company!]!
    userStatus: String
  }

  type Query {
    questions: [Question!]!
    question(id: ID!): Question
    categories: [Category!]!
    companies: [Company!]!
  }

  type Mutation {
    createQuestion(
      title: String!
      description: String!
      difficulty: String!
      categoryNames: [String!]!
      companyNames: [String!]!
    ): Question!
    
    updateProgress(questionId: ID!, status: String!): Question!
  }
`;

const resolvers = {
  Query: {
    questions: async () => {
      const session = await auth();
      
      // If not logged in, return questions without progress metrics
      if (!session?.user?.id) {
        const questions = await prisma.question.findMany({
          include: { categories: true, companies: true },
        });
        return questions.map(q => ({ ...q, userStatus: 'NOT_STARTED' }));
      }

      // Fetch questions containing this specific user's progress
      const questions = await prisma.question.findMany({
        include: { 
          categories: true, 
          companies: true,
          progress: { where: { userId: session.user.id } } 
        },
      });

      return questions.map(q => ({
        ...q,
        userStatus: q.progress[0]?.status || 'NOT_STARTED'
      }));
    },
    
    question: async (_: any, args: { id: string }) => {
      return await prisma.question.findUnique({
        where: { id: args.id },
        include: { categories: true, companies: true },
      });
    },
    categories: async () => await prisma.category.findMany(),
    companies: async () => await prisma.company.findMany(),
  },
  
  Mutation: {
    createQuestion: async (_: any, args: any) => {
      return await prisma.question.create({
        data: {
          title: args.title,
          description: args.description,
          difficulty: args.difficulty,
          categories: { connectOrCreate: args.categoryNames.map((name: string) => ({ where: { name }, create: { name } })) },
          companies: { connectOrCreate: args.companyNames.map((name: string) => ({ where: { name }, create: { name } })) }
        },
        include: { categories: true, companies: true }
      });
    },

    updateProgress: async (_: any, args: { questionId: string, status: string }) => {
      const session = await auth();
      if (!session?.user?.id) {
        throw new Error("Unauthorized: Please log in to track progress.");
      }

      const userId = session.user.id;

      await prisma.userProgress.upsert({
        where: {
          userId_questionId: { userId, questionId: args.questionId }
        },
        update: { status: args.status },
        create: { userId, questionId: args.questionId, status: args.status }
      });

      const updatedQuestion = await prisma.question.findUnique({
        where: { id: args.questionId },
        include: { categories: true, companies: true }
      });

      return { ...updatedQuestion, userStatus: args.status };
    }
  },
};

// --- INITIALIZATION AND EXPORTS ---
const server = new ApolloServer({ typeDefs, resolvers });
const handler = startServerAndCreateNextHandler<NextRequest>(server);

// Explicitly allowing GET and POST requests for Next.js App Router
export async function GET(request: NextRequest) {
  return handler(request);
}

export async function POST(request: NextRequest) {
  return handler(request);
}