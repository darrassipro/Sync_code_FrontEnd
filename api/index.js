export default function handler(req, res) {
  // Enable CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'GET') {
    return res.status(405).json({
      success: false,
      error: 'Method not allowed'
    });
  }

  res.status(200).json({
    success: true,
    message: 'Code Sync API is running',
    endpoints: {
      '/api/sync': {
        GET: 'Get current code for session',
        POST: 'Update code for session',
        PUT: 'Join session'
      }
    },
    timestamp: new Date().toISOString()
  });
}