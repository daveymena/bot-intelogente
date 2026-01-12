
import { db } from '../src/lib/db';

async function check() {
    const users = await db.user.findMany({
        select: { id: true, email: true }
    });
    console.log(JSON.stringify(users, null, 2));
}

check();
