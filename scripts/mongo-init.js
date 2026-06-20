db = db.getSiblingDB("sps");

db.createCollection("users");

db.users.createIndex({ email: 1 }, { unique: true });
db.users.createIndex({ id: 1 }, { unique: true });

const adminExists = db.users.findOne({ email: "admin@spsgroup.com.br" });
if (!adminExists) {
  db.users.insertOne({
    id: "admin-uuid",
    name: "admin",
    email: "admin@spsgroup.com.br",
    type: "admin",
    password: "$2b$10$L91RXxJ4mifFjcLJjK/veO52EF.hvX9bwK/cLsZ4wUjElnf.hmmOK",
  });
}
