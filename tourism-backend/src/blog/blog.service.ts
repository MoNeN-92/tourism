// src/blog/blog.service.ts
import { Injectable, NotFoundException } from '@nestjs/common'
import { PrismaService } from '../prisma/prisma.service'
import { CreateBlogPostDto } from './dto/create-blog-post.dto'
import { UpdateBlogPostDto } from './dto/update-blog-post.dto'

@Injectable()
export class BlogService {
  constructor(private prisma: PrismaService) {}

  async findAll() {
    return this.prisma.blogPost.findMany({
      orderBy: { createdAt: 'desc' },
    })
  }

  async findPublished() {
    return this.prisma.blogPost.findMany({
      where: { published: true },
      orderBy: { publishedAt: 'desc' },
    })
  }

  async findBySlug(slug: string) {
  const post = await this.prisma.blogPost.findUnique({
    where: { slug: slug.trim() },
  })
  if (!post) throw new NotFoundException('Blog post not found')
  return post
}

  async findOne(id: string) {
    const post = await this.prisma.blogPost.findUnique({
      where: { id },
    })
    if (!post) throw new NotFoundException('Blog post not found')
    return post
  }

  async create(dto: CreateBlogPostDto) {
    return this.prisma.blogPost.create({
      data: {
        ...dto,
        publishedAt: dto.published ? new Date() : null,
      },
    })
  }

  async update(id: string, dto: UpdateBlogPostDto) {
    await this.findOne(id)
    return this.prisma.blogPost.update({
      where: { id },
      data: {
        ...dto,
        publishedAt: dto.published ? new Date() : null,
      },
    })
  }

  async delete(id: string) {
    await this.findOne(id)
    return this.prisma.blogPost.delete({ where: { id } })
  }
}