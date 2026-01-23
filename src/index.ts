import { runEngine } from "./engine/runner/runEngine";
import { createSession } from "./engine/session";

const session = createSession({
  mode: "interactive", // або "auto"
  urls: [
    "https://ready4s.traffit.com/public/form/a/f8aaf8330de12418ddbc7cb3b6a706167442673d",
    "https://it-factory.recruitify.ai/job/1a238220-50c1-4943-9db7-0461f4e4905f?sourceId=1747&igbTracker=866416829",
    "https://ikariera.traffit.com/public/form/a/ca563a116804e007f4209c9f5497e0633230595a?source=linkedin.com",
    "https://300brains.traffit.com/public/form/a/e80634a05d7a29cfd53ee3bbc1ba6906637a6b53?source=linkedin.com",
    "https://sunstore.traffit.com/public/form/a/1d6aacade7521bffbec87aff488d77992f6d513d?source=linkedin.com",
    "https://jobs.deel.com/job-boards/productiv/job-details/78164ea8-a6ed-41f6-a6cb-f130d032987a/application?source=linkedin",
    "https://300brains.traffit.com/public/form/a/278373c991f8f2db15b2a6a715b349514d513348?source=linkedin.com",
    "https://amartus.traffit.com/public/form/a/c7208964584c4b553c347c920414d5ee4551453d?source=linkedin.com",
    "https://leasingteam.traffit.com/public/form/a/b5031b24d089c795ef4dba939165b1b9376b50746b513d3d?source=linkedin.com",
    "https://www.jobposting.pro/emploi-2467934-123#postuler",
    "https://leasingteam.traffit.com/public/form/a/ff78d14810e4faa86e59adb04351b50e3274433841513d3d?source=linkedin.com",
  ],
});

runEngine(session).catch((err) => {
  console.error("❌ Engine crashed:", err);
});
