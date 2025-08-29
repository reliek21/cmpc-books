import { NextApiRequest, NextApiResponse } from 'next';

// Mock data for demonstration - replace with actual database queries
const mockBooks = [
  {
    id: '1',
    title: 'The Great Gatsby',
    author: 'F. Scott Fitzgerald',
    publisher: 'Scribner',
    genre: 'Fiction',
    available: true,
    createdAt: '2024-01-15T10:00:00Z',
  },
  {
    id: '2',
    title: '1984',
    author: 'George Orwell',
    publisher: 'Secker & Warburg',
    genre: 'Sci-Fi',
    available: false,
    createdAt: '2024-01-20T14:30:00Z',
  },
  {
    id: '3',
    title: 'To Kill a Mockingbird',
    author: 'Harper Lee',
    publisher: 'J.B. Lippincott & Co.',
    genre: 'Fiction',
    available: true,
    createdAt: '2024-02-01T09:15:00Z',
  },
  {
    id: '4',
    title: 'Pride and Prejudice',
    author: 'Jane Austen',
    publisher: 'T. Egerton',
    genre: 'Romance',
    available: true,
    createdAt: '2024-02-10T16:45:00Z',
  },
  {
    id: '5',
    title: 'The Catcher in the Rye',
    author: 'J.D. Salinger',
    publisher: 'Little, Brown and Company',
    genre: 'Fiction',
    available: false,
    createdAt: '2024-02-15T11:20:00Z',
  },
];

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'GET') {
    try {
      const {
        page = '1',
        pageSize = '10',
        q = '',
        genre = '',
        publisher = '',
        author = '',
        available = '',
        sort = '',
      } = req.query;

      let filteredBooks = [...mockBooks];

      // Apply search filter
      if (q) {
        const searchTerm = q.toString().toLowerCase();
        filteredBooks = filteredBooks.filter(book =>
          book.title.toLowerCase().includes(searchTerm) ||
          book.author.toLowerCase().includes(searchTerm) ||
          book.publisher.toLowerCase().includes(searchTerm) ||
          book.genre.toLowerCase().includes(searchTerm)
        );
      }

      // Apply filters
      if (genre && genre !== 'all') {
        filteredBooks = filteredBooks.filter(book => book.genre === genre);
      }

      if (publisher && publisher !== 'all') {
        filteredBooks = filteredBooks.filter(book => book.publisher === publisher);
      }

      if (author && author !== 'all') {
        filteredBooks = filteredBooks.filter(book => book.author === author);
      }

      if (available && available !== 'any') {
        const isAvailable = available === 'true';
        filteredBooks = filteredBooks.filter(book => book.available === isAvailable);
      }

      // Apply sorting
      if (sort) {
        const sortParams = sort.toString().split(',').map(s => {
          const [field, dir] = s.split(':');
          return { field, dir: dir as 'asc' | 'desc' };
        });

        filteredBooks.sort((a, b) => {
          for (const { field, dir } of sortParams) {
            const aVal = a[field as keyof typeof a];
            const bVal = b[field as keyof typeof b];

            let comparison = 0;
            if (aVal < bVal) comparison = -1;
            if (aVal > bVal) comparison = 1;

            if (comparison !== 0) {
              return dir === 'desc' ? -comparison : comparison;
            }
          }
          return 0;
        });
      }

      // Apply pagination
      const currentPage = parseInt(page.toString(), 10);
      const pageSizeNum = parseInt(pageSize.toString(), 10);
      const startIndex = (currentPage - 1) * pageSizeNum;
      const endIndex = startIndex + pageSizeNum;
      const paginatedBooks = filteredBooks.slice(startIndex, endIndex);

      res.status(200).json({
        items: paginatedBooks,
        total: filteredBooks.length,
        page: currentPage,
        pageSize: pageSizeNum,
      });
    } catch (error) {
      console.error('Error fetching books:', error);
      res.status(500).json({ message: 'Internal server error' });
    }
  } else if (req.method === 'POST') {
    try {
      // In a real application, you would save to database
      // For now, just return success
      res.status(201).json({
        message: 'Book created successfully',
        id: Date.now().toString(),
      });
    } catch (error) {
      console.error('Error creating book:', error);
      res.status(500).json({ message: 'Internal server error' });
    }
  } else {
    res.setHeader('Allow', ['GET', 'POST']);
    res.status(405).json({ message: 'Method not allowed' });
  }
}
