-- CREATE DATABASE education_db;

CREATE TABLE "Users"
(
    "userID"     SERIAL PRIMARY KEY,
    "firstName"  VARCHAR,
    "lastName"   VARCHAR,
    "patronymic" VARCHAR,
    "email"      VARCHAR UNIQUE,
    "password"   VARCHAR,
    "avatar"     VARCHAR,
    "salt"       VARCHAR,
    "contract"   BOOLEAN DEFAULT TRUE,
    "faculty"    VARCHAR DEFAULT 'ФІОТ',
    "cathedra"   VARCHAR DEFAULT 'АСОІУ'
);

CREATE TABLE "UsersPasswords"
(
    "userID"   INT PRIMARY KEY REFERENCES "Users" ("userID") ON DELETE CASCADE,
    "password" VARCHAR
);

CREATE TABLE "Tokens"
(
    "tokenID" VARCHAR,
    "token"   VARCHAR,
    "userID"  INT REFERENCES "Users" ON DELETE CASCADE
);

CREATE TABLE "Groups"
(
    "groupID"   SERIAL PRIMARY KEY,
    "groupName" VARCHAR NOT NULL
);

CREATE TABLE "GroupMembers"
(
    "id"        SERIAL PRIMARY KEY,
    "groupID"   INT REFERENCES "Groups" ON DELETE CASCADE,
    "studentID" INT REFERENCES "Users" ("userID") ON DELETE CASCADE
);

CREATE TABLE "DisciplinesInformation"
(
    "disciplineInformationID" SERIAL PRIMARY KEY,
    "hours"                   INT,
    "lections"                INT,
    "lectionsIndividual"      INT,
    "practices"               INT,
    "practicesIndividual"     INT,
    "labs"                    INT,
    "labsIndividual"          INT,
    "independentWorks"        INT,
    "individuals"             INT,
    "exam"                    BOOLEAN,
    "moduleControlWorks"      INT,
    "computerPractice"        INT,
    "controlWorks"            INT,
    "settlementWork"          INT,
    "homeControlWork"         INT,
    "essay"                   INT
);

CREATE TABLE "DisciplineAnnotation"
(
    "disciplineAnnotationID" SERIAL PRIMARY KEY,
    "electoral"              BOOLEAN,
    "level"                  VARCHAR,
    "course"                 INT,
    "amount"                 INT,
    "language"               VARCHAR,
    "cathedra"               VARCHAR,
    "requirements"           TEXT,
    "courseProgram"          TEXT,
    "reasonsToStudy"         TEXT,
    "studyResult"            TEXT,
    "usages"                 TEXT,
    "materials"              VARCHAR(255),
    "formOfConducting"       VARCHAR(255),
    "semesterControl"        VARCHAR(255),
    "minStudents"            INT,
    "maxStudents"            INT,
    "maxContracts"           INT,
    "confirmed"              BOOLEAN DEFAULT FALSE
);

CREATE TABLE "Disciplines"
(
    "disciplineID"            SERIAL PRIMARY KEY,
    "disciplineName"          VARCHAR,
    "ownerID"                 INT REFERENCES "Users" ("userID") ON DELETE CASCADE,
    "content"                 TEXT DEFAULT '',
    "disciplineAnnotationID"  INT REFERENCES "DisciplineAnnotation",
    "disciplineInformationID" INT REFERENCES "DisciplinesInformation",
    "firstAttestation"        INT  DEFAULT 0,
    "secondAttestation"       INT  DEFAULT 0
);

CREATE TABLE "Activity"
(
    "activityID"   SERIAL PRIMARY KEY,
    "disciplineID" INT REFERENCES "Disciplines" ON DELETE CASCADE,
    "name"         VARCHAR,
    "type"         VARCHAR,
    "visible"      BOOLEAN DEFAULT FALSE,
    "index"        INT
);

CREATE TABLE "ActivityComponent"
(
    "activityComponentID" SERIAL PRIMARY KEY,
    "activityID"          INT REFERENCES "Activity" ON DELETE CASCADE,
    "name"                VARCHAR,
    "type"                VARCHAR,
    "index"               INT
);

CREATE TABLE "ActivityContent"
(
    "activityContentID"   SERIAL PRIMARY KEY,
    "activityComponentID" INT REFERENCES "ActivityComponent" ON DELETE CASCADE,
    "content"             TEXT,
    "name"                VARCHAR
);

CREATE TABLE "ActivityAttendance"
(
    "activityID"           INT REFERENCES "Activity" ON DELETE CASCADE,
    "userID"               INT REFERENCES "Users" ON DELETE CASCADE,
    "attendance"           VARCHAR DEFAULT ' ',
    "activityAttendanceID" SERIAL PRIMARY KEY
);

CREATE TABLE "DisciplinesGroupAccess"
(
    "id"           SERIAL PRIMARY KEY,
    "disciplineID" INT REFERENCES "Disciplines" ON DELETE CASCADE,
    "groupID"      INT REFERENCES "Groups" ON DELETE CASCADE
);

CREATE TABLE "MarksAdditionalColumns"
(
    "columnID"     SERIAL PRIMARY KEY,
    "disciplineID" INT REFERENCES "Disciplines" ("disciplineID") ON DELETE CASCADE,
    "groupID"      INT REFERENCES "Groups" ("groupID") ON DELETE CASCADE,
    "title"        VARCHAR,
    "type"         VARCHAR
);

CREATE TABLE "MarksAdditionalColumnValues"
(
    "columnValueID" SERIAL PRIMARY KEY,
    "columnID"      INT REFERENCES "MarksAdditionalColumns" ("columnID") ON DELETE CASCADE,
    "userID"        INT REFERENCES "Users" ("userID") ON DELETE CASCADE,
    "value"         VARCHAR
);

