/**
 * Utility class use for calculating :
 *
 * Track - the whole container
 * Lane - each blocks inside the track
 * Content - content that lies inside the lane
 */
export class Track {
  private _laneSizes: Array<number> = [];
  private _laneStarts: number[] = [0];
  private _trackSize = 0;
  private _margin = 0.5;

  /**
   * Get track size
   * @returns track size
   */
  get trackSize (): number {
    return this._trackSize;
  }

  /**
   * Sets track size
   * @param value number of track size
   */
  set trackSize (value) {
    this.init(value, this.laneCount);
  }

  /**
   * Get lane count
   * @returns lane count
   */
  get laneCount (): number {
    return this.laneSizes.length;
  }

  /**
   * Sets lane count
   * @param value number of lane count
   */
  set laneCount (value) {
    this.init(this.trackSize, value);
  }

  /**
   * Get margin
   * @returns margin in pixel
   */
  get margin (): number {
    return this._margin;
  }

  /**
   * Sets cells margin
   * @param value number margin
   */
  set margin (value) {
    this._margin = value;
  }

  /**
   * Initialise track
   * @param trackSize track size
   * @param laneCount lane count
   * @returns {void}
   */
  public init (trackSize: number, laneCount: number): void {
    this._trackSize = trackSize;
    this._laneSizes = new Array(laneCount);
    this._laneStarts = new Array(laneCount); // For easy hit testing
    this._laneStarts[0] = 0;

    if (trackSize && laneCount) {
      let start = 0;
      const laneSize = (trackSize / laneCount);

      for (let i = 0; i < laneCount; ++i) {
        const end = start + laneSize;
        this._laneStarts[i] = (start | 0);
        this._laneSizes[i] = (end | 0) - (start | 0);
        start = end;
      }
    }
  }

  /**
   * Get lane start
   * @returns lane start position in pixel
   */
  get laneStarts (): number[] {
    return this._laneStarts;
  }

  /**
   * Get lane size
   * @returns lane size in pixel
   */
  get laneSizes (): number[] {
    return this._laneSizes;
  }

  /**
   * Get lane size
   * @param index of lane Array
   * @returns lane start position in pixel
   */
  private getLaneSize (index: number): number {
    return this.laneSizes[index] || 0;
  }

  /**
   * Get lane start position
   * @param index of lane Array
   * @returns lane start position in pixel
   */
  private getLaneStart (index: number): number {
    return this._laneStarts[index] || 0;
  }

  /**
   * Get lane end position
   * @param index of lane Array
   * @returns lane end position in pixel
   */
  private getLaneEnd (index: number): number {
    return this.getLaneStart(index) + this.getLaneSize(index);
  }

  /**
   * Get content size
   * @param index of lane Array
   * @returns content size in pixel
   */
  public getContentSize (index: number): number {
    const contentSize = this.getLaneSize(index) - this._margin - this._margin;
    return (contentSize > 0) ? contentSize : 0;
  }

  /**
   * Get content start position
   * @param index of lane Array
   * @returns content position in pixel
   */
  public getContentStart (index: number): number {
    return this.getLaneStart(index) + this._margin;
  }

  /**
   * Get content end position
   * @param index of lane Array
   * @returns content position in pixel
   */
  public getContentEnd (index: number): number {
    return this.getContentStart(index) + this.getContentSize(index);
  }

  /**
   * Finds lane's index using the mouse position in pixel
   * @param mousePixel current mouse position in pixel
   * @returns index of the lane
   */
  public hitTest (mousePixel: number): number {
    const laneSize = this.trackSize / this.laneCount;
    let index = Math.floor(mousePixel / laneSize);

    if (index >= 0 && index < this.laneCount) {
      if(mousePixel < this.getContentStart(index) || mousePixel >= this.getContentEnd(index)) {
        index = -1;
      }
    }
    else {
      index = -1;
    }

    return index;
  }
}
