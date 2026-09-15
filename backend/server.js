/**
 * ============================================================
 * AI SMART WASTE REDISTRIBUTION PLATFORM
 * Fallback / Direct Runner REST Server (Node.js native)
 * Mirrors Java Spring Boot REST API Endpoints on Port 8080
 * ============================================================
 */

const http = require('http');
const fs = require('fs');
const path = require('path');
const url = require('url');

const PORT = 8080;
const UPLOAD_DIR = path.join(__dirname, 'uploads');
const AI_SERVICE_URL = 'http://localhost:8000/analyze';

// Ensure uploads directory exists
if (!fs.existsSync(UPLOAD_DIR)) {
  fs.mkdirSync(UPLOAD_DIR, { recursive: true });
}

// In-Memory DB Persistence Store
const donors = [
  { id: 1, name: "Demo Donor", email: "donor@example.com", password: "password123", phone: "9876543210", location: "Bangalore" }
];
const items = [];
const analysisResults = [];
let itemIdCounter = 1;
let donorIdCounter = 2;

function setCorsHeaders(res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
}

async function callPythonAIService(name, description, category, quantity, location) {
  try {
    const postData = new URLSearchParams({ name, description, category, quantity, location }).toString();
    const reqOptions = {
      hostname: 'localhost',
      port: 8000,
      path: '/analyze',
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Content-Length': Buffer.byteLength(postData)
      }
    };

    return new Promise((resolve) => {
      const req = http.request(reqOptions, (res) => {
        let body = '';
        res.on('data', chunk => body += chunk);
        res.on('end', () => {
          try {
            const parsed = JSON.parse(body);
            if (parsed.status === 'SUCCESS' && parsed.analysis) {
              resolve(parsed.analysis);
            } else {
              resolve(null);
            }
          } catch (e) {
            resolve(null);
          }
        });
      });
      req.on('error', () => resolve(null));
      req.write(postData);
      req.end();
    });
  } catch (e) {
    return null;
  }
}

function fallbackAI(name, description, category) {
  const text = (name + " " + description).toLowerCase();
  let predictedCategory = category || "Food";
  if (text.includes("shirt") || text.includes("pant") || text.includes("cloth")) predictedCategory = "Clothes";
  else if (text.includes("book") || text.includes("novel")) predictedCategory = "Books";
  else if (text.includes("table") || text.includes("chair")) predictedCategory = "Furniture";
  else if (text.includes("phone") || text.includes("laptop")) predictedCategory = "Electronics";

  let condition = "Good";
  if (text.includes("new") || text.includes("fresh")) condition = "New";
  else if (text.includes("broken") || text.includes("damaged")) condition = "Needs Repair";

  let priority = predictedCategory === "Food" ? "High" : "Medium";
  let shelfLife = predictedCategory === "Food" ? "12 - 24 Hours (Immediate Redistribution)" : null;

  return {
    predicted_category: predictedCategory,
    item_condition: condition,
    priority: priority,
    confidence: 94.0,
    estimated_shelf_life: shelfLife
  };
}

