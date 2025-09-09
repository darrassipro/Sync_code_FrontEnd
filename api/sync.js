// In-memory storage for code sessions
const sessions = new Map();

export default function handler(req, res) {
  // Enable CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  const { method, query } = req;
  const sessionId = query.sessionId || 'default';

  switch (method) {
    case 'GET':
      // Get current code for session
      const session = sessions.get(sessionId) || {
        code: '',
        lastModified: Date.now(),
        participants: 0
      };
      
      res.status(200).json({
        success: true,
        data: session
      });
      break;

    case 'POST':
      // Update code for session
      const { code, participantId } = req.body;
      
      if (!code === undefined) {
        return res.status(400).json({
          success: false,
          error: 'Code content is required'
        });
      }

      const updatedSession = {
        code,
        lastModified: Date.now(),
        participants: sessions.get(sessionId)?.participants || 0,
        lastUpdatedBy: participantId
      };

      sessions.set(sessionId, updatedSession);

      res.status(200).json({
        success: true,
        data: updatedSession
      });
      break;

    case 'PUT':
      // Join session (increment participant count)
      const currentSession = sessions.get(sessionId) || {
        code: '',
        lastModified: Date.now(),
        participants: 0
      };

      currentSession.participants += 1;
      sessions.set(sessionId, currentSession);

      res.status(200).json({
        success: true,
        data: currentSession
      });
      break;

    default:
      res.setHeader('Allow', ['GET', 'POST', 'PUT', 'OPTIONS']);
      res.status(405).json({
        success: false,
        error: `Method ${method} Not Allowed`
      });
  }
}