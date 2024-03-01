export class Resource {
  private resources: Array<ResourcePromise<any> | Resource>;
  promise: Promise<any>;

  constructor(...promisesAndResources: Array<ResourcePromise<any> | Resource>) {
    this.resources = promisesAndResources;
    this.promise = Promise.all(this.resources.map((x) => x.promise));
  }

  listenProgress(callback: (progress: number) => void) {
    const update = () => {
      callback(this.progress());
    };
    this.resources.forEach((rsc) => {
      if (rsc instanceof Resource) {
        rsc.listenProgress(update);
      } else {
        rsc.promise.then(update);
      }
    });
  }

  progress(): number {
    return (
      this.resources
        .map((x) => (x instanceof Resource ? x.progress() : x.loaded ? 1 : 0))
        .reduce((a, b) => a + b) / this.resources.length
    );
  }
}

export const loadResources = (...resources: Resource[]): Promise<void> => {
  const progressBar = document.createElement("div");
  progressBar.className = "progressbar";
  const bar = document.createElement("div");
  progressBar.appendChild(bar);
  document.body.appendChild(progressBar);

  const root = new Resource(...resources);
  root.listenProgress((progress) => (bar.style.width = `${progress * 100}%`));
  root.promise.then(() => {
    bar.textContent =
      "Press [F] to enter fullscreen. Click pointer device to start the action.";
  });

  return root.promise;
};

export class ResourcePromise<T> {
  loaded: boolean;
  promise: Promise<T>;

  constructor(
    executor: (
      resolve: (value: T | PromiseLike<T>) => void,
      reject: (reason?: any) => void
    ) => void
  ) {
    this.loaded = false;
    this.promise = new Promise(executor).then((p) => {
      this.loaded = true;
      return p;
    });
  }
}
