class VecChange {
	private _callbacks: WeakMap<Vec, Set<(v: Vec) => void>>;

	constructor() {
		this._callbacks = new WeakMap();
	}

	add(vec: Vec, f: (v: Vec) => void) {
		return new Promise((resolve) => {
			if (!this._callbacks.has(vec)) {
				this._callbacks.set(vec, new Set());
			}
			this._callbacks.get(vec)?.add(f);
			resolve(null);
		});
	}

	dispatch(vec: Vec) {
		return new Promise((resolve) => {
			this._callbacks.get(vec)?.forEach((callback) => {
				callback(vec);
			});
			resolve(null);
		});
	}

	remove(vec: Vec, f: (v: Vec) => void) {
		return new Promise((resolve) => {
			this._callbacks.get(vec)?.delete(f);
			resolve(null);
		});
	}
}

let vecChanges: VecChange = new VecChange();

export class Vec {
	private _x: number;

	private _y: number;

	/**
	 * X coordinate
	 */
	set x(X: number) {
		this._x = X;
		this._call_change();
	}

	/**
	 * Y coordinate
	 */
	set y(Y: number) {
		this._y = Y;
		this._call_change();
	}

	private _call_change() {
		vecChanges.dispatch(this);
	}

	/**
	 * Registers a callback function to be called when this vector changes
	 * @param f Callback function that receives the updated vector
	 * @returns A function that removes the callback when called
	 */
	onChange(f: (v: Vec) => void) {
		vecChanges.add(this, f);
		return () => vecChanges.remove(this, f);
	}

	get x() {
		return this._x;
	}

	get y() {
		return this._y;
	}

	/**
	 * X coordinate
	 */
	get [0]() {
		return this._x;
	}

	/**
	 * Y coordinate
	 */
	get [1]() {
		return this._y;
	}

	/**
	 * Creates a new vector
	 * @param x Optional x coordinate (defaults to 0)
	 * @param y Optional y coordinate (defaults to 0)
	 * @returns A new Vec instance
	 */
	static new(x?: number, y?: number) {
		return new Vec(x, y);
	}

	/**
	 * Creates a new vector with coordinates (0,0)
	 * @returns A new zero vector
	 */
	static zero() {
		return Vec.new(0, 0);
	}

	/**
	 * Creates a copy of the given vector
	 * @param v Vector to copy
	 * @returns A new vector with the same coordinates
	 */
	static copy(v: Vec) {
		return Vec.new(v.x, v.y);
	}

	/**
	 * Creates a new vector
	 * @param x Optional x coordinate (defaults to 0)
	 * @param y Optional y coordinate (defaults to 0)
	 */
	constructor(x?: number, y?: number) {
		this._x = x || 0;
		this._y = y || 0;
	}

	/**
	 * Gets the squared magnitude of the vector
	 * @returns The squared magnitude (x² + y²)
	 */
	get magSq() {
		return this.x * this.x + this.y * this.y;
	}

	/**
	 * Gets the magnitude (length) of the vector
	 * @returns The magnitude of the vector
	 */
	get mag() {
		return Math.sqrt(this.magSq);
	}

	/**
	 * Gets the vector as an array [x, y]
	 * @returns Array containing [x, y]
	 */
	get array() {
		return [this.x, this.y];
	}

	/**
	 * Gets the angle of the vector in radians
	 * @returns The angle in radians
	 */
	get angle() {
		return Math.atan2(this.y, this.x);
	}

	/**
	 * Gets the perpendicular vector (rotated 90 degrees counter-clockwise)
	 * @returns A new perpendicular vector
	 */
	get perpendicular() {
		return Vec.new(-this.y, this.x);
	}

	/**
	 * Creates a normalized vector (unit vector) from the given vector
	 * @param v The vector to normalize
	 * @returns A new vector with same direction but magnitude of 1
	 */
	static normalized(v: Vec) {
		return Vec.new(v.x / v.mag, v.y / v.mag);
	}

	/**
	 * Adds two vectors
	 * @param a First vector
	 * @param b Second vector
	 * @returns A new vector representing the sum
	 */
	static add(a: Vec, b: Vec) {
		return Vec.new(a.x + b.x, a.y + b.y);
	}

	/**
	 * Subtracts the second vector from the first
	 * @param a First vector
	 * @param b Second vector to subtract
	 * @returns A new vector representing the difference
	 */
	static sub(a: Vec, b: Vec) {
		return Vec.new(a.x - b.x, a.y - b.y);
	}

