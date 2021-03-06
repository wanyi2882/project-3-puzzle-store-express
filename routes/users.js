const express = require("express");
const router = express.Router();

// Import in the User model
const { User } = require('../models');

// Import in forms
const { createRegistrationForm, bootstrapField, createLoginForm } = require('../forms');

// Import Middleware
const { checkIfAuthenticatedAdmin, checkIfAuthenticatedAdminAndManager } = require('../middlewares');

// Create Hash Password
const crypto = require('crypto');

const getHashedPassword = (password) => {
    const sha256 = crypto.createHash('sha256');
    const hash = sha256.update(password).digest('base64');
    return hash;
}

// Get route to display all users
router.get('/', [checkIfAuthenticatedAdmin], async function (req, res) {

    let users = await User.collection().fetch()

    res.render('users/index',{
        'users': users.toJSON()
    })
})

// Display user registration form
router.get('/register', (req, res) => {

    // Display the user registration form
    const registerForm = createRegistrationForm();

    res.render('users/register', {
        'registerForm': registerForm.toHTML(bootstrapField)
    })
})

// Process user registration form
router.post('/register', (req, res) => {

    // Fetch the user registration form
    const registerForm = createRegistrationForm();

    registerForm.handle(req, {
        'success': async (form) => {
            let user = new User({
                'username': form.data.username,
                'email': form.data.email,
                'password': getHashedPassword(form.data.password)
            })

            await user.save()
            req.flash('success_messages', "User Successfully created.")
            res.redirect("/users/login")
        },
        'error': (form) => {
            res.render('users/register', {
                'registerForm': form.toHTML(bootstrapField)
            })
        }
    })
})

// Create Login Page
router.get('/login', (req,res)=>{
    const loginForm = createLoginForm();

    res.render('users/login',{
        'loginForm': loginForm.toHTML(bootstrapField)
    })
})

// Process Login and compare password at Login
router.post('/login', (req, res) => {
    const loginForm = createLoginForm();

    loginForm.handle(req, {
        'success': async(form) => {
            // Fetch user by email
            let user = await User.where({
                'email': form.data.email
            }).fetch({
                'require': false
            })

            // If user exists, check if password matches
            if(user) {
                if((user.get('password') == getHashedPassword(form.data.password)) 
                && ((user.get('role_type') == 'owner') || (user.get('role_type') == 'manager'))
                ) {
                    // Proceed to login
                    req.session.user = {
                        'id': user.get('id'),
                        'email': user.get('email'),
                        'username': user.get('username'),
                        'role_type': user.get('role_type')
                    }

                    req.flash("success_messages", `Welcome back ${user.get('username')} !`)

                    res.redirect('/users/profile');
                }
                else {
                    // Login has failed when password mis match
                    req.flash('error_messages', 'Login failed')
                    res.redirect('/users/login')
                }
            }
            else {
                // Login has failed when user does not exist
                req.flash('error_messages', 'Login failed')
                res.redirect('/users/login')
            }
        },
        'error': (form) => {
            res.render('users/login', {
                'loginForm': form.toHTML(bootstrapField)
            })
        }
    })
})

// Display Profile page
router.get('/profile', [checkIfAuthenticatedAdminAndManager], (req, res) => {
    res.render('users/profile', {
        user: req.session.user
    })
})

// Logout of user
router.get('/logout', [checkIfAuthenticatedAdminAndManager], (req,res)=>{
    req.session.user = null;
    req.flash('success_messages', "Logged out successfully");
    res.redirect('/users/login');
    });

module.exports = router;