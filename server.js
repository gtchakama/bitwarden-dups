const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { parse } = require('csv-parse');
const { stringify } = require('csv-stringify');
const session = require('express-session');

const app = express();
const port = 3000;

// Configure multer for handling file uploads
const upload = multer({
  dest: 'uploads/',
  fileFilter: (req, file, cb) => {
    if (file.mimetype === 'text/csv') {
      cb(null, true);
    } else {
      cb(new Error('Only CSV files are allowed'));
    }
  }
});

// Set up session middleware
app.use(session({
  secret: '#jTkMOp85Dr7Y8g890',
  resave: false,
  saveUninitialized: true
}));

// Set up EJS as the view engine
app.set('view engine', 'ejs');
app.use(express.json());
app.use(express.static('public'));

// Create uploads directory if it doesn't exist
if (!fs.existsSync('uploads')) {
  fs.mkdirSync('uploads');
}

// Routes
app.get('/', (req, res) => {
  res.render('index', { error: req.session.error });
  req.session.error = null;
});

app.post('/upload', upload.single('csvFile'), async (req, res) => {
  if (!req.file) {
    req.session.error = 'Please upload a CSV file';
    return res.redirect('/');
  }

  try {
    const records = [];
    const parser = fs.createReadStream(req.file.path)
      .pipe(parse({
        columns: true,
        skip_empty_lines: true
      }));

    for await (const record of parser) {
      records.push(record);
    }

    // Find duplicates
    const duplicates = findDuplicates(records);
    
    // Store data in session
    req.session.records = records;
    req.session.duplicates = duplicates;
    req.session.originalFilename = req.file.originalname;

    // Clean up uploaded file
    fs.unlinkSync(req.file.path);

    res.redirect('/review');
  } catch (error) {
    req.session.error = 'Error processing CSV file';
    res.redirect('/');
  }
});

app.get('/review', (req, res) => {
  if (!req.session.records) {
    return res.redirect('/');
  }
  res.render('review', {
    records: req.session.records,
    duplicates: req.session.duplicates
  });
});

app.post('/remove-duplicate', (req, res) => {
  const { indices } = req.body;
  if (req.session.records && Array.isArray(indices)) {
    // Sort indices in descending order to avoid shifting issues when removing
    indices.sort((a, b) => b - a);
    indices.forEach(index => {
      if (index >= 0 && index < req.session.records.length) {
        req.session.records.splice(index, 1);
      }
    });
    // Recalculate duplicates
    req.session.duplicates = findDuplicates(req.session.records);
  }
  res.json({ success: true });
});

app.get('/download', (req, res) => {
  if (!req.session.records) {
    return res.redirect('/');
  }

  stringify(req.session.records, {
    header: true
  }, (err, output) => {
    if (err) {
      req.session.error = 'Error generating CSV file';
      return res.redirect('/');
    }

    const filename = 'cleaned-' + (req.session.originalFilename || 'export.csv');
    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
    res.send(output);
  });
});

function findDuplicates(records) {
  const duplicates = new Map();
  
  records.forEach((record, index) => {
    const key = `${record.login_uri}-${record.login_username}-${record.login_password}`;
    if (!duplicates.has(key)) {
      duplicates.set(key, []);
    }
    duplicates.get(key).push(index);
  });

  return Array.from(duplicates.entries())
    .filter(([_, indices]) => indices.length > 1)
    .map(([key, indices]) => ({
      key,
      indices,
      record: records[indices[0]]
    }));
}

app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
}); 