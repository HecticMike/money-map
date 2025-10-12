interface ExtendableEvent extends Event {
  waitUntil(fn: Promise<unknown>): void;
}

declare var ExtendableEvent: {
  prototype: ExtendableEvent;
  new (type: string, init?: EventInit): ExtendableEvent;
};
