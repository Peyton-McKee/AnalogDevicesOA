-- Your SQL goes here
CREATE TABLE "producer"(
	"id" UUID NOT NULL PRIMARY KEY DEFAULT gen_random_uuid(),
	"name" TEXT NOT NULL,
	"number_messages" INTEGER NOT NULL,
	"average_send_delay" INTEGER NOT NULL,
	"failure_rate" INTEGER NOT NULL,
	"num_senders" INTEGER
);

CREATE TABLE "message"(
	"id" UUID NOT NULL PRIMARY KEY DEFAULT gen_random_uuid(),
	"message_body" TEXT NOT NULL,
	"sent" BOOLEAN NOT NULL DEFAULT false,
	"failed" BOOLEAN NOT NULL DEFAULT false,
	"time_took" INTEGER,
	"produced_by" UUID NOT NULL REFERENCES producer(id)
);