	/**
	 * Adds a scalar to both components of a vector
	 * @param a The vector
	 * @param k The scalar to add
	 * @returns A new vector with the scalar added to both components
	 */
	static addK(a: Vec, k: number) {
		return Vec.new(a.x + k, a.y + k);
	}

	/**
	 * Subtracts a scalar from both components of a vector
	 * @param a The vector
	 * @param k The scalar to subtract
	 * @returns A new vector with the scalar subtracted from both components
	 */
	static subK(a: Vec, k: number) {
		return Vec.new(a.x - k, a.y - k);
	}

	/**
	 * Multiplies a vector by a scalar
	 * @param a The vector
	 * @param k The scalar multiplier
	 * @returns A new vector scaled by k
	 */
	static mulK(a: Vec, k: number) {
		return Vec.new(a.x * k, a.y * k);
	}

	/**
	 * Divides a vector by a scalar
	 * @param a The vector
	 * @param k The scalar divisor
	 * @returns A new vector divided by k
	 */
	static divK(a: Vec, k: number) {
		return Vec.new(a.x / k, a.y / k);
	}

	/**
	 * Calculates the dot product of two vectors
	 * @param a First vector
	 * @param b Second vector
	 * @returns The dot product (a scalar)
	 */
	static dot(a: Vec, b: Vec) {
		return a.x * b.x + a.y * b.y;
	}

	/**
	 * Calculates the cross product of two vectors
	 * @param a First vector
	 * @param b Second vector
	 * @returns The cross product (a scalar in 2D)
	 */
	static cross(a: Vec, b: Vec) {
		return a.x * b.y - a.y * b.x;
	}

	/**
	 * Linearly interpolates between two vectors
	 * @param a Start vector
	 * @param b End vector
	 * @param k Interpolation factor (0-1)
	 * @returns A new vector representing the interpolated point
	 */
	static lerp(a: Vec, b: Vec, k: number) {
		return Vec.new(a.x + (b.x - a.x) * k, a.y + (b.y - a.y) * k);
	}

	/**
	 * Calculates the angle between two vectors in radians
	 * @param a First vector
	 * @param b Second vector
	 * @returns The angle between the vectors in radians
	 */
	static angleBetween(a: Vec, b: Vec) {
		return Math.atan2(a.cross(b), a.dot(b));
	}

	/**
	 * Rotates a vector by the specified angle
	 * @param v The vector to rotate
	 * @param angle Rotation angle in radians
	 * @returns A new rotated vector
	 */
	static rotate(v: Vec, angle: number) {
		const cos = Math.cos(angle);
		const sin = Math.sin(angle);
		return Vec.new(v.x * cos - v.y * sin, v.x * sin + v.y * cos);
	}

	/**
	 * Limits a vector's magnitude to the specified maximum
	 * @param a The vector to limit
	 * @param max The maximum magnitude
	 * @returns A new vector with limited magnitude
	 */
	static limit(a: Vec, max: number) {
		return a.magSq > max * max ? Vec.normalized(a).mulK(max) : a.copy();
	}

	/**
	 * Sets the magnitude of a vector to the specified value
	 * @param a The vector to modify
	 * @param mag The target magnitude
	 * @returns A new vector with the specified magnitude
	 */
	static setMag(a: Vec, mag: number) {
		return Vec.normalized(a).mulK(mag);
	}

	/**
	 * Creates a vector with the minimum components of two vectors
	 * @param a First vector
	 * @param b Second vector
	 * @returns A new vector with minimum x and y values
	 */
	static min(a: Vec, b: Vec) {
		return Vec.new(Math.min(a.x, b.x), Math.min(a.y, b.y));
	}

	/**
	 * Creates a vector with the maximum components of two vectors
	 * @param a First vector
	 * @param b Second vector
	 * @returns A new vector with maximum x and y values
	 */
	static max(a: Vec, b: Vec) {
		return Vec.new(Math.max(a.x, b.x), Math.max(a.y, b.y));
	}

	/**
	 * Rounds up each component of a vector
	 * @param a The vector to ceil
	 * @returns A new vector with ceiling values
	 */
	static ceil(a: Vec) {
		return Vec.new(Math.ceil(a.x), Math.ceil(a.y));
	}

	/**
	 * Rounds each component of a vector to the nearest integer
	 * @param a The vector to round
	 * @returns A new vector with rounded values
	 */
	static round(a: Vec) {
		return Vec.new(Math.round(a.x), Math.round(a.y));
	}

	/**
	 * Rounds down each component of a vector
	 * @param a The vector to floor
	 * @returns A new vector with floored values
	 */
	static floor(a: Vec) {
		return Vec.new(Math.floor(a.x), Math.floor(a.y));
	}

