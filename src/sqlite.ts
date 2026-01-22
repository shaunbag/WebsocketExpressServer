import bcrypt from 'bcrypt'
import Database from 'better-sqlite3'
export const db = new Database('db.sqlite')

// create the users table here 
db.prepare(`
    CREATE TABLE IF NOT EXISTS users ( 
    id INTEGER PRIMARY KEY AUTOINCREMENT, 
    name TEXT NOT NULL UNIQUE, 
    password_hash TEXT NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
)`).run()

// insert query for new users
const createUser = db.prepare(`
    INSERT INTO users (name, password_hash)
    VALUES (?,?)
    `)

// get the user id and password_hash by their name
const getUser = db.prepare<
    [string],
    { id: number; password_hash: string }
>(`
  SELECT id, password_hash
  FROM users
  WHERE name = ?
`);

const users = db.prepare('SELECT id, name, created_at FROM users').all();
console.log('Users:');
console.table(users); // pretty table in terminal

/** Functions callable by server.ts  */

export async function registerUser(name: string, password: string) {
    const hash = await bcrypt.hash(password, 12)
    try {
        createUser.run(name, hash)
        return true
    } catch (err: any) {
        if (err.code === 'SQLITE_CONSTRAINT_UNIQUE') {
            return false
        }
    }
}

export async function loginUser(name: string, password: string) {
    console.log("Name: " + name + ", Password: " + password)
    const user = getUser.get(name)
    if (!user) return false

    const ok = await bcrypt.compare(password, user.password_hash)
    console.log(ok)
    return ok ? user.id : false
}