CREATE TABLE "DisciplinesTeacherAccess"
(
    "disciplineID" INT REFERENCES "Disciplines" ON DELETE CASCADE,
    "teacherID"    INT REFERENCES "Users" ("userID") ON DELETE CASCADE,
    "editor"       BOOLEAN,
    "adder"        BOOLEAN,
    "remover"      BOOLEAN,
    PRIMARY KEY ("disciplineID", "teacherID")
);

CREATE TABLE "Articles"
(
    "id"       SERIAL PRIMARY KEY,
    "title"    VARCHAR,
    "content"  TEXT,
    "translit" VARCHAR,
    "ownerID"  INT REFERENCES "Users" ("userID") ON DELETE CASCADE,
    "parentID" INT REFERENCES "Articles" ("id") ON DELETE CASCADE
);
CREATE TABLE "News"
(
    "id"       SERIAL PRIMARY KEY,
    "title"    VARCHAR,
    "content"  TEXT,
    "translit" VARCHAR,
    "ownerID"  INT REFERENCES "Users" ("userID") ON DELETE CASCADE
);

CREATE TABLE "Announcements"
(
    "id"       SERIAL PRIMARY KEY,
    "title"    VARCHAR,
    "content"  TEXT,
    "translit" VARCHAR,
    "ownerID"  INT REFERENCES "Users" ("userID") ON DELETE CASCADE
);

CREATE TABLE "RolesPrivileges"
(
    "roleID"               SERIAL PRIMARY KEY,
    "roleName"             VARCHAR,
    "articlesAdder"        BOOLEAN DEFAULT FALSE,
    "articlesUpdater"      BOOLEAN DEFAULT FALSE,
    "articlesRemover"      BOOLEAN DEFAULT FALSE,
    "newsAdder"            BOOLEAN DEFAULT FALSE,
    "newsUpdater"          BOOLEAN DEFAULT FALSE,
    "newsRemover"          BOOLEAN DEFAULT FALSE,
    "rolesChanger"         BOOLEAN DEFAULT FALSE,
    "announcementsAdder"   BOOLEAN DEFAULT FALSE,
    "announcementsUpdater" BOOLEAN DEFAULT FALSE,
    "announcementsRemover" BOOLEAN DEFAULT FALSE,
    "disciplinesAdder"     BOOLEAN DEFAULT FALSE,
    "groupAdder"           BOOLEAN DEFAULT FALSE,
    "groupRemover"         BOOLEAN DEFAULT FALSE,
    "groupMemberAdder"     BOOLEAN DEFAULT FALSE,
    "groupMemberRemover"   BOOLEAN DEFAULT FALSE,
    "disciplinesAccepter"  BOOLEAN DEFAULT FALSE
);

CREATE TABLE "UsersRoles"
(
    "id"     SERIAL PRIMARY KEY,
    "userID" INT REFERENCES "Users" ON DELETE CASCADE,
    "roleID" INT REFERENCES "RolesPrivileges" ON DELETE CASCADE
);


CREATE TABLE "ControlComponents"
(
    "controlComponentID"       INT PRIMARY KEY REFERENCES "ActivityComponent" ("activityComponentID") ON DELETE CASCADE,
    "maxPoint"                 REAL                     NOT NULL,
    "type"                     VARCHAR                  NOT NULL,
    "extraPoints"              REAL                     DEFAULT 0,
    "mandatory"                BOOLEAN                  DEFAULT TRUE,
    "triesCount"               INT                      DEFAULT 1,
    "autocheck"                BOOLEAN                  DEFAULT TRUE,
    "hasPenalty"               BOOLEAN                  DEFAULT FALSE,
    "threshold"                INT                      DEFAULT 0,
    "penaltyPercentage"        INT                      DEFAULT 0,
    "penaltyDimension"         VARCHAR                  DEFAULT 'day',
    "minPoint"                 REAL                     DEFAULT 0,
    "penaltyComment"           TEXT,
    "startDate"                TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    "deadlineDate"             TIMESTAMP WITH TIME ZONE NOT NULL,
    "finalDate"                TIMESTAMP WITH TIME ZONE NOT NULL,
    "timeLimit"                BIGINT,
    "tryPenalty"               INT                      DEFAULT 0,
    "taskCountNOfM"            INT                      DEFAULT 0,
    "showStudentCorrectAnswer" BOOLEAN                  DEFAULT TRUE,
    "sortRandomly"             BOOLEAN                  DEFAULT FALSE
);

CREATE TABLE "ControlComponentsGroupAccess"
(

    "accessID"           SERIAL PRIMARY KEY,
    "controlComponentID" INT REFERENCES "ControlComponents" ("controlComponentID"),
    "groupID"            INT REFERENCES "Groups" ("groupID"),
    "access"             BOOLEAN

);


CREATE TABLE "ControlComponentsTasks"
(
    "taskID"             SERIAL PRIMARY KEY,
    "index"              INT     NOT NULL,
    "controlComponentID" INT REFERENCES "ControlComponents" ("controlComponentID") ON DELETE CASCADE,
    "maxPoint"           REAL    NOT NULL,
    "choosingType"       VARCHAR NOT NULL DEFAULT 'random',
    "type"               VARCHAR NOT NULL
);

create table "ControlComponentsTaskVariants"
(
    "variantID"   SERIAL NOT NULL PRIMARY KEY,
    "description" TEXT,
    "variant"     INT,
    "taskID"      INT    NOT NULL REFERENCES "ControlComponentsTasks"
        ON DELETE CASCADE
);


