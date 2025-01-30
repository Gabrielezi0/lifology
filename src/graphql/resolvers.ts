import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

const prisma = new PrismaClient();
const JWT_SECRET = process.env.JWT_SECRET!;

export const resolvers = {
  Query: {
    getPosts: async () => {
      return await prisma.post.findMany({ include: { author: true } });
    },
    getPost: async (_: any, { id }: { id: string }) => {
      return await prisma.post.findUnique({ where: { id }, include: { author: true } });
    },
    searchPosts: async (_: any, { keyword }: { keyword: string }) => {
      return await prisma.post.findMany({
        where: {
          OR: [
            { title: { contains: keyword, mode: "insensitive" } },
            { content: { contains: keyword, mode: "insensitive" } }
          ]
        },
        include: { author: true },
      });
    }
  },

  Mutation: {
    signup: async (_: any, { email, password }: { email: string; password: string }) => {
      const hashedPassword = await bcrypt.hash(password, 10);
      const user = await prisma.user.create({ data: { email, password: hashedPassword } });
      const token = jwt.sign({ userId: user.id }, JWT_SECRET, { expiresIn: "7d" });

      return { ...user, token };
    },

    login: async (_: any, { email, password }: { email: string; password: string }) => {
      const user = await prisma.user.findUnique({ where: { email } });
      if (!user) throw new Error("User not found");

      const isValid = await bcrypt.compare(password, user.password);
      if (!isValid) throw new Error("Incorrect password");

      const token = jwt.sign({ userId: user.id }, JWT_SECRET, { expiresIn: "7d" });
      return { ...user, token };
    },

    createPost: async (_: any, { title, content }: { title: string; content: string }, { user }: any) => {
      if (!user) throw new Error("Not authenticated");
      
      return await prisma.post.create({
        data: { title, content, authorId: user.userId }
      });
    },

    updatePost: async (_: any, { id, title, content }: { id: string; title: string; content: string }, { user }: any) => {
      if (!user) throw new Error("Not authenticated");

      const post = await prisma.post.findUnique({ where: { id } });
      if (!post || post.authorId !== user.userId) throw new Error("Unauthorized");

      return await prisma.post.update({
        where: { id },
        data: { title, content }
      });
    },

    deletePost: async (_: any, { id }: { id: string }, { user }: any) => {
      if (!user) throw new Error("Not authenticated");

      const post = await prisma.post.findUnique({ where: { id } });
      if (!post || post.authorId !== user.userId) throw new Error("Unauthorized");

      await prisma.post.delete({ where: { id } });
      return "Post deleted";
    }
  }
};
