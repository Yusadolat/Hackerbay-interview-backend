const JwtStrategy = require('passport-jwt').Strategy;
const ExtractJwt = require('passport-jwt').ExtractJwt;

let opts = {};

// Where to look for the token
opts.jwtFromRequest = ExtractJwt.fromAuthHeaderAsBearerToken();
// Secret key
opts.secretOrKey = process.env.SECRET;

// Export strategy
module.exports = passport => {
	passport.use(new JwtStrategy(opts, (jwt_payload, done) => {
		User.findById(jwt_payload.id, (err, user) => {
			if (err) return done(err, false);
			if (user) return done(null, user);
			return done(null, false);
		});
	}));
}