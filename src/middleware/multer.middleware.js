import multer from "multer";

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    //cb call back
    cb(null, "./public/temp"); // path of local storage
  },
  filename: function (req, file, cb) {
    cb(null, file.originalname); // not a good practice as same name multipal files can come
  },
});

export const upload = multer({ storage });