CREATE TABLE "ControlComponentTaskAnswers"
(
    "answerID"  SERIAL PRIMARY KEY,
    "variantID" INT REFERENCES "ControlComponentsTaskVariants" ("variantID") ON DELETE CASCADE,
    "correct"   BOOLEAN NOT NULL,
    "text"      TEXT    NOT NULL
);

CREATE TABLE "UsersControlComponentsAnswers"
(
    "userAnswerID" SERIAL PRIMARY KEY,
    "userID"       INT REFERENCES "Users" ("userID") ON DELETE CASCADE,
    "variantID"    INT REFERENCES "ControlComponentsTaskVariants" ("variantID") ON DELETE CASCADE,
    "answer"       TEXT NOT NULL,
    "point"        REAL DEFAULT 0,
    "sessionID"    UUID REFERENCES "UsersControlSessions" ("sessionID") ON DELETE CASCADE
);

CREATE TABLE "UsersControlSessions"
(
    "sessionID"          UUID PRIMARY KEY,
    "userID"             INT REFERENCES "Users" ("userID") ON DELETE CASCADE,
    "controlComponentID" INT REFERENCES "ControlComponents" ("controlComponentID") ON DELETE CASCADE,
    "startDate"          TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    "finalDate"          TIMESTAMP WITH TIME ZONE,
    "lastTaskID"         INT REFERENCES "ControlComponentsTasks" ("taskID")
);

create table "UsersTaskSets"
(
    "sessionID" uuid    not null
        references "UsersControlSessions"
            on delete cascade,
    "variantID" integer not null
        references "ControlComponentsTaskVariants"
            on delete cascade,
    "taskID"    integer
        references "ControlComponentsTasks"
            on delete cascade,
    primary key ("sessionID", "variantID")
);

CREATE TABLE "UsersControlPoints"
(
    "userID"             INT REFERENCES "Users" ("userID") ON DELETE CASCADE,
    "controlComponentID" INT REFERENCES "ControlComponents" ("controlComponentID") ON DELETE CASCADE,
    "point"              REAL NOT NULL
);

REVOKE CREATE ON SCHEMA public FROM public;

CREATE ROLE "EducationDBPool";
GRANT SELECT, INSERT, UPDATE, DELETE, REFERENCES, TRIGGER ON
    ALL TABLES IN SCHEMA public
    TO "EducationDBPool";

GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public
    TO "EducationDBPool";

CREATE USER "EducationDBPoolUser" WITH PASSWORD 'ilovethisnestjs' IN ROLE "EducationDBPool";

-- Articles
CREATE FUNCTION "AddArticle"("title" VARCHAR, "content" TEXT, "translit" VARCHAR, "ownerID" INT,
                             "parentID" INT) RETURNS VOID
AS
$$
BEGIN
    INSERT INTO "Articles"("title", "content", "translit", "ownerID", "parentID") VALUES ($1, $2, $3, $4, $5);
END;
$$
    LANGUAGE plpgsql;

CREATE FUNCTION "UpdateArticle"("id" INT, "title" VARCHAR, "content" TEXT, "translit" VARCHAR) RETURNS VOID
AS
$$
BEGIN
    UPDATE "Articles"
    SET "title"    = $2,
        "content"  = $3,
        "translit" = $4
    WHERE "Articles"."id" = $1;
END;
$$
    LANGUAGE plpgsql;

CREATE FUNCTION "DeleteArticle"("id" INT) RETURNS VOID
AS
$$
BEGIN
    DELETE FROM "Articles" WHERE "Articles"."id" = $1;
END;
$$
    LANGUAGE plpgsql;

CREATE OR REPLACE VIEW "MainMenu" AS
SELECT "id", "title", "translit", "parentID"
FROM "Articles";

--News
CREATE FUNCTION "AddNews"("title" VARCHAR, "content" TEXT, "translit" VARCHAR, "ownerID" INT) RETURNS VOID
AS
$$
BEGIN
    INSERT INTO "News"("title", "content", "translit", "ownerID")
    SELECT $1 AS "title", $2 AS "content", $3 AS "translit", $4 AS "ownerID";
END;
$$
    LANGUAGE plpgsql;

CREATE FUNCTION "UpdateNews"("id" INT, "title" VARCHAR, "content" TEXT, "translit" VARCHAR) RETURNS VOID
AS
$$
BEGIN
    UPDATE "News"
    SET "title"    = $2,
        "content"  = $3,
        "translit" = $4
    WHERE "News"."id" = $1;
END;
$$
    LANGUAGE plpgsql;

CREATE FUNCTION "DeleteNews"("id" INT) RETURNS VOID
AS
$$
BEGIN
    DELETE FROM "News" WHERE "News"."id" = $1;
END;
$$
    LANGUAGE plpgsql;


-- Announcements
CREATE FUNCTION "AddAnnouncement"("title" VARCHAR, "content" TEXT, "translit" VARCHAR, "ownerID" INT) RETURNS VOID
AS
$$
BEGIN
    INSERT INTO "Announcements"("title", "content", "translit", "ownerID")
    SELECT $1 AS "title", $2 AS "content", $3 AS "translit", $4 AS "ownerID";
END;
$$
    LANGUAGE plpgsql;

CREATE FUNCTION "UpdateAnnouncements"("id" INT, "title" VARCHAR, "content" TEXT, "translit" VARCHAR) RETURNS VOID
AS
$$
BEGIN
    UPDATE "Announcements"
    SET "title"    = $2,
        "content"  = $3,
        "translit" = $4
    WHERE "Announcements"."id" = $1;
END;
$$
    LANGUAGE plpgsql;

