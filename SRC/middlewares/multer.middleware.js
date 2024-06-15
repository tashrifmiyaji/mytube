// external inputs
import multer from "multer";

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, "./public/temp");
    },
    filename: function (req, file, cb) {
        cb(null, file.originalname);
    },
});

export const upload = multer({
    storage,
});

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

// avatar update
const avatarUpdate = upload.single("avatar");

// avatar update
const coverImageUpdate = upload.single("coverImage");

// export
export { avatarAndCoverImageUpload, avatarUpdate, coverImageUpdate };