const server = http.createServer(async (req, res) => {
  setCorsHeaders(res);

  if (req.method === 'OPTIONS') {
    res.writeHead(204);
    res.end();
    return;
  }

  const parsedUrl = url.parse(req.url, true);
  const pathname = parsedUrl.pathname;

  // Serve Static Uploads
  if (pathname.startsWith('/uploads/')) {
    const filename = path.basename(pathname);
    const filePath = path.join(UPLOAD_DIR, filename);
    if (fs.existsSync(filePath)) {
      res.writeHead(200, { 'Content-Type': 'image/jpeg' });
      fs.createReadStream(filePath).pipe(res);
      return;
    } else {
      res.writeHead(404);
      res.end('Not Found');
      return;
    }
  }

  // Parse Body for JSON / Form-Data
  let bodyChunks = [];
  req.on('data', chunk => bodyChunks.push(chunk));
  req.on('end', async () => {
    const rawBuffer = Buffer.concat(bodyChunks);
    const bodyString = rawBuffer.toString('utf8');

    // 1. POST /api/auth/register
    if (pathname === '/api/auth/register' && req.method === 'POST') {
      try {
        const data = JSON.parse(bodyString);
        const existing = donors.find(d => d.email === data.email);
        if (existing) {
          res.writeHead(400, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({ success: false, message: 'Email already registered.' }));
          return;
        }

        const newDonor = {
          id: donorIdCounter++,
          name: data.name,
          email: data.email,
          password: data.password,
          phone: data.phone || '',
          location: data.location || ''
        };
        donors.push(newDonor);

        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ success: true, message: 'Registration successful!', donor: newDonor }));
      } catch (e) {
        res.writeHead(400, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ success: false, message: 'Invalid JSON payload' }));
      }
      return;
    }

    // 2. POST /api/auth/login
    if (pathname === '/api/auth/login' && req.method === 'POST') {
      try {
        const data = JSON.parse(bodyString);
        const donor = donors.find(d => d.email === data.email);
        if (!donor || donor.password !== data.password) {
          res.writeHead(400, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({ success: false, message: 'Invalid email or password.' }));
          return;
        }

        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ success: true, message: 'Login successful!', donor }));
      } catch (e) {
        res.writeHead(400, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ success: false, message: 'Invalid JSON' }));
      }
      return;
    }

    // 3. POST /api/items/analyze-and-save
    if (pathname === '/api/items/analyze-and-save' && req.method === 'POST') {
      try {
        const boundary = req.headers['content-type'] ? req.headers['content-type'].split('boundary=')[1] : null;
        let fields = {};
        let savedImagePath = null;

        if (boundary) {
          const parts = bodyString.split('--' + boundary);
          for (let part of parts) {
            if (part.includes('name="donorId"')) fields.donorId = part.split('\r\n\r\n')[1]?.trim();
            if (part.includes('name="name"')) fields.name = part.split('\r\n\r\n')[1]?.trim();
            if (part.includes('name="description"')) fields.description = part.split('\r\n\r\n')[1]?.trim();
            if (part.includes('name="category"')) fields.category = part.split('\r\n\r\n')[1]?.trim();
            if (part.includes('name="quantity"')) fields.quantity = part.split('\r\n\r\n')[1]?.trim();
            if (part.includes('name="location"')) fields.location = part.split('\r\n\r\n')[1]?.trim();
            if (part.includes('filename=')) {
              const fileMatch = part.match(/filename="([^"]+)"/);
              if (fileMatch && fileMatch[1]) {
                const ext = path.extname(fileMatch[1]) || '.jpg';
                const filename = 'img_' + Date.now() + ext;
                const filePath = path.join(UPLOAD_DIR, filename);
                
                // Extract binary buffer for image
                const headerEnd = rawBuffer.indexOf(Buffer.from('\r\n\r\n')) + 4;
                const fileEnd = rawBuffer.lastIndexOf(Buffer.from('\r\n--' + boundary));
                if (headerEnd > 0 && fileEnd > headerEnd) {
                  const fileBuffer = rawBuffer.slice(headerEnd, fileEnd);
                  fs.writeFileSync(filePath, fileBuffer);
                  savedImagePath = '/uploads/' + filename;
                }
              }
            }
          }
        }

        const donorId = parseInt(fields.donorId || '1');
        const donor = donors.find(d => d.id === donorId) || donors[0];

        const newItem = {
          id: itemIdCounter++,
          donorId: donor.id,
          name: fields.name || 'Surplus Item',
          description: fields.description || '',
          category: fields.category || 'Food',
          quantity: fields.quantity || '1',
          location: fields.location || donor.location || 'Bangalore',
          imagePath: savedImagePath,
          createdAt: new Date().toISOString()
        };
        items.push(newItem);

        // Call Python FastAPI AI service
        let aiResult = await callPythonAIService(newItem.name, newItem.description, newItem.category, newItem.quantity, newItem.location);
        if (!aiResult) {
          aiResult = fallbackAI(newItem.name, newItem.description, newItem.category);
        }

        const newAnalysis = {
          id: newItem.id,
          itemId: newItem.id,
          predictedCategory: aiResult.predicted_category || aiResult.predictedCategory || newItem.category,
          itemCondition: aiResult.item_condition || aiResult.itemCondition || "Good",
          priority: aiResult.priority || "High",
          confidence: aiResult.confidence || 92.0,
          estimatedShelfLife: aiResult.estimated_shelf_life || aiResult.estimatedShelfLife || null
        };
        analysisResults.push(newAnalysis);

        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({
          item: newItem,
          analysisResult: newAnalysis
        }));
      } catch (err) {
        res.writeHead(500, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: err.message }));
      }
      return;
    }

    // 4. GET /api/items/donor/:donorId
    if (pathname.startsWith('/api/items/donor/') && req.method === 'GET') {
      const donorId = parseInt(pathname.split('/')[4]);
      const donorItems = items.filter(i => i.donorId === donorId).map(item => {
        const analysisResult = analysisResults.find(a => a.itemId === item.id);
        return { ...item, analysisResult };
      });
      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify(donorItems));
      return;
    }

    // Default 404
    res.writeHead(404, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ message: 'Not Found' }));
  });
});

server.listen(PORT, () => {
  console.log(`\n====================================================`);
  console.log(` REST Backend Active on http://localhost:${PORT}`);
  console.log(`====================================================\n`);
});
