import passport from "passport";

export const googleAuth = passport.authenticate("google", {
  scope: ["profile", "email"],
});

export const googleCallback = (req, res, next) => {
  passport.authenticate("google", (err, user) => {
    if (err) {
      console.log("err", err);
      return res
        .status(500)
        .json({ message: "Authentication failed", error: err });
    }

    if (!user) {
      return res.status(401).json({ message: "User not found" });
    }

    req.logIn(user, (err) => {
      if (err) {
        return res.status(500).json({ message: "Login failed", error: err });
      }
      console.log(req.session);
      res.status(200).json({
        message: "Logged in successfully",
        user,
        session: req.session,
      });
    });
  })(req, res, next);
};

export const logout = (req, res) => {
  req.logout((err) => {
    if (err) {
      return res.status(500).json({ message: "Logout failed", error: err });
    }
    res.status(200).json({ message: "Logged out successfully" });
  });
};