CREATE FUNCTION "DeleteAnnouncement"("id" INT) RETURNS VOID
AS
$$
BEGIN
    DELETE FROM "Announcements" WHERE "Announcements"."id" = $1;
END;
$$
    LANGUAGE plpgsql;


CREATE OR REPLACE FUNCTION "GetAbstractPostByTranslit"("type" VARCHAR, "url" VARCHAR)
    RETURNS TABLE
            (
                "id"        INT,
                "title"     VARCHAR,
                "content"   TEXT,
                "translit"  VARCHAR,
                "ownerName" TEXT
            )
AS
$$
DECLARE
    currentRecord RECORD;
BEGIN
    EXECUTE FORMAT('SELECT an."id", an."title", an."content", an."translit", CONCAT("lastName", '' '', "firstName", '' '', "patronymic") AS "ownerName"
				   FROM %I an
				   INNER JOIN "Users" u ON u."userID" = an."ownerID"
				   WHERE an."translit" = ''%s'';', (
        SELECT CASE
                   WHEN $1 = 'article' THEN 'Articles'
                   WHEN $1 = 'news' THEN 'News'
                   WHEN $1 = 'announcement' THEN 'Announcements'
                   ELSE 'Articles'
                   END), $2) INTO currentRecord;
    RETURN QUERY (SELECT currentRecord."id",
                         currentRecord."title",
                         currentRecord."content",
                         currentRecord."translit",
                         currentRecord."ownerName");
END;
$$
    LANGUAGE plpgsql;


-- Disciplines
CREATE FUNCTION "AddDiscipline"("disciplineName" VARCHAR, "ownerID" INT) RETURNS INT
AS
$$
WITH res AS (INSERT INTO "Disciplines" ("disciplineName", "ownerID") VALUES ($1, $2) RETURNING "disciplineID")
SELECT "disciplineID"
FROM res;
$$
    LANGUAGE SQL;

CREATE FUNCTION "UpdateDiscipline"("disciplineID" INT, "disciplineName" VARCHAR, "content" TEXT) RETURNS VOID
AS
$$
BEGIN
    UPDATE "Disciplines"
    SET "disciplineName" = $2,
        "content"        = $3
    WHERE "Disciplines"."disciplineID" = $1;
END;
$$
    LANGUAGE plpgsql;

CREATE FUNCTION "DeleteDiscipline"("disciplineID" INT) RETURNS VOID
AS
$$
BEGIN
    DELETE FROM "Disciplines" WHERE "Disciplines"."disciplineID" = $1;
END;
$$
    LANGUAGE plpgsql;



-- DisciplinesGroupAccess
CREATE FUNCTION "AddDisciplinesGroupAccess"("disciplineID" INT, "groupID" INT) RETURNS VOID
AS
$$
BEGIN
    INSERT INTO "DisciplinesGroupAccess" ("disciplineID", "groupID") SELECT $1 AS "disciplineID", $2 AS "groupID";
END;
$$
    LANGUAGE plpgsql;

CREATE FUNCTION "DeleteDisciplinesGroupAccess"("disciplineID" INT, "groupID" INT) RETURNS VOID
AS
$$
BEGIN
    DELETE
    FROM "DisciplinesGroupAccess"
    WHERE "DisciplinesGroupAccess"."disciplineID" = $1
      AND "DisciplinesGroupAccess"."groupID" = $2;
END;
$$
    LANGUAGE plpgsql;


-- DisciplinesTeacherAccess
CREATE FUNCTION "AddDisciplinesTeacherAccess"("disciplineID" INT, "teacherID" INT, "editor" BOOLEAN, "adder" BOOLEAN,
                                              "remover" BOOLEAN) RETURNS VOID
AS
$$
BEGIN
    INSERT INTO "DisciplinesTeacherAccess" ("disciplineID", "teacherID", "editor", "adder", "remover")
    SELECT $1 AS "disciplineID", $2 AS "teacherID", $3 AS "editor", $4 AS "adder", $5 AS "remover";
END;
$$
    LANGUAGE plpgsql;

CREATE FUNCTION "UpdateDisciplinesTeacherAccess"("disciplineID" INT, "teacherID" INT, "editor" BOOLEAN, "adder" BOOLEAN,
                                                 "remover" BOOLEAN) RETURNS VOID
AS
$$
BEGIN
    UPDATE "DisciplinesTeacherAccess"
    SET "editor" = $3,
        "adder"  =$4,
        "remover"=$5
    WHERE "DisciplinesTeacherAccess"."disciplineID" = $1
      AND "DisciplinesTeacherAccess"."teacherID" = $2;
END;
$$
    LANGUAGE plpgsql;

CREATE FUNCTION "DeleteDisciplinesTeacherAccess"("disciplineID" INT, "teacherID" INT) RETURNS VOID
AS
$$
BEGIN
    DELETE
    FROM "DisciplinesTeacherAccess"
    WHERE "DisciplinesTeacherAccess"."disciplineID" = $1
      AND "DisciplinesTeacherAccess"."teacherID" = $2;
END;
$$
    LANGUAGE plpgsql;


-- Groups
CREATE FUNCTION "AddGroup"("groupName" VARCHAR) RETURNS INT
AS
$$
INSERT INTO "Groups"("groupName")
SELECT $1 AS "groupName"
RETURNING "groupID";
$$
    LANGUAGE SQL;

CREATE FUNCTION "UpdateGroup"("groupID" INT, "groupName" VARCHAR) RETURNS VOID
AS
$$
BEGIN
    UPDATE "Groups"
    SET "groupName" = $2
    WHERE "Groups"."groupID" = $1;
