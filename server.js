
const http = require('http');
const url = require('url');
const mysql = require('mysql');
const fs = require('fs');
const path = require('path');
const bodyParser = require('body-parser');


const db = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: '',
  database: 'datadiri' 
});

db.connect((err) => {
  if (err) {
    throw err;
  }
  console.log('Terhubung ke database MySQL');
});


const server = http.createServer((req, res) => {
 
  const reqUrl = url.parse(req.url, true);

 
  if (reqUrl.pathname === '/users' && req.method === 'GET') {
 
    db.query('SELECT * FROM users', (err, results) => {
      if (err) throw err;
      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify(results));
    });
  } else if (reqUrl.pathname === '/users' && req.method === 'POST') {
  
    let data = '';
    req.on('data', chunk => {
      data += chunk;
    });

    req.on('end', () => {
      const user = JSON.parse(data);
      db.query('INSERT INTO users SET ?', user, (err, result) => {
        if (err) throw err;
        res.writeHead(201, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ message: 'User berhasil ditambahkan', id: result.insertId }));
      });
    });
  } else if (reqUrl.pathname === '/users' && req.method === 'PUT') {
    
    let data = '';
    req.on('data', chunk => {
      data += chunk;
    });

    req.on('end', () => {
      const user = JSON.parse(data);
      const userId = user.id;
      delete user.id;

      db.query('UPDATE users SET ? WHERE id = ?', [user, userId], (err) => {
        if (err) throw err;
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ message: 'User berhasil diperbarui' }));
      });
    });
  } else if (reqUrl.pathname === '/users' && req.method === 'DELETE') {
    
    const userId = reqUrl.query.id;
    db.query('DELETE FROM users WHERE id = ?', userId, (err) => {
      if (err) throw err;
      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ message: 'User berhasil dihapus' }));
    });
  } else {
    
    const filePath = path.join(__dirname, 'public', reqUrl.pathname === '/' ? 'index.html' : reqUrl.pathname);
    const extname = path.extname(filePath);
    const contentType = getContentType(extname);

    fs.readFile(filePath, (err, content) => {
      if (err) {
        if (err.code === 'ENOENT') {
          
          res.writeHead(404, { 'Content-Type': 'text/html' });
          res.end('Not Found');
        } else {
          
          res.writeHead(500, { 'Content-Type': 'text/html' });
          res.end(`Server Error: ${err.code}`);
        }
      } else {
        
        res.writeHead(200, { 'Content-Type': contentType });
        res.end(content, 'utf-8');
      }
    });
  }
});


function getContentType(extname) {
  switch (extname) {
    case '.js':
      return 'text/javascript';
    case '.css':
      return 'text/css';
    case '.json':
      return 'application/json';
    case '.png':
      return 'image/png';
    case '.jpg':
      return 'image/jpg';
    case '.wav':
      return 'audio/wav';
    default:
      return 'text/html';
  }
}


const PORT = process.env.PORT || 3000;
server.listen(PORT, () => console.log(`Server berjalan pada port ${PORT}`));
