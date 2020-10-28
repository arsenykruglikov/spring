interface InterpolatorOptions {
  stiffness?: number;
  damping?: number;
  maxVelocity?: number;
  mass?: number;
}

interface CallbackParam {
  x: number;
  deltaX: number;
  velocity: number;
}

type Callback = (params: CallbackParam) => void;

export default class Spring {
  private mass: number;

  private stiffness: number;

  private damping: number;

  private maxVelocity: number;

  // private initialVelocity = 0;

  private startTime?: number;

  private x = 0;

  private velocity = 0;

  private callback: Callback;

  private previousTimestamp = 0;

  private rAFId?: number;

  private readonly epsilon = 1e-3;

  private readonly callbackParam: CallbackParam = { deltaX: 0, velocity: this.velocity, x: this.x };

  private get springForce(): number {
    const nativeForce = Math.abs(this.x * this.stiffness);
    const boundedForce = 2 * this.maxVelocity * Math.sqrt(this.stiffness * this.mass);

    return Math.min(nativeForce, boundedForce) * Math.sign(this.x * this.stiffness);
  }

  private get dampingForce(): number {
    return 2 * this.damping * this.velocity * Math.sqrt(this.stiffness * this.mass);
  }

  private getDeltaVelocity(deltaTime: number): number {
    return ((this.springForce - this.dampingForce) * deltaTime) / this.mass;
  }

  constructor(
    callback: Callback,
    { damping = 1, stiffness = 100, maxVelocity = 1000, mass = 1 }: InterpolatorOptions = {
      damping: 1,
      stiffness: 100,
      maxVelocity: 1000,
      mass: 10,
    }
  ) {
    this.damping = damping;
    this.maxVelocity = maxVelocity / 1000;
    this.stiffness = stiffness;
    this.mass = mass;
    this.callback = callback;
  }

  private stop(): void {
    this.previousTimestamp = 0;
    this.x = 0;
    this.velocity = 0;
    if (this.rAFId !== undefined) {
      cancelAnimationFrame(this.rAFId);
    }
    this.rAFId = undefined;
    this.callbackParam.deltaX = 0;
    this.callbackParam.velocity = this.velocity;
    this.callbackParam.x = this.x;
    this.callback(this.callbackParam);
    if (this.startTime) {
      console.log('Animation took:', performance.now() - this.startTime);
    }
    this.startTime = undefined;
  }

  private animate = (timestamp: number) => {
    const deltaTime = Math.max(timestamp - this.previousTimestamp, 0) / 1000;

    this.previousTimestamp = timestamp;

    this.velocity += this.getDeltaVelocity(deltaTime);

    const { velocity } = this;

    const deltaX = deltaTime * velocity;

    this.x -= deltaX;

    this.callbackParam.deltaX = deltaX;
    this.callbackParam.velocity = velocity;
    this.callbackParam.x = this.x;

    this.callback(this.callbackParam);

    if (Math.abs(this.springForce) > this.epsilon) {
      this.rAFId = requestAnimationFrame(this.animate);
    } else {
      this.stop();
    }
  };

  go(units: number): void {
    this.x += units / 1000;

    if (this.previousTimestamp === 0) {
      this.previousTimestamp = performance.now();
    }

    if (this.startTime === undefined) {
      this.startTime = performance.now();
    }

    if (this.rAFId === undefined) {
      this.rAFId = requestAnimationFrame(this.animate);
    }
  }
}