	/**
	 * Reflects a vector across a normal
	 * @param a The vector to reflect
	 * @param normal The normal vector to reflect across
	 * @returns A new reflected vector
	 */
	static reflect(a: Vec, normal: Vec) {
		const n = Vec.normalized(normal);
		return Vec.sub(a, n.mulK(a.dot(n) * 2));
	}

	/**
	 * Projects a vector onto another vector
	 * @param a The vector to project
	 * @param onto The vector to project onto
	 * @returns A new vector representing the projection
	 */
	static projected(a: Vec, onto: Vec) {
		const unit = Vec.normalized(onto);
		return unit.mulK(a.dot(unit));
	}

	/**
	 * Checks if two vectors are equal
	 * @param a First vector
	 * @param b Second vector
	 * @param epsilon Optional tolerance for floating-point comparison
	 * @returns True if vectors are equal within epsilon
	 */
	static equals(a: Vec, b: Vec, epsilon = 0) {
		if (epsilon > 0) return Math.abs(a.x - b.x) <= epsilon && Math.abs(a.y - b.y) <= epsilon;
		return a.x === b.x && a.y === b.y;
	}

	/**
	 * Adds another vector to this vector
	 * @param a The vector to add
	 * @returns This vector for chaining
	 */
	add(a: Vec) {
		this._x += a.x;
		this._y += a.y;
		this._call_change();
		return this;
	}

	/**
	 * Subtracts another vector from this vector
	 * @param a The vector to subtract
	 * @returns This vector for chaining
	 */
	sub(a: Vec) {
		this._x -= a.x;
		this._y -= a.y;
		this._call_change();
		return this;
	}

	/**
	 * Calculates the dot product of this vector with another vector
	 * @param a The vector to dot with
	 * @returns The dot product (a scalar)
	 */
	dot(a: Vec) {
		return this.x * a.x + this.y * a.y;
	}

	/**
	 * Calculates the cross product of this vector with another vector
	 * @param a The vector to cross with
	 * @returns The cross product (a scalar in 2D)
	 */
	cross(a: Vec) {
		return this.x * a.y - this.y * a.x;
	}

	/**
	 * Adds a scalar to both components of this vector
	 * @param k The scalar to add
	 * @returns This vector for chaining
	 */
	addK(k: number) {
		this._x += k;
		this._y += k;
		this._call_change();
		return this;
	}

	/**
	 * Subtracts a scalar from both components of this vector
	 * @param k The scalar to subtract
	 * @returns This vector for chaining
	 */
	subK(k: number) {
		this._x -= k;
		this._y -= k;
		this._call_change();
		return this;
	}

	/**
	 * Multiplies this vector by a scalar
	 * @param k The scalar multiplier
	 * @returns This vector for chaining
	 */
	mulK(k: number) {
		this._x *= k;
		this._y *= k;
		this._call_change();
		return this;
	}

	/**
	 * Divides this vector by a scalar
	 * @param k The scalar divisor
	 * @returns This vector for chaining
	 */
	divK(k: number) {
		this._x /= k;
		this._y /= k;
		this._call_change();
		return this;
	}

	/**
	 * Copies coordinates from another vector to this vector
	 * @param a The vector to copy from
	 * @returns This vector for chaining
	 */
	to(a: Vec) {
		this._x = a.x;
		this._y = a.y;
		this._call_change();
		return this;
	}

	/**
	 * Creates a copy of this vector
	 * @returns A new vector with the same coordinates
	 */
	copy() {
		return Vec.new(this.x, this.y);
	}

	/**
	 * Creates a clone of this vector (alias for copy)
	 * @returns A new vector with the same coordinates
	 */
	clone() {
		return this.copy();
	}

	/**
	 * Linearly interpolates this vector toward another vector
	 * @param f Target vector
	 * @param k Interpolation factor (0-1)
	 * @returns This vector for chaining
	 */
	lerp(f: Vec, k: number) {
		this._x += (f.x - this.x) * k;
		this._y += (f.y - this.y) * k;
		this._call_change();
		return this;
	}

	/**
	 * Negates this vector (reverses its direction)
	 * @returns This vector for chaining
	 */
	negate() {
		this._x = -this.x;
		this._y = -this.y;
		this._call_change();
		return this;
	}

	/**
	 * Normalizes this vector to a unit vector (magnitude of 1)
	 * @returns This vector for chaining
	 */
	normalize() {
		const mag = this.mag;
		this._x /= mag;
		this._y /= mag;
		this._call_change();
		return this;
	}

