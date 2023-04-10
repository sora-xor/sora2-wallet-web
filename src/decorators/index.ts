function Singleton<T extends new (...args: any[]) => any>(Ctr: T): T {
  let instance: T;

  return class {
    constructor(...args: any[]) {
      if (instance) {
        console.error('You cannot instantiate a singleton twice!');
        return instance;
      }

      instance = new Ctr(...args);
      return instance;
    }
  } as T;
}

export default Singleton;