END;
$$
    LANGUAGE plpgsql;

CREATE FUNCTION "DeleteGroup"("groupID" INT) RETURNS VOID
AS
$$
BEGIN
    DELETE FROM "Groups" WHERE "Groups"."groupID" = $1;
END;
$$
    LANGUAGE plpgsql;


CREATE FUNCTION "FindGroups"(searchStr TEXT)
    RETURNS SETOF "Groups"
AS
$$
SELECT *
FROM "Groups"
WHERE "groupName" ILIKE CONCAT('%', $1, '%')
$$
    LANGUAGE SQL;


-- GroupMembers
CREATE FUNCTION "AddGroupMember"("groupID" INT, "studentID" INT) RETURNS VOID
AS
$$
BEGIN
    INSERT INTO "GroupMembers"("groupID", "studentID") SELECT $1 AS "groupID", $2 AS "studentID";
END;
$$
    LANGUAGE plpgsql;


CREATE FUNCTION "DeleteGroupMember"("studentID" INT) RETURNS VOID
AS
$$
BEGIN
    DELETE FROM "GroupMembers" WHERE "GroupMembers"."studentID" = $1;
END;
$$
    LANGUAGE plpgsql;


-- RolesPrivileges
CREATE FUNCTION "AddRolePrivilege"("roleName" VARCHAR)
    RETURNS VOID
AS
$$
INSERT INTO "RolesPrivileges"("roleName")
VALUES ($1);
$$
    LANGUAGE SQL;

CREATE FUNCTION "UpdateRolePrivilege"("roleID" INT,
                                      "articlesAdder" BOOLEAN,
                                      "articlesUpdater" BOOLEAN,
                                      "articlesRemover" BOOLEAN,
                                      "newsAdder" BOOLEAN,
                                      "newsUpdater" BOOLEAN,
                                      "newsRemover" BOOLEAN,
                                      "rolesChanger" BOOLEAN,
                                      "announcementsAdder" BOOLEAN,
                                      "announcementsUpdater" BOOLEAN,
                                      "announcementsRemover" BOOLEAN,
                                      "disciplinesAdder" BOOLEAN,
                                      "groupAdder" BOOLEAN,
                                      "groupRemover" BOOLEAN,
                                      "groupMemberAdder" BOOLEAN,
                                      "groupMemberRemover" BOOLEAN)
    RETURNS VOID
AS
$$
BEGIN
    UPDATE "RolesPrivileges"
    SET "articlesAdder"        = $2,
        "articlesUpdater"      = $3,
        "articlesRemover"      = $4,
        "newsAdder"            = $5,
        "newsUpdater"          = $6,
        "newsRemover"          = $7,
        "rolesChanger"         = $8,
        "announcementsAdder"   = $9,
        "announcementsUpdater" = $10,
        "announcementsRemover" = $11,
        "disciplinesAdder"     = $12,
        "groupAdder"           = $13,
        "groupRemover"         = $14,
        "groupMemberAdder"     = $15,
        "groupMemberRemover"   = $16
    WHERE "RolesPrivileges"."roleID" = $1;

END;
$$
    LANGUAGE plpgsql;

CREATE FUNCTION "DeleteRolePrivilege"("roleID" INT) RETURNS VOID
AS
$$
BEGIN
    DELETE FROM "RolesPrivileges" WHERE "RolesPrivileges"."roleID" = $1;
END;
$$
    LANGUAGE plpgsql;

-- Triggers for RolesPrivileges changes
CREATE FUNCTION "ChangeRoleTriggerFunction"()
    RETURNS TRIGGER
AS
$$
BEGIN
    DELETE
    FROM "Tokens"
    WHERE "userID" IN (SELECT "userID" FROM "UsersRoles" WHERE "UsersRoles"."roleID" = OLD."roleID");
    RETURN NEW;
END;
$$
    LANGUAGE plpgsql;

CREATE TRIGGER "DeleteRoleTrigger"
    BEFORE DELETE
    ON "RolesPrivileges"
    FOR EACH ROW
EXECUTE PROCEDURE "ChangeRoleTriggerFunction"();

CREATE TRIGGER "UpdateRoleTrigger"
    BEFORE UPDATE
    ON "RolesPrivileges"
    FOR EACH ROW
EXECUTE PROCEDURE "ChangeRoleTriggerFunction"();


-- Users
create function "AddUser"("firstName" character varying, "lastName" character varying, patronymic character varying,
                          email character varying, cathedra character varying, faculty character varying,
                          password character varying, salt character varying) returns integer
    language plpgsql
as
$$
Declare
    ret integer;
BEGIN

    INSERT INTO "Users" ("firstName", "lastName", "patronymic", "email", "cathedra", "faculty", "password", "salt")
    SELECT $1 AS "firstName",
           $2 AS "lastName",
           $3 AS "patronymic",
           $4 AS "email",
           $5 AS "cathedra",
           $6 AS "faculty",
           $7 AS "password",
           $8 AS "salt"
    RETURNING "userID" into ret;
    return ret;
END;
$$;


CREATE FUNCTION "UpdateUserInfo"("userID" INT, "firstName" VARCHAR, "lastName" VARCHAR,
                                 "patronymic" VARCHAR) RETURNS VOID
AS
$$
BEGIN
    UPDATE "Users"
    SET "firstName"  = $2,
        "lastName"   = $3,
        "patronymic" = $4
    WHERE "Users"."userID" = $1;
END;
$$
    LANGUAGE plpgsql;