	/**
	 * Calculates the angle between this vector and another vector
	 * @param a The vector to calculate angle with
	 * @returns The angle in radians
	 */
	angleBetween(a: Vec) {
		return Math.atan2(this.cross(a), this.dot(a));
	}

	/**
	 * Rotates this vector by the specified angle
	 * @param angle Rotation angle in radians
	 * @returns This vector for chaining
	 */
	rotate(angle: number) {
		const cos = Math.cos(angle);
		const sin = Math.sin(angle);
		const x = this.x * cos - this.y * sin;
		const y = this.x * sin + this.y * cos;
		this._x = x;
		this._y = y;
		this._call_change();
		return this;
	}

	/**
	 * Limits this vector's magnitude to the specified maximum
	 * @param max The maximum magnitude
	 * @returns This vector for chaining
	 */
	limit(max: number) {
		const magSq = this.magSq;
		if (magSq > max * max) {
			const factor = max / Math.sqrt(magSq);
			this._x *= factor;
			this._y *= factor;
			this._call_change();
		}
		return this;
	}

	/**
	 * Sets the magnitude of this vector to the specified value
	 * @param mag The target magnitude
	 * @returns This vector for chaining
	 */
	setMag(mag: number) {
		const factor = mag / this.mag;
		this._x *= factor;
		this._y *= factor;
		this._call_change();
		return this;
	}

	/**
	 * Sets this vector's components to the minimum of itself and another vector
	 * @param v The vector to compare with
	 * @returns This vector for chaining
	 */
	toMin(v: Vec) {
		this._x = Math.min(this.x, v.x);
		this._y = Math.min(this.y, v.y);
		this._call_change();
		return this;
	}

	/**
	 * Sets this vector's components to the maximum of itself and another vector
	 * @param v The vector to compare with
	 * @returns This vector for chaining
	 */
	toMax(v: Vec) {
		this._x = Math.max(this.x, v.x);
		this._y = Math.max(this.y, v.y);
		this._call_change();
		return this;
	}

	/**
	 * Rounds down each component of this vector
	 * @returns This vector for chaining
	 */
	floor() {
		this._x = Math.floor(this.x);
		this._y = Math.floor(this.y);
		this._call_change();
		return this;
	}

	/**
	 * Rounds up each component of this vector
	 * @returns This vector for chaining
	 */
	ceil() {
		this._x = Math.ceil(this.x);
		this._y = Math.ceil(this.y);
		this._call_change();
		return this;
	}

	/**
	 * Rounds each component of this vector to the nearest integer
	 * @returns This vector for chaining
	 */
	round() {
		this._x = Math.round(this.x);
		this._y = Math.round(this.y);
		this._call_change();
		return this;
	}

	/**
	 * Transforms this vector to its perpendicular (rotates 90 degrees counter-clockwise)
	 * @returns This vector for chaining
	 */
	toPerpendicular() {
		const x = this.x;
		this._x = -this.y;
		this._y = x;
		this._call_change();
		return this;
	}

	/**
	 * Reflects this vector across a normal
	 * @param normal The normal vector to reflect across
	 * @returns This vector for chaining
	 */
	reflect(normal: Vec) {
		const n = Vec.normalized(normal);
		return this.sub(n.mulK(this.dot(n) * 2));
	}

	/**
	 * Projects this vector onto another vector
	 * @param onto The vector to project onto
	 * @returns This vector for chaining
	 */
	project(onto: Vec) {
		const unit = Vec.normalized(onto);
		return this.to(unit.mulK(this.dot(unit)));
	}

	/**
	 * Checks if this vector equals another vector
	 * @param v The vector to compare with
	 * @param epsilon Optional tolerance for floating-point comparison
	 * @returns True if vectors are equal within epsilon
	 */
	equals(v: Vec, epsilon = 0) {
		if (epsilon > 0) return Math.abs(this.x - v.x) <= epsilon && Math.abs(this.y - v.y) <= epsilon;
		return this.x === v.x && this.y === v.y;
	}

	/**
	 * Sets this vector to zero (0,0)
	 * @returns This vector for chaining
	 */
	zero() {
		this._x = 0;
		this._y = 0;
		this._call_change();
		return this;
	}

	/**
	 * Sets the coordinates of this vector
	 * @param x Optional x coordinate (defaults to 0)
	 * @param y Optional y coordinate (defaults to 0)
	 * @returns This vector for chaining
	 */
	set(x?: number, y?: number) {
		this._x = x || 0;
		this._y = y || 0;
		this._call_change();
		return this;
	}
}
