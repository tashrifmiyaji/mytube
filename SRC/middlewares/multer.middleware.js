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

// avatar upload config
const avatarUpload = upload.fields([
    {
        name: "avatar",
        maxCount: 1
    },
    {
        name: "coverAvatar",
        maxCount: 1
    }
])

// export
export { avatarUpload };