CREATE FUNCTION "UpdateUserPassword"("userID" INT, "password" VARCHAR, "salt" VARCHAR) RETURNS VOID
AS
$$
BEGIN
    UPDATE "Users"
    SET "password" = $2,
        "salt"     = $3
    WHERE "Users"."userID" = $1;
END;
$$
    LANGUAGE plpgsql;


CREATE FUNCTION "DeleteUser"("userID" INT) RETURNS VOID
AS
$$
BEGIN
    DELETE FROM "Users" WHERE "Users"."userID" = $1;
END;
$$
    LANGUAGE plpgsql;


CREATE FUNCTION "GetStudentsOfTheGroup"("groupID" INT)
    RETURNS TABLE
            (
                "userID"     INT,
                "firstName"  VARCHAR,
                "lastName"   VARCHAR,
                "patronymic" VARCHAR,
                "email"      VARCHAR
            )
AS
$$
SELECT "userID", "firstName", "lastName", "patronymic", "email"
FROM "GroupMembers" gm
         INNER JOIN "Users" u ON gm."studentID" = u."userID"
WHERE gm."groupID" = $1;
$$
    LANGUAGE SQL;



--Tokens
CREATE FUNCTION "AddToken"("tokenID" VARCHAR, "token" VARCHAR, "userID" INT)
    RETURNS VOID
AS
$$
BEGIN
    INSERT INTO "Tokens"("tokenID", "token", "userID")
    SELECT $1 AS "tokenID", $2 AS "token", $3 AS "userID";
END;
$$
    LANGUAGE plpgsql;


CREATE FUNCTION "DeleteToken"("token" VARCHAR) RETURNS VOID
AS
$$
BEGIN
    DELETE FROM "Tokens" WHERE "Tokens"."token" = $1;
END;
$$
    LANGUAGE plpgsql;


--UsersRoles
CREATE FUNCTION "AddUsersRole"("userID" INT, "roleID" INT)
    RETURNS VOID
AS
$$
BEGIN
    INSERT INTO "UsersRoles"("userID", "roleID")
    SELECT $1 AS "userID", $2 AS "roleID";
END;
$$
    LANGUAGE plpgsql;


CREATE FUNCTION "DeleteUsersRole"("userID" INT, "roleID" INT) RETURNS VOID
AS
$$
BEGIN
    DELETE FROM "UsersRoles" WHERE "UsersRoles"."userID" = $1 AND "UsersRoles"."roleID" = $2;
END;
$$
    LANGUAGE plpgsql;


CREATE FUNCTION "GetUsersOfRole"("roleID" INT)
    RETURNS TABLE
            (
                "userID"     INT,
                "firstName"  VARCHAR,
                "lastName"   VARCHAR,
                "patronymic" VARCHAR,
                "email"      VARCHAR
            )
AS
$$
SELECT "userID", "firstName", "lastName", "patronymic", "email"
FROM "Users"
WHERE "userID" IN (SELECT "userID" FROM "UsersRoles" ur WHERE ur."roleID" = $1);
$$
    LANGUAGE SQL;

CREATE FUNCTION "GetUserByEmail"("email" VARCHAR)
    RETURNS TABLE
            (
                "userID"     INT,
                "firstName"  VARCHAR,
                "lastName"   VARCHAR,
                "patronymic" VARCHAR,
                "email"      VARCHAR
            )
AS
$$
SELECT "userID", "firstName", "lastName", "patronymic", "email"
FROM "Users"
WHERE "Users"."email" = $1
$$
    LANGUAGE SQL;


CREATE OR REPLACE FUNCTION "GetAllPostsBySearch"("search" VARCHAR)
    RETURNS TABLE
            (
                "id"       INT,
                "title"    VARCHAR,
                "translit" VARCHAR,
                "type"     VARCHAR
            )
AS
$$
(SELECT "id", "title", "translit", 'article' AS "type"
 FROM "Articles"
 WHERE "title" ILIKE CONCAT($1, '%')
 LIMIT 5)
UNION ALL
(
    SELECT "id", "title", "translit", 'news' AS "type"
    FROM "News"
    WHERE "title" ILIKE CONCAT($1, '%')
    LIMIT 5)
UNION ALL
(
    SELECT "id", "title", "translit", 'announcement' AS "type"
    FROM "Announcements"
    WHERE "title" ILIKE CONCAT($1, '%')
    LIMIT 5)
$$
    LANGUAGE SQL;

CREATE OR REPLACE FUNCTION public."GetDisciplineOwnerName"(
    "disciplineID" integer)
    RETURNS text
    LANGUAGE 'sql'

    COST 100
    VOLATILE
AS
$BODY$
SELECT CONCAT("lastName", ' ', "firstName", ' ', "patronymic")
FROM "Users"
WHERE "userID" = (SELECT "ownerID" FROM "Disciplines" WHERE "Disciplines"."disciplineID" = $1)
$BODY$;

CREATE OR REPLACE FUNCTION "GetMyDisciplines"("userID" INT)
    RETURNS TABLE
            (
                "disciplineID"   INT,
                "disciplineName" VARCHAR,
                "ownerName"      TEXT,
                "type"           VARCHAR
            )
AS
$$
SELECT "disciplineID",
       "disciplineName",
       (SELECT "GetDisciplineOwnerName"("disciplineID")) AS "ownerName",
       'student'                                         AS "type"
FROM "Disciplines"
WHERE "disciplineID" IN (
    SELECT "disciplineID"
    FROM "DisciplinesGroupAccess"
    WHERE "groupID" IN (
        SELECT "groupID"
        FROM "GroupMembers"
        WHERE "studentID" = $1
    )
)
UNION ALL
SELECT "disciplineID",
       "disciplineName",
       (SELECT "GetDisciplineOwnerName"("disciplineID")) AS "ownerName",
       'teacher'                                         AS "type"
