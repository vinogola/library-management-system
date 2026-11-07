import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  await prisma.genre.createMany({
    skipDuplicates: true,
    data: [
      { name: 'Science Fiction', slug: 'science-fiction' },
      { name: 'Fantasy', slug: 'fantasy' },
      { name: 'Mystery', slug: 'mystery' },
      { name: 'Productivity', slug: 'productivity' },
    ],
  });

  const getGenre = async (slug: string) => {
    const genre = await prisma.genre.findUnique({ where: { slug } });
    if (genre === null) throw new Error(`Genre with slug '${slug}' not found`);
    return genre;
  };

  const fantasy = await getGenre('fantasy');
  const scienceFiction = await getGenre('science-fiction');
  const mystery = await getGenre('mystery');
  const productivity = await getGenre('productivity');

  await prisma.book.deleteMany();

  await prisma.book.createMany({
    data: [
      // Science Fiction
      {
        title: 'Dune',
        author: 'Frank Herbert',
        publisher: 'Chilton Books',
        publicationDate: new Date('1965-01-01'),
        language: 'English',
        genreId: scienceFiction.id,
      },
      {
        title: 'Neuromancer',
        author: 'William Gibson',
        publisher: 'Ace',
        publicationDate: new Date('1984-01-01'),
        language: 'English',
        genreId: scienceFiction.id,
      },
      {
        title: 'The Left Hand of Darkness',
        author: 'Ursula K. Le Guin',
        language: 'English',
        genreId: scienceFiction.id,
      },
      {
        title: 'Foundation',
        author: 'Isaac Asimov',
        publisher: 'Gnome Press',
        publicationDate: new Date('1951-01-01'),
        language: 'English',
        genreId: scienceFiction.id,
      },
      // Fantasy
      {
        title: 'The Hobbit',
        author: 'J.R.R. Tolkien',
        publisher: 'George Allen & Unwin',
        publicationDate: new Date('1937-01-01'),
        language: 'English',
        genreId: fantasy.id,
      },
      {
        title: 'A Wizard of Earthsea',
        author: 'Ursula K. Le Guin',
        language: 'English',
        genreId: fantasy.id,
      },
      {
        title: 'The Name of the Wind',
        author: 'Patrick Rothfuss',
        publisher: 'DAW Books',
        publicationDate: new Date('2007-01-01'),
        language: 'English',
        genreId: fantasy.id,
      },
      {
        title: 'Mistborn: The Final Empire',
        author: 'Brandon Sanderson',
        language: 'English',
        genreId: fantasy.id,
      },
      // Mystery
      {
        title: 'Murder on the Orient Express',
        author: 'Agatha Christie',
        publicationDate: new Date('1934-01-01'),
        language: 'English',
        genreId: mystery.id,
      },
      {
        title: 'The Hound of the Baskervilles',
        author: 'Arthur Conan Doyle',
        language: 'English',
        genreId: mystery.id,
      },
      {
        title: 'Gone Girl',
        author: 'Gillian Flynn',
        publisher: 'Crown',
        publicationDate: new Date('2012-01-01'),
        language: 'English',
        genreId: mystery.id,
      },
      {
        // Original Swedish edition, so it uses a different language value
        title: 'The Girl with the Dragon Tattoo',
        author: 'Stieg Larsson',
        language: 'Swedish',
        genreId: mystery.id,
      },
      // Productivity
      {
        title: 'Atomic Habits',
        author: 'James Clear',
        publisher: 'Avery',
        publicationDate: new Date('2018-01-01'),
        language: 'English',
        genreId: productivity.id,
      },
      {
        title: 'Deep Work',
        author: 'Cal Newport',
        language: 'English',
        genreId: productivity.id,
      },
      {
        title: 'Getting Things Done',
        author: 'David Allen',
        publisher: 'Viking',
        publicationDate: new Date('2001-01-01'),
        language: 'English',
        genreId: productivity.id,
      },
      {
        title: 'The 7 Habits of Highly Effective People',
        author: 'Stephen R. Covey',
        language: 'English',
        genreId: productivity.id,
      },
    ],
  });
}

main()
  .catch((err) => {
    console.log(err);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
