const express = require("express");
const router = express.Router();
const categoryController = require("../controllers/categoryController");
const itemController = require("../controllers/itemController");
const multer = require("multer");
const multerStorage = multer.diskStorage({
    destination: (req, file, cb) => {
      cb(null, "public/images");
    },
    filename: (req, file, cb) => {
      const ext = file.mimetype.split("/")[1];
      cb(null, `${req.body.name}.${ext}`);
    },
});

const multerFilter = (req, file, cb) => {
    if (file.mimetype.split("/")[1] === "png") {
        cb(null, true);
    } else {
        cb(new Error("Not a PNG File!!"), false);
    }
};  
const upload = multer({
    storage: multerStorage,
    fileFilter: multerFilter
});

router.get("/", categoryController.menu_get);

router.get("/create", categoryController.category_create_get);

router.post("/create", categoryController.category_create_post);

router.get("/:category/create", itemController.item_create_get);

router.post("/:category/create", upload.single("file"), itemController.item_create_post);

router.get("/:category/update", categoryController.category_update_get);

router.post("/:category/update", categoryController.category_update_post);

router.get("/:category/delete", categoryController.category_delete_get);

router.post("/:category/delete", categoryController.category_delete_post);

router.get("/:category", itemController.items_get);

router.get("/:category/:item", itemController.item_get);

router.get("/:category/:item/update", itemController.item_update_get);

router.post("/:category/:item/update", upload.single("file"), itemController.item_update_post);

router.get("/:category/:item/delete", itemController.item_delete_get);

router.post("/:category/:item/delete", itemController.item_delete_post);

module.exports = router;