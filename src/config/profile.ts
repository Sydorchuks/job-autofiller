import { LanguageLevel, LanguageProfile } from "../domain/languages";
import { SalaryCurrency, SalaryPeriod } from "../domain/salary";


export const profile = {
    firstName: "Oleh",
    lastName: "Sydorchuk",
    email: "olegsydorchuk9@gmail.com",
    phone: "+380680760880",
    resumePath: "C:/Users/olegs/Downloads/Resume.pdf",

    salary: {
        [SalaryCurrency.PLN]: {
            [SalaryPeriod.HOURLY]: 35,
            [SalaryPeriod.MONTHLY]: 4000,
            [SalaryPeriod.YEARLY]: 48000,
        },
        [SalaryCurrency.EUR]: {
            [SalaryPeriod.HOURLY]: 15,
            [SalaryPeriod.MONTHLY]: 3000,
            [SalaryPeriod.YEARLY]: 36000,
        },
        [SalaryCurrency.USD]: {
            [SalaryPeriod.HOURLY]: 15,
            [SalaryPeriod.MONTHLY]: 3000,
            [SalaryPeriod.YEARLY]: 36000,
        },
        [SalaryCurrency.UAH]: {
            [SalaryPeriod.HOURLY]: 600,
            [SalaryPeriod.MONTHLY]: 30000,
            [SalaryPeriod.YEARLY]: 360000,
        },
    },

    profiles: {
        github: "https://github.com/Sydorchuks",
        linkedin: "https://www.linkedin.com/in/oleh-sydorchuk/",
        portfolio: "",
    },

    location: {
        country: "Poland",
        countryAliases: ["Polska", "PL"],
        city: "Wrocław",
        cityAliases: ["Wroclaw"],
    },

    languages: [
        { name: "English", level: LanguageLevel.C1 },
        { name: "Polish", level: LanguageLevel.B2 },
        { name: "German", level: LanguageLevel.A2 },
    ] satisfies LanguageProfile[],
};
