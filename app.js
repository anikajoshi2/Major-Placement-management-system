const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const path = require('path');
const ejs = require('ejs');

const multer = require('multer');

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
      cb(null, 'public/uploads/') // specify the directory where you want to save the files for field 1
    },
    filename: function (req, file, cb) {
        const extension = file.originalname.split('.').pop(); // get file extension
        cb(null, file.fieldname + '-' + Date.now() + '.' + extension)
      }
  })
  
  const upload = multer({ storage: storage })

// const upload = multer({ dest: 'uploads/', debug: true});

const app = express();

// Connect to MongoDB
mongoose.connect('mongodb+srv://jamlealankar:root@cms.ge45fza.mongodb.net/?retryWrites=true&w=majority', { useNewUrlParser: true });
const db = mongoose.connection;
db.on('error', console.error.bind(console, 'MongoDB connection error:'));
db.once('open', () => {
  console.log('MongoDB connected!');
});

app.set('view engine', 'ejs');
// Set views directory
app.set('views', path.join(__dirname, 'public'));
app.use(express.static('public'));

//Student Schema
const studentSchema = new mongoose.Schema({
    name: String,
    age: Number,
    gender: String,
    enroll: String,
    photo: String,
    offerLetter: String,
    placed: String
});

// Student model
const Student = mongoose.model('Student', studentSchema);

// Middleware to parse request body
app.use(bodyParser.json());

// CRUD operations
// Create a new student
app.post('/students', upload.fields([
    { name: 'photo', maxCount: 1 },
    { name: 'offerLetter', maxCount: 1 }
  ]), async (req, res) => {
    
    try {
        const { name, age, gender, enroll } = req.body;
        const photo = req.files['photo'][0] ? req.files['photo'][0].filename: null;
        const offerLetter = req.files['offerLetter'][0] ? req.files['offerLetter'][0].filename : null;
        const newStudent = await Student.create({ name, age, gender, enroll, photo, offerLetter });
  
        res.redirect('/students'); // redirect to the students page
        // res.status(201).json({ success: true, data: newStudent });
    } catch (error) {  
      console.error(error);
      res.status(500).json({ success: false, message: 'Server error' });
    }
  });

//   app.post('/students',upload.fields([
//     { name: 'photo', maxCount: 1 },
//     { name: 'offerLetter', maxCount: 1 }
//   ]), async (req, res) => {
    
//         // const { name, age, gender, enroll } = req.body;
//         const photo = req.files['photo'][0];
//         const offerLetter = req.files['offerLetter'][0];
//         console.log(photo , offerLetter)
//         console.log("----");
//         console.log(req.body);
//         // const photo = req.file.photo.filename;
//         // const offerLetter = req.file.offerLetter.filename;
//         // const newStudent = await Student.create({ name, age, gender, enroll, photo, offerLetter });
  
//     //   res.status(201).json({ success: true, data: newStudent });
//     res.send("done !!");
//     });


  
  // Define the routes for the API
  // app.get('/students', async (req, res) => {
      //     const students = await Student.find();
      //     res.render('students', { students });
      //   });
      
app.get('/create-student' , async(req ,res) =>{
        res.render('create-student');
});
    
// Get all students
app.get('/students', async (req, res) => {
    try {
      const students = await Student.find();
      res.render('show-students', { students });
    //   res.status(200).json({ success: true, data: students });
    } catch (error) {
      console.error(error);
      res.status(500).json({ success: false, message: 'Server error' });
    }
  });
  

// Get a single student
app.get('/students/:id', async (req, res) => {
    try {
      const student = await Student.findById(req.params.id);
  
      if (!student) {
        return res.status(404).json({ success: false, message: 'Student not found' });
      }
  
      res.status(200).json({ success: true, data: student });
    } catch (error) {
      console.error(error);
      res.status(500).json({ success: false, message: 'Server error' });
    }
  });
  

// Update a student
app.put('/students/:id',upload.fields([
    { name: 'photo', maxCount: 1 },
    { name: 'offerLetter', maxCount: 1 }
  ]), async (req, res) => {
    try {
      const { name, age, gender, enroll } = req.body;
      const photo = req.file ? req.file.filename : null;
      const offerLetter = req.file ? req.file.filename : null;
  
      const updatedStudent = await Student.findByIdAndUpdate(req.params.id, { name, age, gender, enroll, photo, offerLetter }, { new: true });
  
      if (!updatedStudent) {
        return res.status(404).json({ success: false, message: 'Student not found' });
      }
  
      res.status(200).json({ success: true, data: updatedStudent });
    } catch (error) {
      console.error(error);
      res.status(500).json({ success: false, message: 'Server error' });
    }
  });
  

// Delete a student
app.delete('/students/:id', async (req, res) => {
  try {
    const student = await Student.findByIdAndDelete(req.params.id);
    if (!student) {
      return res.status(404).send('Student not found');
    }
    res.send(student);
  } catch (err) {
    res.status(400).send(err);
  }
});

// Start the server
app.listen(3000, () => {
  console.log('Server started on port 3000');
});
