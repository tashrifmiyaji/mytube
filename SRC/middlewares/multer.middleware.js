// external inputs
import multer from "multer";

// faster sava the file in local machine then upload
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, "./public/temp");
    },
    filename: function (req, file, cb) {
        cb(null, file.originalname);
    },
});

const upload = multer({
    storage,
});

// file upload without save local machine
const storage2 = multer.memoryStorage();
const upload2 = multer({ storage2 });

// avatar And cover Image upload config
const avatarAndCoverImageUpload = upload.fields([
    {
        name: "avatar",
        maxCount: 1,
    },
    {
        name: "coverImage",
        maxCount: 1,
    },
]);

// avatar update config
const avatarUpdate = upload.single("avatar");

// coverImage upload config
const coverImageUpdate = upload.single("coverImage");

// video upload config
const uploadAVideo = upload2.single("videoFile");

// export
export { avatarAndCoverImageUpload, avatarUpdate, coverImageUpdate, uploadAVideo };
