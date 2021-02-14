import {MigrationInterface, QueryRunner} from "typeorm";

export class CreateTag1613315734241 implements MigrationInterface {
    name = 'CreateTag1613315734241'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "tag" ("id" character varying(40) NOT NULL, "created_at" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP, "updated_at" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP, "name" character varying NOT NULL, CONSTRAINT "PK_8e4052373c579afc1471f526760" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "bookmark_tags_tag" ("bookmarkId" character varying(40) NOT NULL, "tagId" character varying(40) NOT NULL, CONSTRAINT "PK_539129113d866c7362582f169f5" PRIMARY KEY ("bookmarkId", "tagId"))`);
        await queryRunner.query(`CREATE INDEX "IDX_fd05f1f02b623081a13b09bd08" ON "bookmark_tags_tag" ("bookmarkId") `);
        await queryRunner.query(`CREATE INDEX "IDX_6d85acb3f76ca6db24eeef6d65" ON "bookmark_tags_tag" ("tagId") `);
        await queryRunner.query(`COMMENT ON COLUMN "refresh_token"."created_at" IS NULL`);
        await queryRunner.query(`COMMENT ON COLUMN "refresh_token"."updated_at" IS NULL`);
        await queryRunner.query(`COMMENT ON COLUMN "user"."created_at" IS NULL`);
        await queryRunner.query(`COMMENT ON COLUMN "user"."updated_at" IS NULL`);
        await queryRunner.query(`COMMENT ON COLUMN "bookmark"."created_at" IS NULL`);
        await queryRunner.query(`COMMENT ON COLUMN "bookmark"."updated_at" IS NULL`);
        await queryRunner.query(`COMMENT ON COLUMN "refresh_token"."created_at" IS NULL`);
        await queryRunner.query(`COMMENT ON COLUMN "refresh_token"."updated_at" IS NULL`);
        await queryRunner.query(`COMMENT ON COLUMN "user"."created_at" IS NULL`);
        await queryRunner.query(`COMMENT ON COLUMN "user"."updated_at" IS NULL`);
        await queryRunner.query(`COMMENT ON COLUMN "bookmark"."created_at" IS NULL`);
        await queryRunner.query(`COMMENT ON COLUMN "bookmark"."updated_at" IS NULL`);
        await queryRunner.query(`ALTER TABLE "bookmark_tags_tag" ADD CONSTRAINT "FK_fd05f1f02b623081a13b09bd082" FOREIGN KEY ("bookmarkId") REFERENCES "bookmark"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "bookmark_tags_tag" ADD CONSTRAINT "FK_6d85acb3f76ca6db24eeef6d656" FOREIGN KEY ("tagId") REFERENCES "tag"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "bookmark_tags_tag" DROP CONSTRAINT "FK_6d85acb3f76ca6db24eeef6d656"`);
        await queryRunner.query(`ALTER TABLE "bookmark_tags_tag" DROP CONSTRAINT "FK_fd05f1f02b623081a13b09bd082"`);
        await queryRunner.query(`COMMENT ON COLUMN "bookmark"."updated_at" IS NULL`);
        await queryRunner.query(`COMMENT ON COLUMN "bookmark"."created_at" IS NULL`);
        await queryRunner.query(`COMMENT ON COLUMN "user"."updated_at" IS NULL`);
        await queryRunner.query(`COMMENT ON COLUMN "user"."created_at" IS NULL`);
        await queryRunner.query(`COMMENT ON COLUMN "refresh_token"."updated_at" IS NULL`);
        await queryRunner.query(`COMMENT ON COLUMN "refresh_token"."created_at" IS NULL`);
        await queryRunner.query(`COMMENT ON COLUMN "bookmark"."updated_at" IS NULL`);
        await queryRunner.query(`COMMENT ON COLUMN "bookmark"."created_at" IS NULL`);
        await queryRunner.query(`COMMENT ON COLUMN "user"."updated_at" IS NULL`);
        await queryRunner.query(`COMMENT ON COLUMN "user"."created_at" IS NULL`);
        await queryRunner.query(`COMMENT ON COLUMN "refresh_token"."updated_at" IS NULL`);
        await queryRunner.query(`COMMENT ON COLUMN "refresh_token"."created_at" IS NULL`);
        await queryRunner.query(`DROP INDEX "IDX_6d85acb3f76ca6db24eeef6d65"`);
        await queryRunner.query(`DROP INDEX "IDX_fd05f1f02b623081a13b09bd08"`);
        await queryRunner.query(`DROP TABLE "bookmark_tags_tag"`);
        await queryRunner.query(`DROP TABLE "tag"`);
    }

}
