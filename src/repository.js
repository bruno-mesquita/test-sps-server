let nextId = 2;

const users = [
  {
    id: 1,
    name: "admin",
    email: "admin@spsgroup.com.br",
    type: "admin",
    password: "1234",
  },
];

const findAll = () => users;

const findByEmail = (email) => users.find((u) => u.email === email);

const findById = (id) => users.find((u) => u.id === id);

const create = ({ name, email, type, password }) => {
  const user = { id: nextId++, name, email, type, password };
  users.push(user);
  return user;
};

const update = (id, data) => {
  const index = users.findIndex((u) => u.id === id);
  if (index === -1) return null;
  users[index] = { ...users[index], ...data, id };
  return users[index];
};

const remove = (id) => {
  const index = users.findIndex((u) => u.id === id);
  if (index === -1) return false;
  users.splice(index, 1);
  return true;
};

module.exports = { findAll, findByEmail, findById, create, update, remove };
