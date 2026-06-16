import { loadPublicQuiz, submitPublicQuiz } from '../../server/publicQuiz';

export default async function handler(req: any, res: any) {
  const slug = String(req.query.slug || '').trim();
  if (!slug) {
    return res.status(400).json({ error: 'Missing public quiz slug.' });
  }

  try {
    if (req.method === 'GET') {
      const quiz = await loadPublicQuiz(slug);
      if (!quiz) {
        return res.status(404).json({ error: 'Link làm bài không tồn tại hoặc đã bị ẩn.' });
      }
      return res.status(200).json(quiz);
    }

    if (req.method === 'POST') {
      const result = await submitPublicQuiz(slug, req.body);
      if (!result) {
        return res.status(404).json({ error: 'Link làm bài không tồn tại hoặc đã bị ẩn.' });
      }
      return res.status(200).json(result);
    }

    return res.status(405).json({ error: 'Method Not Allowed' });
  } catch (error: any) {
    return res.status(error.statusCode || 500).json({
      error: error.message || 'Không thể xử lý bài làm public.',
    });
  }
}
