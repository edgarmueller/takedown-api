import {MigrationInterface, QueryRunner} from "typeorm";

export class CreateBookmark1613162736080 implements MigrationInterface {
    name = 'CreateBookmark1613162736080'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "bookmark" ("id" character varying(40) NOT NULL, "created_at" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP, "updated_at" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP, "url" character varying NOT NULL, "title" character varying NOT NULL, "thumbnail_id" character varying NOT NULL, "deleted" boolean NOT NULL, "user_id" character varying NOT NULL, CONSTRAINT "PK_b7fbf4a865ba38a590bb9239814" PRIMARY KEY ("id"))`);
        await queryRunner.query(`COMMENT ON COLUMN "refresh_token"."created_at" IS NULL`);
        await queryRunner.query(`COMMENT ON COLUMN "refresh_token"."updated_at" IS NULL`);
        await queryRunner.query(`COMMENT ON COLUMN "user"."created_at" IS NULL`);
        await queryRunner.query(`COMMENT ON COLUMN "user"."updated_at" IS NULL`);
        await queryRunner.query(`COMMENT ON COLUMN "refresh_token"."created_at" IS NULL`);
        await queryRunner.query(`COMMENT ON COLUMN "refresh_token"."updated_at" IS NULL`);
        await queryRunner.query(`COMMENT ON COLUMN "user"."created_at" IS NULL`);
        await queryRunner.query(`COMMENT ON COLUMN "user"."updated_at" IS NULL`);
        await queryRunner.query(`ALTER TABLE "bookmark" ADD CONSTRAINT "FK_8f1a143c6ba8bba0e2a4f41e0d0" FOREIGN KEY ("user_id") REFERENCES "user"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "bookmark" DROP CONSTRAINT "FK_8f1a143c6ba8bba0e2a4f41e0d0"`);
        await queryRunner.query(`COMMENT ON COLUMN "user"."updated_at" IS NULL`);
        await queryRunner.query(`COMMENT ON COLUMN "user"."created_at" IS NULL`);
        await queryRunner.query(`COMMENT ON COLUMN "refresh_token"."updated_at" IS NULL`);
        await queryRunner.query(`COMMENT ON COLUMN "refresh_token"."created_at" IS NULL`);
        await queryRunner.query(`COMMENT ON COLUMN "user"."updated_at" IS NULL`);
        await queryRunner.query(`COMMENT ON COLUMN "user"."created_at" IS NULL`);
        await queryRunner.query(`COMMENT ON COLUMN "refresh_token"."updated_at" IS NULL`);
        await queryRunner.query(`COMMENT ON COLUMN "refresh_token"."created_at" IS NULL`);
        await queryRunner.query(`DROP TABLE "bookmark"`);
    }

}
