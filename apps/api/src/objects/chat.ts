import { drizzle, type DrizzleSqliteDODatabase } from 'drizzle-orm/durable-sqlite';
import { DurableObject } from 'cloudflare:workers'
// import { migrate } from 'drizzle-orm/durable-sqlite/migrator';
// import migrations from '../../drizzle/migrations'; // TODO
import { user as userTable } from '@/db/schema';
export class ChatDurableObject extends DurableObject<Cloudflare.Env> {
	storage: DurableObjectStorage;
	// biome-ignore lint/suspicious/noExplicitAny: <explanation>
	db: DrizzleSqliteDODatabase<any>;

	constructor(ctx: DurableObjectState, env: Cloudflare.Env) {
		super(ctx, env);
		this.storage = ctx.storage;
		this.db = drizzle(this.storage, { logger: false });

		// Make sure all migrations complete before accepting queries.
		// Otherwise you will need to run `this.migrate()` in any function
		// that accesses the Drizzle database `this.db`.
		// ctx.blockConcurrencyWhile(async () => {
		// 	await this._migrate();
		// }); // TODO: Uncomment when migrations are ready
	}

	async insertAndList(user: typeof userTable.$inferInsert) {
		await this.insert(user);
		return this.select();
	}

	async insert(user: typeof userTable.$inferInsert) {
		await this.db.insert(userTable).values(user);
	}

	async select() {
		return this.db.select().from(userTable);
	}

	// async _migrate() {
	// 	migrate(this.db, migrations);
	// }
}
