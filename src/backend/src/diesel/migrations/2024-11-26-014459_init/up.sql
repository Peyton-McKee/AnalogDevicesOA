-- Your SQL goes here
CREATE TABLE "producers"(
	"id" UUID NOT NULL PRIMARY KEY DEFAULT gen_random_uuid(),
	"name" TEXT NOT NULL,
	"number_messages" INTEGER NOT NULL,
	"average_send_delay" INTEGER NOT NULL,
	"failure_rate" INTEGER NOT NULL,
	"num_senders" INTEGER,
	"status" TEXT NOT NULL
);

CREATE TABLE "messages"(
	"id" UUID NOT NULL PRIMARY KEY DEFAULT gen_random_uuid(),
	"message_body" TEXT NOT NULL,
	"sent" BOOLEAN NOT NULL DEFAULT false,
	"failed" BOOLEAN NOT NULL DEFAULT false,
	"time_took" INTEGER,
	"produced_by" UUID NOT NULL REFERENCES producers(id)
);
