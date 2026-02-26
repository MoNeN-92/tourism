-- Unify authentication on "User" model: migrate legacy "Admin" credentials.

INSERT INTO "User" (
  "id",
  "email",
  "passwordHash",
  "firstName",
  "lastName",
  "phone",
  "role",
  "isActive",
  "createdAt",
  "updatedAt"
)
SELECT
  a."id",
  LOWER(a."email"),
  a."password",
  a."firstName",
  a."lastName",
  '+995000000000',
  CASE
    WHEN a."role"::text = 'MODERATOR' THEN 'MODERATOR'::"UserRole"
    ELSE 'ADMIN'::"UserRole"
  END,
  true,
  COALESCE(a."createdAt", NOW()),
  NOW()
FROM "Admin" a
LEFT JOIN "User" u ON u."email" = LOWER(a."email")
WHERE u."id" IS NULL;

UPDATE "User" u
SET
  "passwordHash" = a."password",
  "firstName" = a."firstName",
  "lastName" = a."lastName",
  "role" = CASE
    WHEN a."role"::text = 'MODERATOR' THEN 'MODERATOR'::"UserRole"
    ELSE 'ADMIN'::"UserRole"
  END,
  "isActive" = true,
  "updatedAt" = NOW()
FROM "Admin" a
WHERE u."email" = LOWER(a."email");
