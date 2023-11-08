const Users = require('../model/users'),
      bcrypt = require('bcryptjs'),
      jwt = require('jsonwebtoken'),
      verifyToken = require('../middleware/auth'),
      asyncHandler = require('express-async-handler'),
      Joi = require('joi'),
      Op = require('sequelize').Op;

//To create user
const createUser = asyncHandler(async (req, res) => {
    const schema = Joi.object({
        firstName: Joi.string().required().messages({
            'string.empty': 'First Name is required',
            'any.required': 'First Name is required'
          }),
        lastName: Joi.string().required().messages({
            'string.empty': 'Last Name is required',
            'any.required': 'Last Name is required'
          }),
        age: Joi.number().min(18).max(99).required().messages({
            'number.base': 'Age must be a number',
            'number.min': 'You must be at least 18 years old',
            'number.max': 'You cannot be older than 99 years'
          }),
        phoneNumber: Joi.string().length(10).pattern(/[6-9]{1}[0-9]{9}/).required(),
        password: Joi.string().required(),
        email: Joi.string().email().required().messages({
            'string.email': 'Invalid email format',
            'string.empty': 'Email is required',
            'any.required': 'Email is required'
          }),
        role: Joi.number().max(2).min(1),
        image: Joi.string()
      });

    const { error } = schema.validate(req.body);
    if (error) {
        res.status(400)
        throw new Error(error.details[0].message)
    }

    if(req.file != null){
        if((req.file.mimetype != "image/jpeg") && (req.file.mimetype != "image/png" ) && (req.file.mimetype != "image/jpg")){
            res.status(400)
            throw new Error("Image file must be png/jpeg/jpg")
        }
    }
    
    const email = req.body.email.toLowerCase();
    const oldUser = await Users.findOne({where: {email: email}});
    const userRole = req.body.role != undefined ? req.body.role : 2

    if(oldUser) {
        console.log(`User with email ${email} already exist`);
        res.status(400)
        throw new Error("User already exist")
    }

    encryptedPassword = await bcrypt.hash(req.body.password, 10);

    const user = await Users.create({
        firstName: req.body.firstName,
        lastName: req.body.lastName,
        email: email,
        password: encryptedPassword,
        phoneNumber: req.body.phoneNumber,
        age :req.body.age,
        role: userRole,
        image: req.file != undefined ? req.file.path : null
    });

    const token = jwt.sign(
        {user_id: user.id, email, userRole},
        process.env.JWT_SECRET_KEY,
        {
            expiresIn: "1h",
        }
    )

    user.token = token;
    console.log("User created succesfully")
    res.status(201).send(user);
})

//Login user
const userlogin = asyncHandler( async(req, res) => {
 
    const schema = Joi.object({
        password: Joi.string().required(),
        email: Joi.string().email().required().messages({
            'string.email': 'Invalid email format',
            'string.empty': 'Email is required',
            'any.required': 'Email is required'
          }),
    });

    const { error } = schema.validate(req.body);
    if (error) {
        res.status(400)
        throw new Error(error.details[0].message)
    }

    const email = req.body.email.toLowerCase();
    const validUser = await Users.findOne({where: {email: email}});
    if(!validUser){
        console.log(`User with email ${email }does not exist`)
        res.status(400)
        throw new Error("User does not exist")
    }

    if(validUser && bcrypt.compareSync(req.body.password, validUser.password)){
        const role = validUser.role;
        const token = jwt.sign(
            {user_id: validUser.id, role, email},
            process.env.JWT_SECRET_KEY,
            {
                expiresIn: "1h",
            }
        )

        validUser.token = token;
        console.log("User logged in succesfully")
        res.status(200).send(validUser);
    }
    else {
        console.log("Invalid credentails")
        res.status(400)
        throw new Error("Invalid credentials")
    }
})

//To get all users when role is admin
const getAllUsers = asyncHandler(async(req, res) => {
    await Users.findAll({where: {isActive: true, id: { [Op.ne]: req.user.user_id}}})
    .then(users => {
        res.status(200).send(users)
    })
    .catch((err) => {
        res.semd(400);
        throw new Error("Invalid request")
    })
})

//To get user with Id
const getUserById = asyncHandler(async(req, res) => {
    let userId = parseInt(req.params.userId);

    if((req.user.user_id != userId) && (req.user.role != 1)){
        res.status(401)
        throw new Error("You are not authroized to view this page")
    }

    await Users.findByPk(userId, {where: {isActive: true}})
    .then(user => {
        if(user === null){
            res.status(400)
            throw new Error(`User not found with Id ${userId}`)
        }
        res.status(200).send(user)
    })
    .catch((err) => {
        res.status(400)
        throw new Error(`User not found with Id ${userId}`)
    })
})

