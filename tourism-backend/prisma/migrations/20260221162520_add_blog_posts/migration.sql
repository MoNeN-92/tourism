-- CreateTable
CREATE TABLE "BlogPost" (
    "id" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "title_ka" TEXT NOT NULL,
    "title_en" TEXT NOT NULL,
    "title_ru" TEXT NOT NULL,
    "excerpt_ka" TEXT NOT NULL,
    "excerpt_en" TEXT NOT NULL,
    "excerpt_ru" TEXT NOT NULL,
    "content_ka" TEXT NOT NULL,
    "content_en" TEXT NOT NULL,
    "content_ru" TEXT NOT NULL,
    "author_ka" TEXT NOT NULL,
    "author_en" TEXT NOT NULL,
    "author_ru" TEXT NOT NULL,
    "coverImage" TEXT NOT NULL,
    "published" BOOLEAN NOT NULL DEFAULT false,
    "publishedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "BlogPost_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "BlogPost_slug_key" ON "BlogPost"("slug");
