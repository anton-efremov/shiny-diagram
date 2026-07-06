/**
 * @fileoverview Test environment shims for React Flow under jsdom.
 */

import "@testing-library/jest-dom/vitest";

class ResizeObserverMock implements ResizeObserver {
  observe(): void {}
  unobserve(): void {}
  disconnect(): void {}
}

class DOMMatrixReadOnlyMock {
  readonly a = 1;
  readonly b = 0;
  readonly c = 0;
  readonly d = 1;
  readonly e = 0;
  readonly f = 0;
  readonly m11 = 1;
  readonly m12 = 0;
  readonly m13 = 0;
  readonly m14 = 0;
  readonly m21 = 0;
  readonly m22 = 1;
  readonly m23 = 0;
  readonly m24 = 0;
  readonly m31 = 0;
  readonly m32 = 0;
  readonly m33 = 1;
  readonly m34 = 0;
  readonly m41 = 0;
  readonly m42 = 0;
  readonly m43 = 0;
  readonly m44 = 1;
  readonly is2D = true;
  readonly isIdentity = true;

  flipX(): DOMMatrix {
    return new DOMMatrix();
  }

  flipY(): DOMMatrix {
    return new DOMMatrix();
  }

  inverse(): DOMMatrix {
    return new DOMMatrix();
  }

  multiply(): DOMMatrix {
    return new DOMMatrix();
  }

  rotate(): DOMMatrix {
    return new DOMMatrix();
  }

  rotateAxisAngle(): DOMMatrix {
    return new DOMMatrix();
  }

  rotateFromVector(): DOMMatrix {
    return new DOMMatrix();
  }

  scale(): DOMMatrix {
    return new DOMMatrix();
  }

  scale3d(): DOMMatrix {
    return new DOMMatrix();
  }

  scaleNonUniform(): DOMMatrix {
    return new DOMMatrix();
  }

  skewX(): DOMMatrix {
    return new DOMMatrix();
  }

  skewY(): DOMMatrix {
    return new DOMMatrix();
  }

  toFloat32Array(): Float32Array {
    return new Float32Array(16);
  }

  toFloat64Array(): Float64Array {
    return new Float64Array(16);
  }

  toJSON(): Record<string, number | boolean> {
    return { is2D: true, isIdentity: true };
  }

  transformPoint(): DOMPoint {
    return new DOMPoint();
  }

  translate(): DOMMatrix {
    return new DOMMatrix();
  }
}

Object.defineProperty(window, "ResizeObserver", { value: ResizeObserverMock });
Object.defineProperty(window, "DOMMatrixReadOnly", { value: DOMMatrixReadOnlyMock });

Object.defineProperties(HTMLElement.prototype, {
  offsetWidth: {
    configurable: true,
    get() {
      return 800;
    },
  },
  offsetHeight: {
    configurable: true,
    get() {
      return 600;
    },
  },
});

Object.defineProperty(SVGElement.prototype, "getBBox", {
  configurable: true,
  value: () => new DOMRect(0, 0, 100, 40),
});
