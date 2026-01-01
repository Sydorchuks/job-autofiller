export enum LanguageLevel {
    NATIVE = "native",
    C2 = "c2",
    C1 = "c1",
    B2 = "b2",
    B1 = "b1",
    A2 = "a2",
    A1 = "a1",
}

export type LanguageProfile = {
    name: string;
    level: LanguageLevel;
};
