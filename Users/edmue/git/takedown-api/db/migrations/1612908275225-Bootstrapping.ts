import {MigrationInterface, QueryRunner} from "typeorm";

export class Bootstrapping1612908275225 implements MigrationInterface {
    name = 'Bootstrapping1612908275225'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "refresh_token" ("id" character varying(40) NOT NULL, "created_at" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP, "updated_at" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP, "userId" character varying NOT NULL, "isRevoked" boolean NOT NULL, "expiresAt" TIMESTAMP NOT NULL, CONSTRAINT "PK_b575dd3c21fb0831013c909e7fe" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TYPE "user_provider_enum" AS ENUM('google')`);
        await queryRunner.query(`CREATE TABLE "user" ("id" character varying(40) NOT NULL, "created_at" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP, "updated_at" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP, "email" character varying NOT NULL, "provider" "user_provider_enum" NOT NULL, "thirdPartyId" character varying NOT NULL, CONSTRAINT "PK_cace4a159ff9f2512dd42373760" PRIMARY KEY ("id"))`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DROP TABLE "user"`);
        await queryRunner.query(`DROP TYPE "user_provider_enum"`);
        await queryRunner.query(`DROP TABLE "refresh_token"`);
    }

}
