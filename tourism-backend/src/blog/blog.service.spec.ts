import { BlogService } from './blog.service';

describe('BlogService', () => {
  const prismaMock = {
    blogPost: {
      update: jest.fn(),
    },
  };

  let service: BlogService;

  beforeEach(() => {
    service = new BlogService(prismaMock as any);
    jest.clearAllMocks();
  });

  it('sets publishedAt only when draft becomes published', async () => {
    jest.spyOn(service, 'findOne').mockResolvedValue({
      id: '1',
      published: false,
      publishedAt: null,
    } as any);

    prismaMock.blogPost.update.mockResolvedValue({});

    await service.update('1', { published: true, title_en: 'Updated' });

    expect(prismaMock.blogPost.update).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { id: '1' },
        data: expect.objectContaining({
          published: true,
          title_en: 'Updated',
          publishedAt: expect.any(Date),
        }),
      }),
    );
  });

  it('keeps existing publishedAt when already published and publish flag unchanged', async () => {
    const existingPublishedAt = new Date('2026-01-15T10:00:00.000Z');

    jest.spyOn(service, 'findOne').mockResolvedValue({
      id: '1',
      published: true,
      publishedAt: existingPublishedAt,
    } as any);

    prismaMock.blogPost.update.mockResolvedValue({});

    await service.update('1', { title_en: 'Keep Date' });

    expect(prismaMock.blogPost.update).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { id: '1' },
        data: expect.objectContaining({
          title_en: 'Keep Date',
          publishedAt: existingPublishedAt,
        }),
      }),
    );
  });

  it('clears publishedAt when published post is set back to draft', async () => {
    jest.spyOn(service, 'findOne').mockResolvedValue({
      id: '1',
      published: true,
      publishedAt: new Date('2026-01-15T10:00:00.000Z'),
    } as any);

    prismaMock.blogPost.update.mockResolvedValue({});

    await service.update('1', { published: false });

    expect(prismaMock.blogPost.update).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { id: '1' },
        data: expect.objectContaining({
          published: false,
          publishedAt: null,
        }),
      }),
    );
  });
});
