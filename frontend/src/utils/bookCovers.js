const fallbackCovers = [
  'https://images.unsplash.com/photo-1517694712202-14dd9538aa97?w=480&h=640&fit=crop',
  'https://images.unsplash.com/photo-1544947950-fa07a98d237f?w=480&h=640&fit=crop',
  'https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=480&h=640&fit=crop',
  'https://images.unsplash.com/photo-1532012197267-da84d127e765?w=480&h=640&fit=crop',
  'https://images.unsplash.com/photo-1512820790803-83ca734da794?w=480&h=640&fit=crop',
];

export function getBookCover(book) {
  if (!book) return '';

  const cover = book.cover || '';
  if (cover && !cover.includes('example.com')) {
    return cover;
  }

  const index = Math.max(Number(book.id || 1) - 1, 0) % fallbackCovers.length;
  return fallbackCovers[index];
}
