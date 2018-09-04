const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const passport = require('passport');
const jsonpatch = require('jsonpatch');
const Jimp = require('jimp');

const router = express.Router();
const User = require('../db/User');


router.post('/register', (req, res) => {
	let newUser = {
		username: req.body.username,
		password: req.body.password
	}

	User.findOne({
			username: newUser.username
		})
		.then(user => {
			if (user) return res.status(400).json({
				msg: 'Username already exists'
			});

			bcrypt.genSalt(10, (err, salt) => {
				bcrypt.hash(newUser.password, salt, (err, hash) => {
					if (err) return res.status(400).send(err);
					newUser.password = hash;

					new User(newUser).save()
						.then(user => res.json(user))
				})
			})
		})
		.catch(err => res.status(400).send(err));
});

//Login Route
router.post('/login', (req, res) => {
	User.findOne({
			username: req.body.username
		})
		.then(user => {
			if (!user) return res.status(404).json({
				msg: 'Username not found'
			});

			bcrypt.compare(req.body.password, user.password)
				.then(isMatch => {
					if (isMatch) {
						const payload = {
							id: user.id,
							username: user.username
						}

						jwt.sign(payload,
							process.env.SECRET, {
								expiresIn: '3h'
							},
							(err, token) => {
								return res.json({
									success: true,
									token: `Bearer ${token}`
								})
							})
					} else {
						return res.status(400).json({
							msg: 'Invalid password'
						})
					}
				})
		})
		.catch(err => res.status(400).send(err));

})

//JSONPatch route
router.patch('/jsonpatch',
	passport.authenticate('jwt', {
		session: false
	}),
	(req, res) => {
		let body = req.body.json;
		let patch = req.body.patch;

		try {
			let patchedDoc = jsonpatch.apply_patch(body, patch);
			res.send(patchedDoc);
		} catch (err) {
			res.status(400).json({
				msg: 'Bad request'
			});
		}
	})

//Thumbnail route
router.post('/thumbnail', passport.authenticate('jwt', {
		session: false
	}),
	(req, res) => {
		Jimp.read(req.body.url)
			.then(image => {
				return image
					.resize(50, 50)
					.quality(50)
					.write('thumbnail.jpg')

			})
			.then(() => res.json({
				msg: 'Thumbnail successfully created'
			}))
			.catch(err => res.status(400).send(err))
	})


module.exports = router;