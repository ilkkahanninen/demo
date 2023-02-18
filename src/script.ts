import { hold, join, linear } from "./scripting";

export const layerFx = join(
  linear(1.0, 0.0)(1.0),
  hold(0.0)(1.0),
  linear(0.0, 1.0)(1.0)
);
