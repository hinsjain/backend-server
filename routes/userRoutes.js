const express = require('express');
const router = express.Router();
const { createUser, userlogin, getAllUsers, getUserById, deactivateUserById, deleteUserById, updateUserById } = require('../controller/userController');
const uploadFile = require('../middleware/upload');
const {verifyToken, verifyRole} = require('../middleware/auth');

router.post("/users/register", uploadFile.single('image'), createUser);

router.post("/users/login", userlogin);

router.get("/users", verifyToken, verifyRole, getAllUsers)

router.get("/users/:userId", verifyToken, getUserById)

router.put("/users/:userId", verifyToken, updateUserById)

router.put("/users/deactivate/:userId", verifyToken, deactivateUserById)

router.delete("/users/:userId", verifyToken, deleteUserById)

module.exports = router;