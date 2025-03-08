const fs = require('fs');
const path = require('path');

export default function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    const filePath = path.join(process.cwd(), 'src', 'data.json');
    fs.writeFileSync(filePath, JSON.stringify(req.body, null, 2));
    res.status(200).json({ message: 'Data updated successfully' });
  } catch (error) {
    console.error('Error writing file:', error);
    res.status(500).json({ message: 'Error updating data' });
  }
} 