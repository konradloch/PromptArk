
db = db.getSiblingDB('prompt-analyzer')

db.createUser({
  user: 'promptuser',
  pwd: 'promptpwd',
  roles: [{ role: 'readWrite', db: 'prompt-analyzer' }],
});