// src/blog/blog.controller.ts
import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  UseGuards,
} from '@nestjs/common'
import { BlogService } from './blog.service'
import { CreateBlogPostDto } from './dto/create-blog-post.dto'
import { UpdateBlogPostDto } from './dto/update-blog-post.dto'
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard'

// Public endpoints
@Controller('blog')
export class BlogController {
  constructor(private blogService: BlogService) {}

  @Get()
  findAll() {
    return this.blogService.findPublished()
  }

  @Get(':slug')
  findBySlug(@Param('slug') slug: string) {
    return this.blogService.findBySlug(slug)
  }
}

// Admin endpoints (protected)
@Controller('admin/blog')
@UseGuards(JwtAuthGuard)
export class AdminBlogController {
  constructor(private blogService: BlogService) {}

  @Get()
  findAll() {
    return this.blogService.findAll()
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.blogService.findOne(id)
  }

  @Post()
  create(@Body() dto: CreateBlogPostDto) {
    return this.blogService.create(dto)
  }

  @Put(':id')
  update(@Param('id') id: string, @Body() dto: UpdateBlogPostDto) {
    return this.blogService.update(id, dto)
  }

  @Delete(':id')
  delete(@Param('id') id: string) {
    return this.blogService.delete(id)
  }
}