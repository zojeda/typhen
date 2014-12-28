/* tslint:disable:interface-name no-unused-variable */

/// <reference path="./color/color.d.ts" />

declare function emitLog(text: string): void;

declare module Type {
  interface Range<T> {
    start: T;
    end: T;
  }

  interface Point {
    x: number;
    y: number;
    set(x: number, y: number): void;
  }

  interface Square {
    center: Point;
    margin?: number;

    /**
     * Size from 1 to 5 (highest).
     * @minimum 1
     * @maximum 5
     */
    size: integer;
  }

  interface ColoredSquare extends Square {
    /**
     * Default color is red.
     * @default Color.Red
     */
    color: Color;
    setColor(color: Color, callback?: (color: Color) => void): void;
  }

  interface SquareDictionary<T extends Square> {
    [index: string]: T;
  }
}

declare module Rpc {
  module Get {
    function getRange(start: Type.Point, dest: Type.Point): { range: Type.Range<number> };
  }

  module Post {
    function setOptions(options: { [index: string]: string }): boolean;
  }
}