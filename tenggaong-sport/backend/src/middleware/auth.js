import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET || "tenggaong-secret-key-2024";

export function generateToken(user) {
  return jwt.sign(
    { id: user.id, email: user.email, role: user.role, name: user.name, managed_by: user.managed_by },
    JWT_SECRET,
    { expiresIn: "7d" }
  );
}

export function authMiddleware(roles = []) {
  return (req, res, next) => {
    const header = req.headers.authorization;
    let token = header?.startsWith("Bearer ") ? header.slice(7) : req.query.token;
    if (!token)
      return res.status(401).json({ error: "Token tidak ditemukan" });

    try {
      const decoded = jwt.verify(token, JWT_SECRET);
      req.user = decoded;
      if (roles.length && !roles.includes(decoded.role) && decoded.role !== "superadmin")
        return res.status(403).json({ error: "Akses ditolak" });
      next();
    } catch {
      return res.status(401).json({ error: "Token tidak valid" });
    }
  };
}
