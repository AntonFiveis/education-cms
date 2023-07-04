CREATE TABLE "MarksAdditionalColumns"
(
    "columnID"          SERIAL PRIMARY KEY,
    "disciplineGroupID" INT REFERENCES "DisciplinesGroupAccess" ("id") ON DELETE CASCADE,
    "title"             VARCHAR,
    "type"              VARCHAR
);

CREATE TABLE "MarksAdditionalColumnValues"
(
    "columnValueID" SERIAL PRIMARY KEY,
    "columnID"      INT REFERENCES "MarksAdditionalColumns" ("columnID") ON DELETE CASCADE,
    "userID"        INT REFERENCES "Users" ("userID") ON DELETE CASCADE,
    "value"         VARCHAR
);

alter table "ControlComponentsTaskVariants" alter column "description" drop default;


CREATE TABLE "ControlComponentsGroupAccess"(

                                               "accessID" SERIAL PRIMARY KEY ,
                                               "controlComponentID" INT REFERENCES "ControlComponents"("controlComponentID"),
                                               "groupID" INT REFERENCES "Groups"("groupID"),
                                               "access" BOOLEAN

);