//Update user by ID
const updateUserById = asyncHandler(async(req, res) =>{
    const userId = parseInt(req.params.userId);
    if((req.user.user_id != userId) && (req.user.role != 1)){
        res.status(401)
        throw new Error("You are not authroized to view this page")
    }

    const schema = Joi.object({
        firstName: Joi.string().required().messages({
            'string.empty': 'First Name is required',
            'any.required': 'First Name is required'
          }),
        lastName: Joi.string().required().messages({
            'string.empty': 'Last Name is required',
            'any.required': 'Last Name is required'
          }),
        age: Joi.number().min(18).max(99).required().messages({
            'number.base': 'Age must be a number',
            'number.min': 'You must be at least 18 years old',
            'number.max': 'You cannot be older than 99 years'
          }),
        phoneNumber: Joi.string().length(10).pattern(/[6-9]{1}[0-9]{9}/).required(),
        password: Joi.string().required(),
        email: Joi.string().email().required().messages({
            'string.email': 'Invalid email format',
            'string.empty': 'Email is required',
            'any.required': 'Email is required'
          }),
        role: Joi.number().max(2).min(1),
        image: Joi.string()
    });

    const { error } = schema.validate(req.body);
    if (error) {
        res.status(400)
        throw new Error(error.details[0].message)
    }

    const email = req.body.email.toLowerCase();
    const password = req.body.password;
    encryptedPassword = await bcrypt.hash(password, 10);

    if(req.file != null){
        if((req.file.mimetype != "image/jpeg") && (req.file.mimetype != "image/png" ) && (req.file.mimetype != "image/jpg")){
            res.status(400)
            throw new Error("Image file must be png/jpeg/jpg")
        }
    }

    const existingUser = await Users.findOne({where : {email: email}});

    await Users.findByPk(userId, {where: {isActive: true}})
    .then(user => {
        if(!user){
            console.log("User not found")
            res.status(404)
            throw new Error(`User not found with id ${userId}`)
        }

        if((!existingUser) || (existingUser && (existingUser.id == user.id))){
            user.firstName = req.body.firstName;
            user.lastName= req.body.lastName;
            user.email= email;
            user.password= encryptedPassword;
            user.phoneNumber= req.body.phoneNumber;
            user.age =req.body.age;
            user.role= req.body.role !=undefined ? req.body.role : user.role;
            user.image= req.file != undefined ? req.file.path : user.image
            return user.save();
        } else{
            res.status(400).send({
                "code": 400,
                "msg": `The Email ${email} is already in use. Please use a valid email address`})
        }
    })
    .then(updatedUser => {
        console.log("User updated")
        res.status(200).send(updatedUser)
    })
    .catch(err =>{
        res.status(400)
        throw new Error(`User not found with id ${userId}`)
    })
})

//Logical delete user by ID
const deactivateUserById = asyncHandler(async(req, res) => {
    let userId = parseInt(req.params.userId);

    userObj = {
        isActive: req.body.isActive
    }

    if((req.user.user_id != userId) && (req.user.role != 1)){
        res.status(401)
        throw new Error("You are not authroized to view this page")
    }

    await Users.update(userObj, {where: {isActive: true, id: userId}})
    .then(user => {
        console.log("User status changed from active to inactive")
        res.status(200).send({
            "code": "200",
            "msg": `User with ID ${userId} deactivated successfully`
        });
    })
    .catch((err) => {
        res.status(400)
        throw new Error(`User not found with Id ${userId}`)
    })
})

//Delete user from DB by ID
const deleteUserById = asyncHandler(async(req, res) => {
    let userId = parseInt(req.params.userId);

    if((req.user.user_id != userId) && (req.user.role != 1)){
        res.status(401)
        throw new Error("You are not authroized to view this page")
    }
    
    await Users.destroy({where: {id: userId}})
    .then(data => {
        res.status(200).send({
            "code": "200",
            "msg": `User with ID ${userId} deleted successfully`
        });
    })
    .catch(err => {
        res.status(404)
        throw new Error(`User not found with ID ${userId}`)
    })
})

module.exports = {createUser, userlogin, getAllUsers, getUserById, deactivateUserById, deleteUserById, updateUserById}