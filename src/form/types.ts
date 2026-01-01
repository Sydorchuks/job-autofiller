export type SemanticRole =
    | "firstName"
    | "lastName"
    | "email"
    | "phone"
    | "salary"
    | "availability"
    | "noticePeriod"
    | "locationCountry"
    | "locationCity"
    | "locationGeneric"
    | "profileGit"
    | "profileLinkedIn"
    | "resume"
    | "unknown"
    | "language";

export type ControlType =
    | "input"
    | "select"
    | "selectized"
    | "textarea"
    | "file"
    | "checkbox";

export type SemanticField = {
    id: string;
    role: SemanticRole;
    controlType: ControlType;
};
