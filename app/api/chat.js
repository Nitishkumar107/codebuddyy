export default function handler(req, res) {
    if (req.method === 'POST') {
        // Handle POST request
        res.status(200).json({ message: 'Chat endpoint working' });
    } else if (req.method === 'GET') {
        // Handle GET request if needed
        res.status(200).json({ message: 'Chat endpoint working' });
    } else {
        // Handle other methods
        res.status(405).json({ message: 'Method Not Allowed' });
    }
}
