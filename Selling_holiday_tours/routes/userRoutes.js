const express = require('express');
const userController = require('./../controllers/userController');
const authController = require('./../controllers/authController');

const router = express.Router();

//router.route('/signup').post(authController.signUp);
router.post('/signup', authController.signUp);
router.post('/login', authController.login);

//As you don't remember your password, you are outside the system.
router.post('/forgotPassword', authController.forgotPassword);
router.patch('/resetPassword/:token', authController.resetPassword);
router.patch('/updatePassword', authController.protect, authController.updatePassword);
router.patch('/updateMe', authController.protect, authController.updateMe);

router.route('/')
    .get(userController.getAllUsers)
    .post(userController.createNewUser);

router.route('/:id')
    .get(userController.getUser)
    .patch(userController.updateUser)
    .delete(userController.deleteUser);

module.exports = router;
