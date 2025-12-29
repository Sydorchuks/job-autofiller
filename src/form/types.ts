export type SemanticRole =
    | "firstName"
    | "lastName"
    | "email"
    | "phone"
    | "salary"
    | "availability"
    | "profileGit"
    | "profileLinkedIn"
    | "resume"
    | "unknown";

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
