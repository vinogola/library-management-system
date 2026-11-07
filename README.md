# Library Management System

A library catalog API built with NestJS, Prisma and PostgreSQL. This is Week 1 of the PLP Full Stack Software Engineering course, so it's the data layer only: schema, migration, seed. There are no endpoints beyond the Nest starter.

**Status:** schema, migration, `PrismaService` and seed are done. `PrismaService` isn't registered in a Nest module yet, because nothing needs it until the CRUD endpoints in Week 2.

## What's in it

- **Prisma schema:** `Book`, `Genre` and `User` models, plus a `Role` enum (`PATRON`, `LIBRARIAN`).
- **One migration** that builds the tables in a hosted Neon PostgreSQL database.
- **`PrismaService`:** one shared `PrismaClient` that calls `$connect()` in `onModuleInit`, so it will connect at startup once a module registers it.
- **Seed script:** 4 genres and 16 books. It can run more than once.

The book list is sample data. Publication dates are approximate (January 1 of the right year) and some publishers may be wrong, so don't treat them as catalog facts.

## Schema Decisions

**Why Book references Genre instead of embedding it.** Each book stores a `genreId` that points to a row in `Genre`. One genre has many books, and a table cell holds one value, so the foreign key goes on the "many" side. If every book carried its own copy of the genre name, renaming a genre would mean editing every book, and one typo would split a genre in two. With a reference, the name lives in one place.

**Genre `name` and `slug` are both unique.** The name is for people, the slug is a stable key for lookups. The seed finds genres by slug because auto-generated ids aren't guaranteed to be 1 to 4.

**One `author` string per book.** Simple now, scalable later. I rejected `authors String[]` and a separate `Author` table for this week. A book with several authors or an author page would need one of them.

**Required and optional fields on Book.** `title`, `author`, `language` and `genreId` are required. `publisher`, `publicationDate` and `isbn` are optional, since not every book has them. `isbn` is unique too.

**Deleting a genre is blocked while books use it.** The `genreId` relation uses `ON DELETE RESTRICT`. That's Prisma's default for a required relation and I kept it, because a delete can't be undone and I'd rather the database refuse than leave orphaned or deleted books. Deleting a book is always allowed.

**User.** `email` is required, unique and the login identifier. `phone` is optional and unique (Postgres allows many NULLs in a unique column, so users without a phone don't clash). There's no organization ID, since email already identifies a person. `role` is required and defaults to `PATRON`; a nullable role would allow a user with no role, and every access check would have to defend against that. `password` will hold a hash, with hashing added in Week 2. `createdAt` and `updatedAt` fill themselves. Whether login should use a username instead of email is a Week 2 decision, when auth gets built.

## What I Learned

- **A migration moves structure, not rows.** After `migrate dev` the tables existed in Neon, empty. That's why the seed script exists.
- **`findUnique` can return `null`.** TypeScript flagged every `genreId: ….id` line in the seed as possibly null. Checking the lookup result and throwing when it's `null` fixes it, because the throw stops the function before the unsafe line.
- **`createMany` takes real columns only.** Passing `genre: …` next to `genreId` is rejected. `genre` is a relation field for reading, not a stored column.
- **A startup failure should stop the app.** If `onModuleInit` awaits `$connect()` and Neon is unreachable, Nest's startup stops with the error in the logs. The alternative is an app that starts and then fails every request with a 500. I haven't seen this run yet, since `PrismaService` isn't registered.

## Challenges I Struggled With

- **Re-running the seed would have doubled the books.** I added `skipDuplicates`, expecting it to protect them. It only skips rows that break a unique rule, and every book has `isbn` NULL, and NULLs never conflict. The fix was `deleteMany()` on books before inserting. Genres keep `skipDuplicates` because `name` and `slug` are unique.
- **A failed seed still exited with code 0.** My `.catch` logged the error and returned, so a terminal or CI job would call it a success. `process.exit(1)` makes the failure visible.
- **Misreading `ON DELETE CASCADE`.** I thought it meant "deleting a genre makes its books lose their genre". It actually deletes the books too. The option that only clears the link is `SET NULL`, which needs a `genreId` that can be empty. Mine is required, so I kept `RESTRICT`: the database refuses to delete a genre that still has books.

## Getting Started

Run every command from `api/`. Running Prisma from the repo root can pull a different Prisma version.

```bash
npm install
cp .env.example .env        # then paste your own Neon DATABASE_URL into .env
npx prisma migrate deploy   # applies the committed migration
npx prisma db seed          # inserts genres and books
npm run start:dev
```

Prisma is pinned to version 6 to match the course. Neon's free database sleeps when idle, so the first connection after a break can time out. Run the command again.

## Acknowledgements

Built as part of the PLP Full Stack Software Engineering course.