FROM "Disciplines"
WHERE "disciplineID" IN (
    SELECT "disciplineID" FROM "DisciplinesTeacherAccess" WHERE "teacherID" = $1
)
$$
    LANGUAGE SQL;

CREATE OR REPLACE FUNCTION "GetUsersPrivileges"("userID" INT)
    RETURNS TABLE
            (
                "articlesAdder"        BOOLEAN,
                "articlesUpdater"      BOOLEAN,
                "articlesRemover"      BOOLEAN,
                "newsAdder"            BOOLEAN,
                "newsUpdater"          BOOLEAN,
                "newsRemover"          BOOLEAN,
                "rolesChanger"         BOOLEAN,
                "announcementsAdder"   BOOLEAN,
                "announcementsUpdater" BOOLEAN,
                "announcementsRemover" BOOLEAN,
                "disciplinesAdder"     BOOLEAN,
                "groupAdder"           BOOLEAN,
                "groupRemover"         BOOLEAN,
                "groupMemberAdder"     BOOLEAN,
                "groupMemberRemover"   BOOLEAN,
                "disciplinesAccepter"  BOOLEAN
            )
AS
$$
SELECT bool_or("articlesAdder"),
       bool_or("articlesUpdater"),
       bool_or("articlesRemover"),
       bool_or("newsAdder"),
       bool_or("newsUpdater"),
       bool_or("newsRemover"),
       bool_or("rolesChanger"),
       bool_or("announcementsAdder"),
       bool_or("announcementsUpdater"),
       bool_or("announcementsRemover"),
       bool_or("disciplinesAdder"),
       bool_or("groupAdder"),
       bool_or("groupRemover"),
       bool_or("groupMemberAdder"),
       bool_or("groupMemberRemover"),
       bool_or("disciplinesAccepter")
FROM "UsersRoles"

         INNER JOIN "RolesPrivileges" ON "UsersRoles"."roleID" = "RolesPrivileges"."roleID"
WHERE "userID" = $1
GROUP BY "UsersRoles"."userID"

$$
    LANGUAGE SQL;

CREATE OR REPLACE FUNCTION "GetDisciplineWithPrivileges"("id" INT, "userID" INT)
    RETURNS TABLE
            (
                "disciplineID"   INT,
                "disciplineName" VARCHAR,
                "content"        TEXT,
                "ownerName"      TEXT,
                "adder"          BOOLEAN,
                "editor"         BOOLEAN,
                "remover"        BOOLEAN
            )
AS
$$
DECLARE
    "teacherPrivileges" RECORD;
    "studentAccess"     RECORD;
BEGIN
    SELECT *
    INTO "teacherPrivileges"
    FROM "DisciplinesTeacherAccess"
    WHERE "DisciplinesTeacherAccess"."teacherID" = $2
      AND "DisciplinesTeacherAccess"."disciplineID" = $1;
    CASE "teacherPrivileges"."adder" IS NULL
        WHEN TRUE THEN SELECT *
                       INTO "studentAccess"
                       FROM "DisciplinesGroupAccess"
                       WHERE "DisciplinesGroupAccess"."groupID" IN (
                           SELECT "groupID"
                           FROM "GroupMembers"
                           WHERE "studentID" = $2
                       );

                       CASE "studentAccess"."groupID" IS NULL
                           WHEN TRUE
                               THEN RAISE EXCEPTION 'Access is denied!';
                           ELSE RETURN QUERY
                               SELECT "Disciplines"."disciplineID",
                                      "Disciplines"."disciplineName",
                                      "Disciplines"."content",
                                      (SELECT "GetDisciplineOwnerName"("Disciplines"."disciplineID")) AS "ownerName",
                                      FALSE                                                           AS "adder",
                                      FALSE                                                           AS "editor",
                                      FALSE                                                           AS "remover"
                               FROM "Disciplines"
                               WHERE "Disciplines"."disciplineID" = $1;
                           END CASE;
        ELSE RETURN QUERY
            SELECT "Disciplines"."disciplineID",
                   "Disciplines"."disciplineName",
                   "Disciplines"."content",
                   (SELECT "GetDisciplineOwnerName"("Disciplines"."disciplineID")) AS "ownerName",
                   "teacherPrivileges"."adder"                                     AS "adder",
                   "teacherPrivileges"."editor"                                    AS "editor",
                   "teacherPrivileges"."remover"                                   AS "remover"
            FROM "Disciplines"
            WHERE "Disciplines"."disciplineID" = $1;
        END CASE;
END;
$$
    LANGUAGE plpgsql;


CREATE OR REPLACE FUNCTION "GetTeachersOfDiscipline"("disciplineID" INT)
    RETURNS TABLE
            (
                "userID"     INT,
                "firstName"  VARCHAR,
                "lastName"   VARCHAR,
                "patronymic" VARCHAR,
                "email"      VARCHAR,
                "adder"      BOOLEAN,
                "editor"     BOOLEAN,
                "remover"    BOOLEAN
            )
AS
$$
SELECT "userID",
       "firstName",
       "lastName",
       "patronymic",
       "email",
       "adder",
       "editor",
       "remover"
FROM "Users" u
         INNER JOIN "DisciplinesTeacherAccess" dta ON dta."teacherID" = u."userID"
WHERE "disciplineID" = $1

$$
    LANGUAGE SQL;

CREATE OR REPLACE FUNCTION "GetGroupsOfDiscipline"("disciplineID" INT)
    RETURNS TABLE
            (
                "groupID"   INT,
                "groupName" VARCHAR
            )
