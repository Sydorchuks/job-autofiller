type Resolver = () => void;

const resolvers: Resolver[] = [];

export default {
  wait(): Promise<void> {
    return new Promise((resolve) => {
      resolvers.push(resolve);
    });
  },

  trigger() {
    while (resolvers.length) {
      const resolve = resolvers.shift();
      resolve?.();
    }
  },
};
