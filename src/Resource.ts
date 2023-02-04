export abstract class Resource {
  promise: Promise<any>;

  constructor(...promisesAndResources: Array<Promise<any> | Resource>) {
    const promises = promisesAndResources.map(
      (x) => (x as Resource)?.promise || x
    );
    this.promise = Promise.all(promises);
  }
}

export const waitFor = (...resources: Resource[]): Promise<any> =>
  Promise.all(resources.map((resource) => resource.promise));