AS
$$
SELECT *
FROM "Groups"
WHERE "groupID" IN (
    SELECT "groupID"
    FROM "DisciplinesGroupAccess"
    WHERE "disciplineID" = $1
)
$$
    LANGUAGE SQL;


CREATE OR REPLACE FUNCTION "GetDisciplineAnnotation"("id" int) RETURNS SETOF "DisciplineAnnotation"
AS
$$
SELECT *
FROM "DisciplineAnnotation"
WHERE "disciplineAnnotationID" = (SELECT "disciplineAnnotationID" FROM "Disciplines" WHERE "disciplineID" = $1);
$$
    LANGUAGE sql;


CREATE OR REPLACE FUNCTION "SignOutAllAfterUserUpdate"()
    RETURNS TRIGGER
AS
$$
BEGIN
    DELETE FROM "Tokens" WHERE "userID" = NEW."userID";
    RETURN NEW;
END;
$$
    LANGUAGE plpgsql;


CREATE TRIGGER "SignOutAllAfterUserUpdateTrigger"
    AFTER UPDATE OF "password"
    ON "Users"
    FOR EACH ROW
EXECUTE PROCEDURE "SignOutAllAfterUserUpdate"();



INSERT INTO "Users" ("firstName", "lastName", patronymic, email, "password", salt)
VALUES ('admin', 'admin', 'admin', 'admin@gmail.com',
        '$2b$10$5y1BGSHlCt531rsPWvbAcezRbq1rgTubIvkeAGheaHAUFPOT3gMQu', '$2b$10$5y1BGSHlCt531rsPWvbAce');

INSERT INTO "RolesPrivileges" ("roleName",
                               "articlesAdder",
                               "articlesUpdater",
                               "articlesRemover",
                               "newsAdder",
                               "newsUpdater",
                               "newsRemover",
                               "rolesChanger",
                               "announcementsAdder",
                               "announcementsUpdater",
                               "announcementsRemover",
                               "disciplinesAdder",
                               "groupAdder",
                               "groupRemover",
                               "groupMemberAdder",
                               "groupMemberRemover")
VALUES ('Admin', true, true, true, true, true, true, true, true, true, true, true, true, true, true, true),
       ('ScientificSecretary', true, true, true, true, true, true, true, true, true, true, true, true, true, true, true),
       ('Teacher', false, false, false, true, true, true, false, false, false, false, true, true, true, true, true),
       ('Manager', true, true, true, true, true, true, false, true, true, true, false, false, false, false, false);


INSERT INTO "UsersRoles" ("userID", "roleID")
VALUES ((SELECT "userID" FROM "Users" WHERE "email" = 'admin@gmail.com'),
        (SELECT "roleID" FROM "RolesPrivileges" WHERE "roleName" = 'Admin'));



INSERT INTO "Articles" (title, "content", translit, "ownerID", "parentID")
VALUES ('Вступ', '<h1>Вступ</h1>', 'vstup',
        (SELECT "userID" FROM "Users" WHERE "email" = 'admin@gmail.com'), NULL),
       ('Кафедра', '<h1>Кафедра</h1>', 'cathedra',
        (SELECT "userID" FROM "Users" WHERE "email" = 'admin@gmail.com'), NULL),
       ('Навчання', '<h1>Навчання</h1>', 'navchannya',
        (SELECT "userID" FROM "Users" WHERE "email" = 'admin@gmail.com'), NULL),
       ('Наука', '<h1>Наука</h1>', 'nauka',
        (SELECT "userID" FROM "Users" WHERE "email" = 'admin@gmail.com'), NULL),
       ('Студентам', '<h1>Студентам</h1>', 'studentam',
        (SELECT "userID" FROM "Users" WHERE "email" = 'admin@gmail.com'), NULL),
       ('Контакти', '<h1>Контакти</h1>', 'contacts',
        (SELECT "userID" FROM "Users" WHERE "email" = 'admin@gmail.com'), NULL),
       ('Golovna', '<h1>Головна</h1>', 'golovna',
        (SELECT "userID" FROM "Users" WHERE "email" = 'admin@gmail.com'), NULL);

INSERT INTO "Articles" (title, "content", translit, "ownerID", "parentID")
VALUES ('Опис спеціальностей кафедри', '<h1>Опис спеціальностей кафедри</h1>', 'opys-specialnostey-cafedry',
        (SELECT "userID" FROM "Users" WHERE "email" = 'admin@gmail.com'),
        (SELECT "id" FROM "Articles" WHERE "title" = 'Вступ')),
       ('Офіційні документи', '<h1>Офіційні документи</h1>', 'oficiyny-documenty',
        (SELECT "userID" FROM "Users" WHERE "email" = 'admin@gmail.com'),
        (SELECT "id" FROM "Articles" WHERE "title" = 'Вступ'));

INSERT INTO "Articles" (title, "content", translit, "ownerID", "parentID")
VALUES ('Освітні програми', '<h1>Освітні програми</h1>', 'osvitni-programy',
        (SELECT "userID" FROM "Users" WHERE "email" = 'admin@gmail.com'),
        (SELECT "id" FROM "Articles" WHERE "title" = 'Навчання'));

INSERT INTO "Articles" (title, "content", translit, "ownerID", "parentID")
VALUES ('Освітні програми спеціальності 121 „Інженерія програмного забезпечення”',
        '<h1>Освітні програми спеціальності 121 „Інженерія програмного забезпечення”</h1>', 'osvitni-programy-121',
        (SELECT "userID" FROM "Users" WHERE "email" = 'admin@gmail.com'),
        (SELECT "id" FROM "Articles" WHERE "title" = 'Освітні програми'));


